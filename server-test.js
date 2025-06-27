const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const PORT = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.json({
    message: 'Classroom Manager API is running!',
    version: '1.0.0'
  })
})

app.listen(PORT, () => {
  console.log(`Running Express server on Port ${PORT} . . .`)
})
