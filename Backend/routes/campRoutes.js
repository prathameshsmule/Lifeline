import express from 'express'
import Camp from '../models/Camp.js'
import Donor from '../models/Donor.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// ✅ Add New Camp (with coupons support)
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      name,
      location,
      date,
      organizerName,
      organizerContact,
      proName,
      hospitalName
  
    } = req.body

    if (!name) return res.status(400).json({ message: 'Camp name is required' })

    const existing = await Camp.findOne({ name })
    if (existing) return res.status(400).json({ message: 'Camp already exists' })

    const camp = new Camp({
      name,
      location,
      date,
      organizerName,
      organizerContact,
      proName,
      hospitalName
     
    })

    await camp.save()

    res.status(201).json({ message: 'Camp added successfully', camp })
  } catch (err) {
    res.status(500).json({ message: 'Error adding camp', error: err.message })
  }
})

// ✅ Get All Camps with donor count (and coupons included)
router.get('/', async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: 1 })

    // Aggregate donor counts per camp
    const donorCounts = await Donor.aggregate([
      {
        $group: {
          _id: '$camp',
          count: { $sum: 1 }
        }
      }
    ])

    // Create map of campName -> count
    const countMap = {}
    donorCounts.forEach(item => {
      countMap[item._id] = item.count
    })

    // Add donorCount to each camp object
    const campsWithCounts = camps.map(camp => ({
      ...camp._doc,
      donorCount: countMap[camp.name] || 0
    }))

    res.json(campsWithCounts)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camps with donor count', error: err.message })
  }
})

// ✅ Add / Update Coupons for a Camp
router.put('/:id/coupons', verifyToken, async (req, res) => {
  try {
    const { coupons } = req.body
    const camp = await Camp.findByIdAndUpdate(
      req.params.id,
      { $set: { coupons } },
      { new: true }
    )
    if (!camp) return res.status(404).json({ message: 'Camp not found' })
    res.json({ message: 'Coupons updated successfully', camp })
  } catch (err) {
    res.status(500).json({ message: 'Error updating coupons', error: err.message })
  }
})

export default router
