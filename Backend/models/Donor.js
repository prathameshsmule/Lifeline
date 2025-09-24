import mongoose from 'mongoose'

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true }, // ✅ Birth Date
  age: { type: Number, required: true }, // ✅ Auto-calculated
  weight: { type: Number, required: true },
  bloodGroup: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
 camp: { type: mongoose.Schema.Types.ObjectId, ref: 'Camp', required: true },
  remark: { type: String, default: "" }
}, { timestamps: true })

const Donor = mongoose.model('Donor', donorSchema)
export default Donor
