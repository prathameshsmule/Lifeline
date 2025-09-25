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
  origin: function(origin, callback){
    // allow requests with no origin (mobile apps, curl) or your frontend domains
    const allowed = [
      process.env.FRONTEND_URL,
      'https://www.lifelinebloodcenter.org',
      'https://lifelinebloodcenter.org',
      'http://localhost:3000'
    ];
    if(!origin) return callback(null, true);
    if(allowed.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS not allowed by server'));
  },
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));


app.use(express.json())

// DB connection and admin initialization
connectDB().then(() => initializeAdmin())

// Root test route
app.get("/", (req, res) => res.send("✅ Blood Donation Backend is running!"))

// Feature routes
app.use('/api/donors', donorRoutes)
app.use('/api/camps', campRoutes)
app.use('/api/admin', adminRoutes)

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
