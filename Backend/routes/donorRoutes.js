import express from 'express'
import Donor from '../models/Donor.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// ✅ Helper: Calculate age from DOB
const calculateAge = (dob) => {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// ✅ Register Donor
router.post('/', async (req, res) => {
  try {
    const { name, dob, weight, bloodGroup, email, phone, address, camp } = req.body

    const age = calculateAge(dob)

    if (age < 18) return res.status(400).json({ message: 'Age must be 18 or above' })
    if (weight < 50) return res.status(400).json({ message: 'Minimum weight must be 50kg' })
    if (!camp) return res.status(400).json({ message: 'Camp is required' })

    const donor = new Donor({
      name,
      dob,
      age,
      weight,
      bloodGroup,
      email,
      phone,
      address,
      camp // ✅ should be campId (_id)
    })

    await donor.save()
    res.status(201).json({ message: 'Donor registered successfully', donor })
  } catch (error) {
    res.status(500).json({ message: 'Error registering donor', error: error.message })
  }
})

// ✅ Get All Donors
router.get('/', verifyToken, async (req, res) => {
  try {
    const donors = await Donor.find()
      .populate('camp', 'name location date') // ✅ optional: show camp details
      .sort({ createdAt: -1 })

    res.json(donors)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donors', error: error.message })
  }
})

// ✅ Get Donors by CampId
router.get('/camp/:campId', verifyToken, async (req, res) => {
  try {
    const { campId } = req.params
    const donors = await Donor.find({ camp: campId })
      .populate('camp', 'name location date')
      .sort({ createdAt: -1 })

    res.json(donors)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donors by camp', error: error.message })
  }
})

// ✅ Update Donor
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const updateFields = { ...req.body }

    if (updateFields.dob) {
      updateFields.age = calculateAge(updateFields.dob)
    }

    const updatedDonor = await Donor.findByIdAndUpdate(id, updateFields, { new: true })

    if (!updatedDonor) return res.status(404).json({ message: 'Donor not found' })

    res.json({ message: 'Donor updated successfully', donor: updatedDonor })
  } catch (error) {
    res.status(500).json({ message: 'Error updating donor', error: error.message })
  }
})

// ✅ Delete Donor
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Donor.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: 'Donor not found' })

    res.json({ message: 'Donor deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Error deleting donor', error: err.message })
  }
})

export default router
