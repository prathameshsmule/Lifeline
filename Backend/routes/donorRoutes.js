import express from 'express'
import mongoose from 'mongoose'
import Donor from '../models/Donor.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// ✅ Get donors by camp
router.get('/camp/:campId', verifyToken, async (req, res) => {
  try {
    const { campId } = req.params
    if (!mongoose.Types.ObjectId.isValid(campId)) return res.status(400).json({ message: 'Invalid Camp ID' })

    const donors = await Donor.find({ camp: campId }).sort({ name: 1 }) // Sort alphabetically
    res.json(donors)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching donors', error: err.message })
  }
})

// ✅ Update donor (remark or other fields)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid Donor ID' })

    const donor = await Donor.findByIdAndUpdate(id, req.body, { new: true })
    if (!donor) return res.status(404).json({ message: 'Donor not found' })

    res.json({ message: 'Donor updated successfully', donor })
  } catch (err) {
    res.status(500).json({ message: 'Error updating donor', error: err.message })
  }
})

// ✅ Delete donor
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid Donor ID' })

    const donor = await Donor.findByIdAndDelete(id)
    if (!donor) return res.status(404).json({ message: 'Donor not found' })

    res.json({ message: 'Donor deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting donor', error: err.message })
  }
})

// ✅ Get single donor (optional, useful for editing)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid Donor ID' })

    const donor = await Donor.findById(id)
    if (!donor) return res.status(404).json({ message: 'Donor not found' })

    res.json(donor)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching donor', error: err.message })
  }
})

export default router
