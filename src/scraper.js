import axios from 'axios'
import * as cheerio from 'cheerio'
import puppeteer from 'puppeteer'
import { extractWithAI, cleanWithAI, detectCollection, extractItemsWithAI } from './ai.js'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function withBrowser(fn) {
  const browser = await puppeteer.launch({ headless: true })
  try { return await fn(browser) } finally { await browser.close() }
}

async function openPage(browser, url, waitUntil = 'domcontentloaded') {
  const page = await browser.newPage()
  await page.setUserAgent(UA)
  await page.goto(url, { waitUntil, timeout: 30000 })
  return page
}

function parseStatic(html) {
  const $ = cheerio.load(html)
  $('script, style, nav, footer, header').remove()

  const tableRows = []
  $('table').each((_, table) => {
    const headers = []
    $(table).find('tr').first().find('th, td').each((_, c) => headers.push($(c).text().trim()))
    $(table).find('tr').slice(1).each((_, row) => {
      const obj = {}
      $(row).find('td').each((i, c) => { obj[headers[i] || i] = $(c).text().trim() })
      if (Object.values(obj).some(v => v)) tableRows.push(obj)
    })
  })
  if (tableRows.length >= 3) return tableRows

  for (const sel of ['article', '.product', '.item', '.card', '.post', '.result']) {
    const els = $(sel)
    if (els.length >= 3) {
      const rows = []
      els.each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim()
        if (text) rows.push({ content: text.slice(0, 200), link: $(el).find('a').first().attr('href') || '' })
      })
      if (rows.length) return rows
    }
  }

  const listRows = []
  $('ul, ol').each((_, list) => {
    $(list).find('li').each((_, li) => {
      const text = $(li).text().trim()
      if (text.length > 2 && text.length < 500) listRows.push({ item: text })
    })
  })
  if (listRows.length >= 3) return listRows

  return null
}

function getPageText($) {
  $('script, style, nav, footer, header, [class*="cookie"], [class*="banner"], [class*="popup"], [class*="ad-"]').remove()
  const main = $('main, #main, #content, .content, [role="main"], #app, #root').first()
  return (main.length ? main : $('body')).text().replace(/\s+/g, ' ').trim()
}

async function scrapeItemLinks(browser, links, itemType) {
  const items = []
  for (const link of links) {
    try {
      const page = await openPage(browser, link.href)
      const pageText = await page.evaluate(() =>
        document.body.innerText.replace(/\s+/g, ' ').trim().slice(0, 2000)
      )
      await page.close()
      items.push({ name: link.text, url: link.href, pageText })
    } catch {}
  }
  return extractItemsWithAI(items, itemType)
}

async function smartScrape(url) {
  return withBrowser(async browser => {
    const page = await openPage(browser, url, 'networkidle2')
    await new Promise(r => setTimeout(r, 2000))
    const { text, links } = await page.evaluate(() => ({
      text: document.body.innerText.replace(/\s+/g, ' ').trim(),
      links: [...document.querySelectorAll('a[href]')]
        .filter(a => a.href.startsWith('http') && a.textContent.trim().length > 2)
        .map(a => ({ href: a.href, text: a.textContent.replace(/\s+/g, ' ').trim() }))
        .slice(0, 60)
    }))
    await page.close()

    const collection = await detectCollection(text, links)
    if (collection.type === 'collection' && collection.itemLinks?.length) {
      return scrapeItemLinks(browser, collection.itemLinks.slice(0, 10), collection.itemType)
    }
    return extractWithAI(text.slice(0, 12000))
  })
}

export async function scrape(url, useAI = false) {
  try {
    const { data } = await axios.get(url, { headers: { 'User-Agent': UA }, timeout: 10000 })
    const result = parseStatic(data)
    if (result) return useAI ? cleanWithAI(result) : result
  } catch {}

  if (useAI) return smartScrape(url)

  return withBrowser(async browser => {
    const page = await openPage(browser, url, 'networkidle2')
    await new Promise(r => setTimeout(r, 2000))
    const html = await page.content()
    await page.close()
    return parseStatic(html) ?? [{ result: 'no structured data found — try ai format' }]
  })
}