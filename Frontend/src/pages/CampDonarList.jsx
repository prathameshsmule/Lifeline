import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const DonorRegistration = () => {
  const { campName } = useParams()
  const [form, setForm] = useState({
    name: '', age: '', weight: '', bloodGroup: '', email: '',
    phone: '', address: '', camp: ''
  })

  useEffect(() => {
    if (campName) {
      setForm(prev => ({ ...prev, camp: campName }))
    }
  }, [campName])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('https://www.lifelinebloodcenter.org/api/donors', form)
      alert('Donor registered successfully!')
      setForm({ name: '', age: '', weight: '', bloodGroup: '', email: '', phone: '', address: '', camp: campName || '' })
    } catch (err) {
      alert('Error registering donor')
    }
  }

  return (
    <div className="container py-4">
      <h3 className="text-danger mb-3">Donor Registration {campName && `for Camp: ${campName}`}</h3>
      <form onSubmit={handleSubmit} className="border p-3 rounded bg-light">
        {/* Form fields */}
        {/* ... name, age, weight, etc ... */}
        {/* Include only if no campName from URL */}
        {!campName && (
          <input className="form-control mb-2" name="camp" placeholder="Camp Name" value={form.camp} onChange={handleChange} required />
        )}
        {/* Rest of the form */}
        <button type="submit" className="btn btn-danger">Register</button>
      </form>
    </div>
  )
}

export default DonorRegistration
