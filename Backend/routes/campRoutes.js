import express from 'express';
import mongoose from 'mongoose';
import Camp from '../models/Camp.js';
import Donor from '../models/Donor.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Add New Camp (admin)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, location, date, organizerName, organizerContact, proName, hospitalName } = req.body;
    if (!name) return res.status(400).json({ message: 'Camp name is required' });

    const existing = await Camp.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Camp already exists' });

    const camp = new Camp({ name, location, date, organizerName, organizerContact, proName, hospitalName });
    await camp.save();
    res.status(201).json({ message: 'Camp added successfully', camp });
  } catch (err) {
    res.status(500).json({ message: 'Error adding camp', error: err.message });
  }
});

// AFTER (public)
router.get('/', async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: -1 });
    res.json(camps);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camps', error: err.message });
  }
});

// Delete camp (admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Camp ID' });
    }

    // 2) Ensure the camp exists
    const camp = await Camp.findById(id);
    if (!camp) {
      return res.status(404).json({ message: 'Camp not found' });
    }

    // 3) (Optional but recommended) remove donors tied to this camp
    //    If you want to keep donors, comment this out.
    await Donor.deleteMany({ camp: id });

    // 4) Delete the camp
    await Camp.findByIdAndDelete(id);

    return res.json({ message: 'Camp deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting camp', error: err.message });
  }
});


// Admin: All camps with donor counts
router.get('/with-count', verifyToken, async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: 1 });
    const campsWithCounts = await Promise.all(
      camps.map(async (camp) => {
        const donorCount = await Donor.countDocuments({ camp: camp._id });
        return { ...camp.toObject(), donorCount };
      })
    );
    res.json(campsWithCounts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camps', error: err.message });
  }
});

// Get single camp with donor count
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid Camp ID' });

    const camp = await Camp.findById(id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });

    const donorCount = await Donor.countDocuments({ camp: camp._id });
    res.json({ ...camp.toObject(), donorCount });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camp', error: err.message });
  }
});
// BEFORE (protected)
router.get('/', verifyToken, async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: -1 });s
    res.json(camps);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camps', error: err.message });
  }
});


export default router;
