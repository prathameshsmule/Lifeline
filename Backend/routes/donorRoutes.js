import express from 'express';
import mongoose from 'mongoose';
import Donor from '../models/Donor.js';
import Camp from '../models/Camp.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * PUBLIC: Register new donor
 * - Accepts either a camp ObjectId or a camp name (we convert name -> id).
 */
router.post('/', async (req, res) => {
  try {
    let { camp, ...donorData } = req.body;

    if (!camp) return res.status(400).json({ message: 'Camp is required' });

    // If "camp" is not ObjectId, try resolving by name
    if (!mongoose.Types.ObjectId.isValid(camp)) {
      const campDoc = await Camp.findOne({ name: camp });
      if (!campDoc) return res.status(400).json({ message: 'Invalid camp' });
      camp = campDoc._id;
    }

    const donor = new Donor({ ...donorData, camp });
    await donor.save();

    return res.status(201).json({ message: 'Donor registered successfully', donor });
  } catch (err) {
    console.error('Error registering donor:', err);
    return res.status(500).json({ message: 'Error registering donor', error: err.message });
  }
});

/**
 * ADMIN: Get donors by camp
 */
router.get('/camp/:campId', verifyToken, async (req, res) => {
  try {
    const { campId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(campId)) return res.status(400).json({ message: 'Invalid Camp ID' });

    const donors = await Donor.find({ camp: campId }).sort({ name: 1 });
    return res.json(donors);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching donors', error: err.message });
  }
});

/**
 * ADMIN: Update donor
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid Donor ID' });

    const donor = await Donor.findByIdAndUpdate(id, req.body, { new: true });
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    return res.json({ message: 'Donor updated successfully', donor });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating donor', error: err.message });
  }
});

/**
 * ADMIN: Delete donor
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid Donor ID' });

    const donor = await Donor.findByIdAndDelete(id);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    return res.json({ message: 'Donor deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Error deleting donor', error: err.message });
  }
});

/**
 * ADMIN: Get single donor
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid Donor ID' });

    const donor = await Donor.findById(id);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    return res.json(donor);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching donor', error: err.message });
  }
});

export default router;
