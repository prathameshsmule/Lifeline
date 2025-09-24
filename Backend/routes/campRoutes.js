import express from 'express'
import Camp from '../models/Camp.js'
import Donor from '../models/Donor.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Add New Camp
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, location, date, organizerName, organizerContact, proName, hospitalName } = req.body
    if (!name) return res.status(400).json({ message: 'Camp name is required' })

    const existing = await Camp.findOne({ name })
    if (existing) return res.status(400).json({ message: 'Camp already exists' })

    const camp = new Camp({ name, location, date, organizerName, organizerContact, proName, hospitalName })
    await camp.save()
    res.status(201).json({ message: 'Camp added successfully', camp })
  } catch (err) {
    res.status(500).json({ message: 'Error adding camp', error: err.message })
  }
})

// Get All Camps with donor count
router.get('/', async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: 1 })

    // Count donors per camp using _id
    const campsWithCounts = await Promise.all(
      camps.map(async (camp) => {
        const count = await Donor.countDocuments({ camp: camp._id })
        return { ...camp._doc, donorCount: count }
      })
    )

    res.json(campsWithCounts)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camps', error: err.message })
  }
})

// Update coupons for a camp
router.put('/:id/coupons', verifyToken, async (req, res) => {
  try {
    const { coupons } = req.body
    const camp = await Camp.findByIdAndUpdate(req.params.id, { $set: { coupons } }, { new: true })
    if (!camp) return res.status(404).json({ message: 'Camp not found' })
    res.json({ message: 'Coupons updated successfully', camp })
  } catch (err) {
    res.status(500).json({ message: 'Error updating coupons', error: err.message })
  }
})

export default router
