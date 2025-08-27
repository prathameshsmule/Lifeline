import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
})

const Admin = mongoose.model('Admin', adminSchema)

// ✅ Admin initializer
export const initializeAdmin = async () => {
  try {
    const existing = await Admin.findOne({ username: 'lifelinebloodcenter' })
    if (!existing) {
      const hashedPassword = await bcrypt.hash('lifeline@org', 10)
      await Admin.create({ username: 'lifelinebloodcenter', password: hashedPassword })
      // console.log('✅ Default admin created: admin / admin123')
    } else {
      console.log('✅ Admin already exists')
    }
  } catch (err) {
    console.error('Error initializing admin:', err.message)
  }
}

export default Admin
