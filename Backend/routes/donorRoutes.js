// routes/donorRoutes.js
import express from 'express'
import mongoose from 'mongoose'
import Donor from '../models/Donor.js'
import { verifyToken } from '../middleware/authMiddleware.js' // keep for protected routes

const router = express.Router()

// PUBLIC: Register donor (POST /api/donors)
router.post('/', async (req, res) => {
  try {
    const payload = req.body

    // Basic validation
    if (!payload.name || !payload.age || !payload.bloodGroup || !payload.phone || !payload.camp) {
      return res.status(400).json({ message: 'Missing required fields: name, age, bloodGroup, phone and camp' })
    }

    // If camp passed as string id, keep it; otherwise find by name (optional)
    // Ensure camp is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(payload.camp)) {
      return res.status(400).json({ message: 'Invalid camp id' })
    }

    const donor = new Donor(payload)
    await donor.save()
    res.status(201).json({ message: 'Donor registered successfully', donor })
  } catch (err) {
    console.error('Error registering donor', err)
    res.status(500).json({ message: 'Error registering donor', error: err.message })
  }
})

// PROTECTED: Get donors by camp (GET /api/donors/camp/:campId)
router.get('/camp/:campId', verifyToken, async (req, res) => {
  try {
    const { campId } = req.params
    if (!mongoose.Types.ObjectId.isValid(campId)) return res.status(400).json({ message: 'Invalid Camp ID' })
    const donors = await Donor.find({ camp: campId }).sort({ name: 1 })
    res.json(donors)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching donors', error: err.message })
  }
})

// PROTECTED: Update donor
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

// PROTECTED: Delete donor
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

// PROTECTED: Get a single donor
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
