import express from "express";
import mongoose from "mongoose";
import Donor from "../models/Donor.js";
import Camp from "../models/Camp.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Register new donor
router.post("/", async (req, res) => {
  try {
    let { camp, ...donorData } = req.body;

    // Convert camp name → ObjectId if needed
    if (!mongoose.Types.ObjectId.isValid(camp)) {
      const campDoc = await Camp.findOne({ name: camp });
      if (!campDoc) {
        return res.status(400).json({ message: "Invalid camp" });
      }
      camp = campDoc._id;
    }

    const donor = new Donor({ ...donorData, camp });
    await donor.save();

    res.status(201).json({ message: "Donor registered successfully", donor });
  } catch (err) {
    console.error("Error registering donor:", err);
    res.status(500).json({ message: "Error registering donor", error: err.message });
  }
});

// ✅ Get donors by camp
router.get("/camp/:campId", verifyToken, async (req, res) => {
  try {
    const { campId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(campId))
      return res.status(400).json({ message: "Invalid Camp ID" });

    const donors = await Donor.find({ camp: campId }).sort({ name: 1 });
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: "Error fetching donors", error: err.message });
  }
});

// ✅ Update donor
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Donor ID" });

    const donor = await Donor.findByIdAndUpdate(id, req.body, { new: true });
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    res.json({ message: "Donor updated successfully", donor });
  } catch (err) {
    res.status(500).json({ message: "Error updating donor", error: err.message });
  }
});

// ✅ Delete donor
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Donor ID" });

    const donor = await Donor.findByIdAndDelete(id);
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    res.json({ message: "Donor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting donor", error: err.message });
  }
});

// ✅ Get single donor
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid Donor ID" });

    const donor = await Donor.findById(id);
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    res.json(donor);
  } catch (err) {
    res.status(500).json({ message: "Error fetching donor", error: err.message });
  }
});

export default router;
