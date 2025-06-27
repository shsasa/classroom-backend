const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

// Simple CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Test server is running!' })
})

// Test PATCH route
app.patch('/test-patch', (req, res) => {
  res.json({ message: 'PATCH method works!' })
})

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`)
})
