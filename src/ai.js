import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function callAI(prompt, maxTokens = 2048) {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }]
  })
  return JSON.parse(msg.content[0].text.replace(/```json\n?|```/g, '').trim())
}

export async function extractWithAI(content) {
  try {
    return await callAI(`Extract all meaningful structured data from the text below into a JSON array of objects with consistent keys. Return ONLY raw valid JSON, no explanation. If nothing found return [].

TEXT:
${content.slice(0, 12000)}`)
  } catch { return [{ result: 'no structured data could be extracted' }] }
}

export async function cleanWithAI(data) {
  const sample = data.slice(0, 20)
  try {
    const cleaned = await callAI(`Clean and improve this JSON array. Return ONLY raw valid JSON. Rename unclear keys, remove noise, standardise values, preserve all rows.

DATA (${sample.length} of ${data.length} rows):
${JSON.stringify(sample, null, 2)}`, 4096)
    const keys = Object.keys(cleaned[0])
    return data.map((row, i) => {
      if (i < cleaned.length) return cleaned[i]
      const obj = {}
      Object.keys(row).forEach((k, j) => { obj[keys[j] || k] = row[k] })
      return obj
    })
  } catch { return data }
}

export async function detectCollection(text, links) {
  try {
    return await callAI(`Analyze this webpage. Return ONLY valid JSON.

Does this page contain a collection of comparable items? Could be anything: products, stocks, videos, articles, athletes, songs, jobs, restaurants, etc. If yes, identify the item type and which links lead to individual item pages.

Return: {"type": "collection", "itemType": "1-2 word description", "itemLinks": [{"href": "...", "text": "..."}]}
If not a collection: {"type": "single", "itemType": "", "itemLinks": []}

PAGE TEXT:
${text.slice(0, 3000)}

PAGE LINKS:
${JSON.stringify(links.slice(0, 40))}`)
  } catch { return { type: 'single', itemType: '', itemLinks: [] } }
}

export async function extractItemsWithAI(items, itemType) {
  try {
    return await callAI(`Extract data from ${items.length} ${itemType} pages. For each item extract the most relevant data points. Return ONLY a valid JSON array with consistent keys. No markdown, no explanation.

ITEMS:
${items.map((item, i) => `--- Item ${i + 1}: ${item.name}\n${item.pageText}`).join('\n\n')}`, 4096)
  } catch { return items.map(i => ({ name: i.name, url: i.url })) }
}