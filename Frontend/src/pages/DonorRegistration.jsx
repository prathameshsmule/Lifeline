import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import emailjs from '@emailjs/browser';
import logo from '../assets/images/blood donor.png';
import '../styles/DonorRegistration.css';
const API_BASE = "https://www.lifelinebloodcenter.org/api";
const DonorRegistration = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const campIdFromUrl = query.get("campId");

  const [camps, setCamps] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    weight: '',
    bloodGroup: '',
    email: '',
    phone: '',
    address: '',
    camp: ''
  });
  const [calculatedAge, setCalculatedAge] = useState(null);
  const [campLocked, setCampLocked] = useState(false);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init('NtoYnRvbn1y7ywGKq');
  }, []);

  // Fetch camps from backend
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await axios.get('https://www.lifelinebloodcenter.org/api/camps');
        console.log("Camps fetched:", res.data); // Debug
        setCamps(res.data);

        // Lock camp if URL param exists
        if (campIdFromUrl) {
          const selectedCamp = res.data.find(c => c._id === campIdFromUrl);
          if (selectedCamp) {
            setFormData(prev => ({ ...prev, camp: selectedCamp._id }));
            setCampLocked(true);
          }
        }
      } catch (err) {
        console.error("Error fetching camps:", err);
        setCamps([]);
      }
    };
    fetchCamps();
  }, [campIdFromUrl]); // Depend on campIdFromUrl

  // Calculate age
  const calculateAge = (dobValue) => {
    const birthDate = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dob') {
      setFormData({ ...formData, dob: value });
      setCalculatedAge(calculateAge(value));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const sendEmail = async (donorData) => {
    try {
      const campName = camps.find(c => c._id === donorData.camp)?.name || 'Selected Camp';
      const templateParams = {
        to_email: donorData.email,
        donor_name: donorData.name,
        donor_age: calculatedAge,
        donor_weight: donorData.weight,
        donor_blood_group: donorData.bloodGroup,
        donor_phone: donorData.phone,
        donor_address: donorData.address,
        donor_camp: campName,
        registration_date: new Date().toLocaleDateString()
      };
      await emailjs.send('service_tt2fcqh','template_wlnkbdh', templateParams,'NtoYnRvbn1y7ywGKq');
      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (calculatedAge < 18) { alert("Minimum age 18"); return; }
    if (parseInt(formData.weight) < 50) { alert("Minimum weight 50kg"); return; }

    try {
      await axios.post('https://www.lifelinebloodcenter.org/api/donors', formData);
      await sendEmail(formData);
      alert("🎉 Registration successful! Check your email for confirmation.");
      setFormData({
        name: '', dob: '', weight: '', bloodGroup: '', email: '', phone: '', address: '',
        camp: campLocked ? formData.camp : ''
      });
      setCalculatedAge(null);
    } catch (err) {
      console.error(err);
      alert("❌ Error submitting form.");
    }
  };

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

          <label>Date of Birth</label>
          <input className="form-input" type="date" name="dob" value={formData.dob} onChange={handleChange} required />
          {calculatedAge !== null && <p className="age-preview">Age: {calculatedAge} years</p>}

          <input className="form-input" name="weight" type="number" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required />

          <select className="form-select" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
            <option value="">Select Blood Group</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-', "Don't Know"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>

          <input className="form-input" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input className="form-input" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          <textarea className="form-textarea" name="address" placeholder="Address" value={formData.address} onChange={handleChange} rows="3" required />

          {/* Camp Select */}
          <select className="form-select" name="camp" value={formData.camp} onChange={handleChange} required disabled={campLocked}>
            <option value="">Select Camp</option>
            {camps.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          <button type="submit" className="submit-btn">Register as Donor</button>
        </form>
      </div>
    </div>
  );
};

export default DonorRegistration;
