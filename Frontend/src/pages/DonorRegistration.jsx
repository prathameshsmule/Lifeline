// src/pages/DonorRegistration.jsx
import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

const API_BASE = 'https://www.lifelinebloodcenter.org/api' // keep in one place

const DonorRegistration = () => {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const campIdFromUrl = query.get('campId')

  const [camps, setCamps] = useState([])
  const [loadingCamps, setLoadingCamps] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    bloodGroup: '',
    email: '',
    phone: '',
    address: '',
    camp: campIdFromUrl || ''
  })

  useEffect(() => {
    const fetchCamps = async () => {
      setLoadingCamps(true)
      try {
        const res = await axios.get(`${API_BASE}/camps`)
        // Debug: inspect the raw response in console.network tab too
        console.log('GET /camps response:', res)

        // handle common response shapes:
        // 1) res.data = [ {...}, {...} ]
        // 2) res.data.camps = [ ... ]
        // 3) res.data.data = [ ... ]
        const payload = res.data
        const arr = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload?.camps) ? payload.camps : (Array.isArray(payload?.data) ? payload.data : []))

        setCamps(arr)
      } catch (err) {
        console.error('Error fetching camps:', err, err?.response?.data)
        setCamps([])
      } finally {
        setLoadingCamps(false)
      }
    }

    fetchCamps()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // basic validation
    if (parseInt(formData.age, 10) < 18) { alert('Minimum age is 18'); return }
    if (parseInt(formData.weight, 10) < 50) { alert('Minimum weight is 50 kg'); return }

    try {
      await axios.post(`${API_BASE}/donors`, formData)
      alert('Donor registered successfully!')
      // reset (preserve camp if came from url)
      setFormData({
        name: '', age: '', weight: '', bloodGroup: '',
        email: '', phone: '', address: '', camp: campIdFromUrl || ''
      })
    } catch (err) {
      console.error('Register error:', err, err?.response?.data)
      alert(err?.response?.data?.message || 'Error registering donor')
    }
  }

  // Helper to show camp name for campIdFromUrl
  const selectedCampName = campIdFromUrl
    ? (camps.find(c => (c._id || c.id) === campIdFromUrl)?.name || camps.find(c => (c._id || c.id) === campIdFromUrl)?.campName || 'Selected Camp')
    : ''

  return (
    <div className="container py-4">
      <h3 className="text-danger mb-3">
        Donor Registration {campIdFromUrl && `for ${selectedCampName}`}
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

        {/* Show select only if no campId in URL */}
        {!campIdFromUrl && (
          <>
            {loadingCamps ? (
              <div className="mb-2">Loading camps...</div>
            ) : (
              <>
                {camps.length === 0 ? (
                  <div className="mb-2 text-muted">No camps currently available.</div>
                ) : (
                  <select className="form-select mb-2" name="camp" value={formData.camp} onChange={handleChange} required>
                    <option value="">Select Camp</option>
                    {camps.map(c => {
                      const id = c._id || c.id
                      const name = c.name || c.campName || `Camp ${id}`
                      return <option key={id || name} value={id}>{name}</option>
                    })}
                  </select>
                )}
              </>
            )}
          </>
        )}

        <button type="submit" className="btn btn-danger">Register</button>
      </form>
    </div>
  )
}

export default DonorRegistration
