import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://www.lifelinebloodcenter.org/api";

const Register = () => {
  const [camps, setCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const res = await axios.get(`${API_BASE}/camps/public`);
      setCamps(res.data);
    } catch (err) {
      console.error("Failed to fetch camps:", err.response || err);
      setCamps([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCamp) return alert("Please select a camp");

    try {
      await axios.post(`${API_BASE}/donors`, {
        name, email, phone, bloodGroup, camp: selectedCamp
      });
      alert("Registered successfully!");
      setName(""); setEmail(""); setPhone(""); setBloodGroup(""); setSelectedCamp("");
    } catch (err) {
      console.error(err.response || err);
      alert("Registration failed");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">Blood Donor Registration</h2>
      <form onSubmit={handleSubmit} className="border p-4 rounded bg-light">
        <div className="mb-3">
          <label>Camp</label>
          <select className="form-select" value={selectedCamp} onChange={e => setSelectedCamp(e.target.value)} required>
            <option value="">Select Camp</option>
            {camps.map(c => <option key={c._id} value={c._id}>{c.name} ({c.date ? new Date(c.date).toLocaleDateString() : "N/A"})</option>)}
          </select>
        </div>
        <div className="mb-3"><label>Name</label><input className="form-control" value={name} onChange={e=>setName(e.target.value)} required/></div>
        <div className="mb-3"><label>Email</label><input type="email" className="form-control" value={email} onChange={e=>setEmail(e.target.value)}/></div>
        <div className="mb-3"><label>Phone</label><input className="form-control" value={phone} onChange={e=>setPhone(e.target.value)} required/></div>
        <div className="mb-3">
          <label>Blood Group</label>
          <select className="form-select" value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)} required>
            <option value="">Select</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  );
};

export default Register;
