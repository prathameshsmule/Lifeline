import mongoose from 'mongoose';

const campSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  date: Date,
  organizerName: String,
  organizerContact: String,
  proName: String,
  hospitalName: String
}, { timestamps: true });

export default mongoose.model('Camp', campSchema);
