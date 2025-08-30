import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
})

const Admin = mongoose.model('Admin', adminSchema)

export const initializeAdmin = async () => {
  try {
    const lifelineAdmin = await Admin.findOne({ email: 'lifelinebloodcenter26@gmail.com' });
    if (!lifelineAdmin) {
      const hashedPassword = await bcrypt.hash('lifeline@org', 10); // Hash the actual password
      await Admin.create({ 
        email: 'lifelinebloodcenter26@gmail.com', // Correct email
        password: hashedPassword 
      });
      console.log('✅ Default admin created: lifelinebloodcenter26@gmail.com / lifeline@org');
    } else {
      console.log('✅ lifeline admin already exists');
    }
  } catch (err) {
    console.error('❌ Error initializing lifeline admin:', err);
  }
}

export default Admin
