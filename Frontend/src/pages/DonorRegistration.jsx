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
  const [loadingCamps, setLoadingCamps] = useState(true);
  const [campError, setCampError] = useState(null);
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

  useEffect(() => { emailjs.init('NtoYnRvbn1y7ywGKq'); }, []);

  useEffect(() => {
    const fetchCamps = async () => {
      setLoadingCamps(true);
      setCampError(null);
      try {
        console.log('Fetching camps from', `${API_BASE}/camps`);
        const res = await axios.get(`${API_BASE}/camps`, { timeout: 8000 });
        console.log('Camps response:', res.status, res.data);
        const data = Array.isArray(res.data) ? res.data : (res.data?.camps || []);
        setCamps(data);
        // Preselect camp if campIdFromUrl exists
        if (campIdFromUrl && data.length) {
          const selectedCamp = data.find(c => (c._id || c.id) === campIdFromUrl);
          if (selectedCamp) {
            setFormData(prev => ({ ...prev, camp: selectedCamp._id || selectedCamp.id }));
            setCampLocked(true);
          }
        }
        if (!data.length) {
          setCampError('No camps returned from server.');
        }
      } catch (err) {
        console.error('Error fetching camps:', err);
        // Network/CORS errors show useful message in console; show user friendly text too
        if (err.response) {
          setCampError(`Server error: ${err.response.status} ${err.response.statusText}`);
        } else if (err.request) {
          setCampError('Network error or CORS blocked the request. See console/network tab.');
        } else {
          setCampError('Error: ' + err.message);
        }
        setCamps([]);
      } finally {
        setLoadingCamps(false);
      }
    };
    fetchCamps();
  }, [campIdFromUrl]);

  const calculateAge = (dobValue) => {
    if (!dobValue) return null;
    const birthDate = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'dob') setCalculatedAge(calculateAge(value));
  };

  const sendEmail = async (donorData) => {
    try {
      const campName = camps.find(c => (c._id || c.id) === donorData.camp)?.name || 'Selected Camp';
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
      await emailjs.send('service_tt2fcqh','template_wlnkbdh',templateParams,'NtoYnRvbn1y7ywGKq');
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Email send failed:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!calculatedAge || calculatedAge < 18) { alert("Minimum age 18 required"); return; }
    if (parseInt(formData.weight, 10) < 50) { alert("Minimum weight 50kg required"); return; }
    try {
      console.log('Submitting donor', formData);
      await axios.post(`${API_BASE}/donors`, formData);
      await sendEmail(formData);
      alert("🎉 Registration successful! Check your email for confirmation.");
      setFormData({ name:'', dob:'', weight:'', bloodGroup:'', email:'', phone:'', address:'', camp: campLocked ? formData.camp : '' });
      setCalculatedAge(null);
    } catch (err) {
      console.error('Submit error:', err);
      alert("❌ Error submitting form. Check console or network tab for details.");
    }
  };

  return (
    <div className="donor-registration-container">
      <div className="registration-card">
        <div className="card-header">
          <div className="logo-container"><img src={logo} alt="Donor Logo" className="logo" /></div>
          <h2 className="title">Donor Registration</h2>
          <p className="subtitle">Join our life-saving community</p>
        </div>

        {campError && <div style={{color:'red', padding:'8px', margin:'8px 0'}}><strong>Camp load issue:</strong> {campError}</div>}

        <form onSubmit={handleSubmit} className="registration-form">
          <input className="form-input" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />

          <label>Date of Birth</label>
          <input className="form-input" type="date" name="dob" value={formData.dob} onChange={handleChange} required />
          {calculatedAge !== null && <p className="age-preview">Age: {calculatedAge} years</p>}

          <input className="form-input" name="weight" type="number" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required />

          <select className="form-select" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
            <option value="">Select Blood Group</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-', "Don't Know"].map(bg => (<option key={bg} value={bg}>{bg}</option>))}
          </select>

          <input className="form-input" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input className="form-input" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          <textarea className="form-textarea" name="address" placeholder="Address" value={formData.address} onChange={handleChange} rows="3" required />

          {/* Camp Select */}
          <select
            className="form-select"
            name="camp"
            value={formData.camp}
            onChange={handleChange}
            required
            disabled={campLocked || loadingCamps}
          >
            {loadingCamps ? (
              <option value="">Loading camps...</option>
            ) : (
              <>
                <option value="">Select Camp</option>
                {camps.length > 0 ? camps.map(c => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name} {c.date ? ` — ${new Date(c.date).toLocaleDateString()}` : ''}
                  </option>
                )) : (
                  <option value="">No camps available</option>
                )}
              </>
            )}
          </select>

          <button type="submit" className="submit-btn">Register as Donor</button>
        </form>
      </div>
    </div>
  );
};

export default DonorRegistration;
