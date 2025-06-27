const router = require('express').Router()

router.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint works' })
})

router.get('/test', (req, res) => {
  res.json({ message: 'Auth test endpoint works' })
})

module.exports = router
