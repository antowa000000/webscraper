const input    = document.getElementById('url')
const btn      = document.getElementById('go')
const overlay  = document.getElementById('overlay')
const closeBtn = document.getElementById('close')
const options  = document.querySelectorAll('.option')
const controls = document.getElementById('controls')
const reopen   = document.getElementById('reopen')
const dl       = document.getElementById('download')
const output   = document.getElementById('output')

let format = null
let lastData = null

btn.addEventListener('click', () => {
  if (!input.value.trim()) return
  openModal()
})

function openModal() {
  overlay.hidden = false
}

function closeModal() {
  overlay.hidden = true
}

closeBtn.addEventListener('click', closeModal)
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal() })
reopen.addEventListener('click', openModal)

options.forEach(opt => {
  opt.addEventListener('click', () => {
    options.forEach(o => o.classList.remove('selected'))
    opt.classList.add('selected')
    format = opt.dataset.format
    closeModal()
    runExtraction()
  })
})

async function runExtraction() {
  const url = input.value.trim()
  if (!url || !format) return

  controls.hidden = false
  dl.hidden = true
  output.textContent = 'extracting...'

  try {
    const useAI = format === 'ai'
    const res = await fetch('/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, useAI })
    })
    lastData = await res.json()
    output.textContent = JSON.stringify(lastData, null, 2)
    dl.hidden = false
  } catch (e) {
    output.textContent = 'error: ' + e.message
  }
}

dl.addEventListener('click', async () => {
  const url = input.value.trim()
  if (!url || !lastData) return

  if (format === 'json') {
    downloadBlob(
      new Blob([JSON.stringify(lastData, null, 2)], { type: 'application/json' }),
      'data.json'
    )
    return
  }

  if (format === 'csv') {
    const keys = Object.keys(lastData[0] || {})
    const rows = [keys.join(','), ...lastData.map(r =>
      keys.map(k => `"${String(r[k] || '').replace(/"/g, '""')}"`).join(',')
    )]
    downloadBlob(
      new Blob([rows.join('\n')], { type: 'text/csv' }),
      'data.csv'
    )
    return
  }

  const useAI = format === 'ai'
  const res = await fetch('/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, useAI })
  })
  downloadBlob(await res.blob(), 'data.xlsx')
})

function downloadBlob(blob, name) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
}