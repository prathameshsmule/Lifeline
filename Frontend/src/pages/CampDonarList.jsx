import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'https://www.lifelinebloodcenter.org/api';

const CampDonorList = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const campIdFromUrl = query.get("campId");

  const [camps, setCamps] = useState([]);
  const [loadingCamps, setLoadingCamps] = useState(true);
  const [campError, setCampError] = useState(null);

  const [formData, setFormData] = useState({
    name: '', age: '', weight: '', bloodGroup: '',
    email: '', phone: '', address: '', camp: ''
  });
  const [campLocked, setCampLocked] = useState(false);

  useEffect(() => {
    const fetchCamps = async () => {
      setLoadingCamps(true);
      setCampError(null);
      try {
        console.log('GET', `${API_BASE}/camps`);
        const res = await axios.get(`${API_BASE}/camps`, { timeout: 8000 });
        console.log('Camps:', res.status, res.data);
        const data = Array.isArray(res.data) ? res.data : (res.data?.camps || []);
        setCamps(data);
        if (campIdFromUrl && data.length) {
          const selectedCamp = data.find(c => (c._id || c.id) === campIdFromUrl);
          if (selectedCamp) {
            setFormData(prev => ({ ...prev, camp: selectedCamp._id || selectedCamp.id }));
            setCampLocked(true);
          }
        }
        if (!data.length) setCampError('No camps available.');
      } catch (err) {
        console.error('Error fetching camps:', err);
        if (err.response) setCampError(`Server error: ${err.response.status}`);
        else if (err.request) setCampError('Network error or request blocked (CORS).');
        else setCampError(err.message);
        setCamps([]);
      } finally {
        setLoadingCamps(false);
      }
    };
    fetchCamps();
  }, [campIdFromUrl]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(formData.age, 10) < 18) { alert('Minimum age is 18'); return; }
    if (parseInt(formData.weight, 10) < 50) { alert('Minimum weight is 50 kg'); return; }
    try {
      await axios.post(`${API_BASE}/donors`, formData);
      alert('Donor registered successfully!');
      setFormData({ name: '', age: '', weight: '', bloodGroup: '', email: '', phone: '', address: '', camp: campLocked ? formData.camp : '' });
    } catch (err) {
      console.error('Register error:', err);
      alert('Error registering donor');
    }
  };

  return (
    <div className="container py-4">
      <h3 className="text-danger mb-3">Donor Registration {campIdFromUrl && 'for selected Camp'}</h3>

      {campError && <div style={{color:'red', marginBottom:8}}><strong>Camp load issue:</strong> {campError}</div>}

      <form onSubmit={handleSubmit} className="border p-3 rounded bg-light">
        <input className="form-control mb-2" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
        <input className="form-control mb-2" name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <input className="form-control mb-2" name="weight" type="number" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} required />
        <select className="form-select mb-2" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
          <option value="">Select Blood Group</option>
          {['A+','A-','B+','B-','AB+','AB-','O+','O-',"Don't Know"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
        </select>
        <input className="form-control mb-2" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input className="form-control mb-2" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
        <textarea className="form-control mb-2" name="address" placeholder="Address" value={formData.address} onChange={handleChange} rows="3" required />

        <select className="form-select mb-2" name="camp" value={formData.camp} onChange={handleChange} required disabled={campLocked || loadingCamps}>
          {loadingCamps ? (
            <option value="">Loading camps...</option>
          ) : (
            <>
              <option value="">Select Camp</option>
              {camps.length ? camps.map(c => <option key={c._id || c.id} value={c._id || c.id}>
                {c.name} {c.date ? ` — ${new Date(c.date).toLocaleDateString()}` : ''}
              </option>) : <option value="">No camps available</option>}
            </>
          )}
        </select>

        <button type="submit" className="btn btn-danger">Register</button>
      </form>
    </div>
  );
};

export default CampDonorList;
