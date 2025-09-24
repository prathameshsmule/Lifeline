import express from 'express';
import mongoose from 'mongoose';
import Camp from '../models/Camp.js';
import Donor from '../models/Donor.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/* -----------------  PUBLIC ROUTES  ----------------- */

// ✅ Add New Camp (admin protected)
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

// ✅ Public list of camps (used by donor registration form)
router.get('/', async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: 1 });
    res.json(camps);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camps', error: err.message });
  }
});

/* -----------------  ADMIN/PROTECTED ROUTES  ----------------- */

// ✅ All camps with donor counts (for admin dashboard)
router.get('/with-count', verifyToken, async (req, res) => {
  try {
    const camps = await Camp.find().sort({ date: 1 });

    const campsWithCounts = await Promise.all(
      camps.map(async (camp) => {
        const count = await Donor.countDocuments({ camp: camp._id });
        return { ...camp.toObject(), donorCount: count };
      })
    );

    res.json(campsWithCounts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camps', error: err.message });
  }
});

// ✅ Update coupons for a camp
router.put('/:id/coupons', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid Camp ID' });

    const { coupons } = req.body;
    const camp = await Camp.findByIdAndUpdate(id, { $set: { coupons } }, { new: true });

    if (!camp) return res.status(404).json({ message: 'Camp not found' });

    res.json({ message: 'Coupons updated successfully', camp });
  } catch (err) {
    res.status(500).json({ message: 'Error updating coupons', error: err.message });
  }
});


router.get('/', async (req, res) => {
  const camps = await Camp.find().sort({ date: 1 });
  res.json(camps);
});

// ✅ Get single camp with donor count
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid Camp ID' });

    const camp = await Camp.findById(id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });

    const donorCount = await Donor.countDocuments({ camp: camp._id });
    res.json({ ...camp.toObject(), donorCount });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camp', error: err.message });
  }
});

export default router;
