import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Admin from '../models/Admin.js'

const router = express.Router()

// Register Admin (optional, mostly handled by initializer)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body
    const existing = await Admin.findOne({ username })
    if (existing) return res.status(400).json({ message: 'Admin already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const admin = await Admin.create({ username, password: hashedPassword })

    res.status(201).json({ message: 'Admin created successfully', admin })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// Login Admin
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const admin = await Admin.findOne({ username })
    if (!admin) return res.status(404).json({ message: 'Admin not found' })

    const isMatch = await bcrypt.compare(password, admin.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    )

    res.json({ success: true, token })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

export default router
