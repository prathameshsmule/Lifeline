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

// Public: list all camps (newest first)
router.get('/', async (_req, res) => {
  try {
    const camps = await Camp.find().sort({ date: -1 });
    res.json(camps);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camps', error: err.message });
  }
});

// Admin: All camps with donor counts (oldest->newest here; change if you prefer)
router.get('/with-count', verifyToken, async (_req, res) => {
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

// Admin: Get single camp with donor count
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Camp ID' });
    }

    const camp = await Camp.findById(id);
    if (!camp) return res.status(404).json({ message: 'Camp not found' });

    const donorCount = await Donor.countDocuments({ camp: camp._id });
    res.json({ ...camp.toObject(), donorCount });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching camp', error: err.message });
  }
});

/**
 * 🔧 Admin: Update a camp (partial update)
 * PUT /api/camps/:id
 * Body: any of { name, location, date, organizerName, organizerContact, proName, hospitalName }
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Camp ID' });
    }

    // Whitelist fields you allow to be updated
    const allowed = ['name', 'location', 'date', 'organizerName', 'organizerContact', 'proName', 'hospitalName'];
    const payload = {};
    for (const key of allowed) {
      if (key in req.body) payload[key] = req.body[key];
    }

    // Unique name check (only if name is being changed)
    if (payload.name) {
      const sameName = await Camp.findOne({ name: payload.name, _id: { $ne: id } });
      if (sameName) {
        return res.status(409).json({ message: 'Another camp with this name already exists' });
      }
    }

    const updated = await Camp.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Camp not found' });

    const donorCount = await Donor.countDocuments({ camp: updated._id });
    res.json({ message: 'Camp updated successfully', camp: { ...updated.toObject(), donorCount } });
  } catch (err) {
    res.status(500).json({ message: 'Error updating camp', error: err.message });
  }
});

// ❌ REMOVE this duplicate/protected GET block — it has a syntax error `);s` and conflicts the public GET above.
// router.get('/', verifyToken, async (req, res) => {
//   try {
//     const camps = await Camp.find().sort({ date: -1 });s
//     res.json(camps);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching camps', error: err.message });
//   }
// });

export default router;
