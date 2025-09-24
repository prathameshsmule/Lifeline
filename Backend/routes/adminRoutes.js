import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import Admin from '../models/Admin.js'

const router = express.Router()

// Optional: Register Admin (only for initial setup)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

    const existing = await Admin.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Admin already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const admin = await Admin.create({ email, password: hashedPassword })

    res.status(201).json({ message: 'Admin created successfully', admin })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

    const admin = await Admin.findOne({ email })
    if (!admin) return res.status(404).json({ message: 'Admin not found' })

    const isMatch = await bcrypt.compare(password, admin.password)
    console.log("Entered password:", password)
    console.log("Stored hashed password:", admin.password)
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' } // Set a longer expiry if desired
    )

    res.json({ success: true, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

export default router

