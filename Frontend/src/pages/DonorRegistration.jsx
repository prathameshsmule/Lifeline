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
  const [campNotice, setCampNotice] = useState(""); // shows if the campId is invalid/past

  // ---- helpers ----
  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const isUpcoming = (isoDateString) => {
    if (!isoDateString) return false;
    const today = startOfDay(new Date());
    const campDay = startOfDay(new Date(isoDateString));
    // Allow today and future
    return campDay.getTime() >= today.getTime();
  };

  // Initialize EmailJS once
  useEffect(() => {
    emailjs.init('NtoYnRvbn1y7ywGKq');
  }, []);

  // Fetch and filter camps (upcoming only)
  useEffect(() => {
    const fetchCamps = async () => {
      setLoadingCamps(true);
      setCampNotice("");
      try {
        const res = await axios.get(`${API_BASE}/camps`); // public list (newest first)
        // keep only upcoming (today or later) and sort soonest first
        const upcoming = (res.data || [])
          .filter(c => isUpcoming(c?.date))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setCamps(upcoming);

        // Preselect camp from URL if it exists AND is upcoming
        if (campIdFromUrl) {
          const selected = upcoming.find(c => c._id === campIdFromUrl);
          if (selected) {
            setFormData(prev => ({ ...prev, camp: selected._id }));
            setCampLocked(true);
          } else {
            // show a small notice if the provided camp is not upcoming or not found
            setCampNotice("The camp link you followed is no longer available or already completed.");
            setCampLocked(false);
          }
        }
      } catch (err) {
        console.error("Error fetching camps:", err);
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
      await emailjs.send('service_tt2fcqh','template_wlnkbdh',templateParams,'NtoYnRvbn1y7ywGKq');
      console.log("Email sent successfully!");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!calculatedAge || calculatedAge < 18) {
      alert("Minimum age 18 required");
      return;
    }
    if (parseInt(formData.weight, 10) < 50) {
      alert("Minimum weight 50kg required");
      return;
    }
    if (!formData.camp) {
      alert("Please select a camp.");
      return;
    }

    try {
      // Ensure the selected camp is still upcoming at submit time
      const stillUpcoming = camps.some(c => c._id === formData.camp);
      if (!stillUpcoming) {
        alert("Selected camp is no longer available.");
        return;
      }

      const payload = {
        ...formData,
        age: calculatedAge,
        weight: Number(formData.weight),
        dob: new Date(formData.dob).toISOString(),
      };

      await axios.post(`${API_BASE}/donors`, payload);
      await sendEmail(formData);

      alert("🎉 Registration successful! Check your email for confirmation.");
      setFormData(prev => ({
        name: '',
        dob: '',
        weight: '',
        bloodGroup: '',
        email: '',
        phone: '',
        address: '',
        camp: campLocked ? prev.camp : ''
      }));
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
          {campNotice && (
            <div className="notice warning" style={{marginTop: 8}}>
              {campNotice} Please choose an upcoming camp below.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          <input
            className="form-input"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Date of Birth</label>
          <input
            className="form-input"
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
          {calculatedAge !== null && <p className="age-preview">Age: {calculatedAge} years</p>}

          <input
            className="form-input"
            name="weight"
            type="number"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleChange}
            required
            min="0"
          />

          <select
            className="form-select"
            name="bloodGroup"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
          >
            <option value="">Select Blood Group</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-', "Don't Know"].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          <input
            className="form-input"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            className="form-input"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <textarea
            className="form-textarea"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            rows="3"
            required
          />

          {/* Camp Select — upcoming only */}
          <label>Choose an upcoming camp</label>
          <select
            className="form-select"
            name="camp"
            value={formData.camp}
            onChange={handleChange}
            required
            disabled={campLocked || loadingCamps}
          >
            {loadingCamps ? (
              <option value="" disabled>Loading camps...</option>
            ) : camps.length === 0 ? (
              <option value="" disabled>No upcoming camps available</option>
            ) : (
              <>
                {!campLocked && <option value="">Select Camp</option>}
                {camps.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} — {c.date ? new Date(c.date).toLocaleDateString() : "TBA"}
                  </option>
                ))}
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
