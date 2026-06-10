import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { scrape } from './src/scraper.js'
import { toExcel } from './src/exporter.js'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.post('/scrape', async (req, res) => {
  const { url, useAI } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })
  try {
    const data = await scrape(url, useAI)
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})
app.post('/export', async (req, res) => {
  const { url, useAI } = req.body
  if (!url) return res.status(400).json({ error: 'URL required' })
  try {
    const data = await scrape(url, useAI)
    const wb = await toExcel(data)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx')
    await wb.xlsx.write(res)
    res.end()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})
app.listen(3000, () => console.log('http://localhost:3000'))