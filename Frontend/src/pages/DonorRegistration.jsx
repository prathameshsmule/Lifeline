import React, { useState } from "react"
import axios from "axios"
import "./DonorRegister.css"

const DonorRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    email: "",
    address: "",
    camp: "",
    remark: "",
  })

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const res = await axios.post(
        "https://www.lifelinebloodcenter.org/api/donors",
        formData
      )
      setMessage("✅ Donor registered successfully!")
      setFormData({
        name: "",
        age: "",
        gender: "",
        bloodGroup: "",
        phone: "",
        email: "",
        address: "",
        camp: "",
        remark: "",
      })
    } catch (err) {
      setMessage(
        "❌ Error registering donor: " +
          (err.response?.data?.message || err.message)
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="donor-form">
        <h2>Donor Registration</h2>

        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min="18"
            max="65"
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Blood Group</label>
          <select
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            placeholder="10-digit number"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label>Camp</label>
          <input
            type="text"
            name="camp"
            value={formData.camp}
            onChange={handleChange}
            placeholder="Camp ID or Name"
          />
        </div>

        <div className="form-group">
          <label>Remark</label>
          <textarea
            name="remark"
            value={formData.remark}
            onChange={handleChange}
          ></textarea>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {message && <p style={{ textAlign: "center", marginTop: "10px" }}>{message}</p>}
      </form>
    </div>
  )
}

export default DonorRegister
