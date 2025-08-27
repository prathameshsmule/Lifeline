import express from 'express'

const router = express.Router()

// Example routes
router.get('/status', (req, res) => {
  res.json({ success: true, message: 'API status OK ✅' })
})

router.get('/version', (req, res) => {
  res.json({ version: '1.0.0', author: 'WorknAI' })
})

export default router
