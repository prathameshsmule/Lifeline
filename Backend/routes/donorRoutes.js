import express from 'express'
import Donor from '../models/Donor.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get donors by camp
router.get('/camp/:campId', verifyToken, async (req, res) => {
  try {
    const donors = await Donor.find({ camp: req.params.campId })
    res.json(donors)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching donors', error: err.message })
  }
})

// Update donor (remark, info)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!donor) return res.status(404).json({ message: 'Donor not found' })
    res.json(donor)
  } catch (err) {
    res.status(500).json({ message: 'Error updating donor', error: err.message })
  }
})

// Delete donor
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id)
    if (!donor) return res.status(404).json({ message: 'Donor not found' })
    res.json({ message: 'Donor deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting donor', error: err.message })
  }
})

export default router
