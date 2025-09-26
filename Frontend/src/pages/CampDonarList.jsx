import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

const CampDonorList = () => {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const campIdFromUrl = query.get("campId") // Get campId from URL

  const [camps, setCamps] = useState([])
  const [formData, setFormData] = useState({
    name: '', age: '', weight: '', bloodGroup: '',
    email: '', phone: '', address: '', camp: ''
  })

  const [campLocked, setCampLocked] = useState(false)

  // Fetch camps from backend
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await axios.get('https://www.lifelinebloodcenter.org/api/camps')
        setCamps(res.data)

        // If URL has campId, lock the camp
        if (campIdFromUrl) {
          const selectedCamp = res.data.find(c => c._id === campIdFromUrl)
          if (selectedCamp) {
            setFormData(prev => ({ ...prev, camp: selectedCamp._id }))
            setCampLocked(true)
          }
        }
      } catch (err) {
        console.error("Error fetching camps:", err)
        setCamps([])
      }
    }
    fetchCamps()
  }, [campIdFromUrl])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (parseInt(formData.age, 10) < 18) { alert('Minimum age is 18'); return }
    if (parseInt(formData.weight, 10) < 50) { alert('Minimum weight is 50 kg'); return }

    try {
      await axios.post('https://www.lifelinebloodcenter.org/api/donors', formData)
      alert('Donor registered successfully!')

      // Reset form
      setFormData({
        name: '', age: '', weight: '', bloodGroup: '',
        email: '', phone: '', address: '', camp: campLocked ? formData.camp : ''
      })
    } catch (err) {
      console.error(err)
      alert('Error registering donor')
    }
  }

  return (
    <div className="container py-4">
      <h3 className="text-danger mb-3">
        Donor Registration {campIdFromUrl && `for selected Camp`}
      </h3>

      <form onSubmit={handleSubmit} className="border p-3 rounded bg-light">
        <input className="form-control mb-2" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
        <input className="form-control mb-2" name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <input className="form-control mb-2" name="weight" type="number" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required />
        <select className="form-select mb-2" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
          <option value="">Select Blood Group</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "Don't Know"].map(bg => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
        <input className="form-control mb-2" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input className="form-control mb-2" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
        <textarea className="form-control mb-2" name="address" placeholder="Address" value={formData.address} onChange={handleChange} rows="3" required />

        {/* Camp select */}
        <select 
          className="form-select mb-2" 
          name="camp" 
          value={formData.camp} 
          onChange={handleChange} 
          required 
          disabled={campLocked}
        >
          <option value="">Select Camp</option>
          {camps.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <button type="submit" className="btn btn-danger">Register</button>
      </form>
    </div>
  )
}

export default CampDonorList
