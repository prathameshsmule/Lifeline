import express from 'express';
import mongoose from 'mongoose';
import Camp from '../models/Camp.js';
import Donor from '../models/Donor.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * ADMIN: Add new camp
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, location, date, organizerName, organizerContact, proName, hospitalName } = req.body;
    if (!name) return res.status(400).json({ message: 'Camp name is required' });

    const existing = await Camp.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Camp already exists' });

    const camp = new Camp({ name, location, date, organizerName, organizerContact, proName, hospitalName });
    await camp.save();
    return res.status(201).json({ message: 'Camp added successfully', camp });
  } catch (err) {
    return res.status(500).json({ message: 'Error adding camp', error: err.message });
  }
});

/**
 * PUBLIC: list camps (used by donor registration dropdown)
 *  - no token required
 */
router.get('/', async (_req, res) => {
  try {
    const camps = await Camp.find().sort({ date: -1 });
    return res.json(camps);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching camps', error: err.message });
  }
});

/**
 * ADMIN: list all camps with donor counts
 */
router.get('/with-count', verifyToken, async (_req, res) => {
  try {
    const camps = await Camp.find().sort({ date: 1 });
    const withCounts = await Promise.all(
      camps.map(async (camp) => {
        const donorCount = await Donor.countDocuments({ camp: camp._id });
        return { ...camp.toObject(), donorCount };
      })
    );
    return res.json(withCounts);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching camps', error: err.message });
  }
});

/**
 * ADMIN: single camp (with donor count)
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid Camp ID' });

    const camp = await Camp.findById(id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });

    const donorCount = await Donor.countDocuments({ camp: camp._id });
    return res.json({ ...camp.toObject(), donorCount });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching camp', error: err.message });
  }
});

export default router;
