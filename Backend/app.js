import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import connectDB from './config/db.js'
import { initializeAdmin } from './models/Admin.js'

import donorRoutes from './routes/donorRoutes.js'
import campRoutes from './routes/campRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

dotenv.config()

const app = express()
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://www.lifelinebloodcenter.org', // make sure this is the correct URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // add headers like Authorization if you're passing tokens
  credentials: true
}));

app.use(express.json())

// ✅ Connect to DB and initialize admin
connectDB().then(() => initializeAdmin())

// Root test route
app.get("/", (req, res) => {
  res.send("✅ Blood Donation Backend is running!")
})

// Health-check
app.get('/api', (req, res) => {
  res.json({ message: 'API is working 🚀' })
})

// Feature routes
app.use('/donors', donorRoutes)
app.use('/admin', adminRoutes)
app.use('/camps', campRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
