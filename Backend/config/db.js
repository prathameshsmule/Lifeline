import mongoose from "mongoose"

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://prathameshsm0425:prathamesh123@cluster0.atbnfrf.mongodb.net/"
    const dbName = process.env.DB_NAME || "Blood_Donation"

    const connection = await mongoose.connect(mongoURI, { dbName })
    console.log(`MongoDB connected: ${connection.connection.host}`)
  } catch (error) {
    console.error("Error while connecting to MongoDB:", error.message)
    process.exit(1) // Exit process on DB failure
  }
}

export default connectDB
