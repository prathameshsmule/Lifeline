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

// ✅ Delete a Camp by ID (and all its donors)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const camp = await Camp.findById(req.params.id)
    if (!camp) return res.status(404).json({ message: 'Camp not found' })

    // Delete all donors linked to this camp
    await Donor.deleteMany({ camp: camp._id })

    // Delete the camp itself
    await camp.deleteOne()

    res.json({ message: '⚠️ Camp and all its donors have been deleted successfully.' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting camp', error: err.message })
  }
})

export default router
