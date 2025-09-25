import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import emailjs from '@emailjs/browser'
import logo from '../assets/images/blood donor.png'
import '../styles/DonorRegistration.css'

const DonorRegistration = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const campIdFromUrl = queryParams.get('campId') // Get campId from QR/link

  const [formData, setFormData] = useState({
    name: '', dob: '', weight: '', bloodGroup: '',
    email: '', phone: '', address: '', camp: ''
  })

  const [camps, setCamps] = useState([])
  const [campLocked, setCampLocked] = useState(false)
  const [calculatedAge, setCalculatedAge] = useState(null)

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init('NtoYnRvbn1y7ywGKq')
  }, [])

  // Fetch camps and set camp if QR/link used
  useEffect(() => {
    axios.get('https://www.lifelinebloodcenter.org/api/camps')
      .then(res => {
        setCamps(res.data)
        if (campIdFromUrl) {
          const selectedCamp = res.data.find(c => c._id === campIdFromUrl)
          if (selectedCamp) {
            setFormData(prev => ({ ...prev, camp: selectedCamp.name }))
            setCampLocked(true) // Lock camp field
          }
        }
      })
      .catch(() => setCamps([]))
  }, [campIdFromUrl])

  // Calculate age from DOB
  const calculateAgeFromBirthDate = (birthDateValue) => {
    if (!birthDateValue) return null
    const birthDate = new Date(birthDateValue)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  const handleBirthDateChange = (dateValue) => {
    setFormData({ ...formData, dob: dateValue })
    const age = calculateAgeFromBirthDate(dateValue)
    setCalculatedAge(age)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'dob') {
      handleBirthDateChange(value)
      return
    }
    setFormData({ ...formData, [name]: value })
  }

  const sendEmail = async (donorData) => {
    try {
      const templateParams = {
        to_email: donorData.email,
        donor_name: donorData.name,
        donor_age: calculatedAge,
        donor_weight: donorData.weight,
        donor_blood_group: donorData.bloodGroup,
        donor_phone: donorData.phone,
        donor_address: donorData.address,
        donor_camp: donorData.camp,
        registration_date: new Date().toLocaleDateString()
      }

      await emailjs.send(
        'service_tt2fcqh',
        'template_wlnkbdh',
        templateParams,
        'NtoYnRvbn1y7ywGKq'
      )
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (calculatedAge < 18) {
      alert('You must be at least 18 years old to register as a donor.')
      return
    }

    if (parseInt(formData.weight) < 50) {
      alert('Minimum weight for donation should be 50 kg.')
      return
    }

    try {
      await axios.post('https://www.lifelinebloodcenter.org/api/donors', formData)
      await sendEmail(formData)
      alert('🎉 Registration successful! Check your email for confirmation.')

      setFormData({
        name: '', dob: '', weight: '', bloodGroup: '',
        email: '', phone: '', address: '', camp: campLocked ? formData.camp : ''
      })
      setCalculatedAge(null)
    } catch (err) {
      alert('❌ Error submitting form. Please try again.')
    }
  }

  return (
    <div className="donor-registration-container">
      <div className="background-animation"></div>
      <div className="registration-card">
        <div className="card-header">
          <div className="logo-container">
            <img src={logo} alt="Donor Logo" className="logo" />
          </div>
          <h2 className="title">Donor Registration</h2>
          <p className="subtitle">Join our life-saving community</p>
        </div>
        
        <form onSubmit={handleSubmit} className="registration-form">
          <input className="form-input" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />

          <label className="form-label">Date of Birth</label>
          <input className="form-input" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
          {calculatedAge !== null && <p className="age-preview">Calculated Age: {calculatedAge} years</p>}

          <input className="form-input" name="weight" type="number" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required />

          <select className="form-select" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
            <option value="">Select Blood Group</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "Don't Know"].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <input className="form-input" name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
          <input className="form-input" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          <textarea className="form-textarea" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required rows="3" />

          <select className="form-select" name="camp" value={formData.camp} onChange={handleChange} required disabled={campLocked}>
            <option value="">{campLocked ? formData.camp : 'Select Camp'}</option>
            {!campLocked && camps.map(c => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <button className="submit-btn" type="submit">
            <span className="btn-text">Register as Donor</span>
            <div className="btn-ripple"></div>
          </button>
        </form>
      </div>
    </div>
  )
}

export default DonorRegistration
