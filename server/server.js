const express = require('express')
const fs = require('fs')
const helmet = require('helmet')
const PORT = process.env.PORT || 3001

const app = express()
app.use(helmet())

app.get('/video', (req, res) => {
  const range = req.headers.range

  if (!range) {
    res.status(400).send('Requires Range header')
  }

  // Byron get file from S3 with UUID for path
  const path = 'assets/sample.mp4'
  const stat = fs.statSync(path)
  const videoSize = stat.size

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = 10 ** 6 // 1MB
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)

  // Headers
  const contentLength = end - start + 1
  const head = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  }

  // HTTP Status 206 Partial Content
  res.writeHead(206, head)

  const videoStream = fs.createReadStream(path, { start, end })

  videoStream.pipe(res)
})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}...`)
})
