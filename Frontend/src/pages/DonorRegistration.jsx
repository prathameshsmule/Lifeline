import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://www.lifelinebloodcenter.org/api";

const Register = () => {
  const [camps, setCamps] = useState([]);
  const [form, setForm] = useState({
    name: "",
    bloodGroup: "",
    age: "",
    weight: "",
    email: "",
    phone: "",
    address: "",
    campId: ""
  });

  useEffect(() => {
    fetchCamps();
  }, []);

const fetchCamps = async () => {
  try {
    const res = await axios.get(`${API_BASE}/camps/public`); // must use /public
    setCamps(res.data);
  } catch (err) {
    console.error("Failed to fetch camps:", err.response || err);
    setCamps([]);
  }
};


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/donors`, form);
      alert("✅ Donor registered successfully!");
      setForm({ name: "", bloodGroup: "", age: "", weight: "", email: "", phone: "", address: "", campId: "" });
    } catch (err) {
      console.error(err.response || err);
      alert("Error registering donor.");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-danger mb-4">Donor Registration</h2>
      <form onSubmit={handleSubmit} className="border p-4 rounded bg-light">
        <div className="row g-3">
          <div className="col-md-6">
            <input type="text" name="name" placeholder="Full Name" className="form-control" value={form.name} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <select name="bloodGroup" className="form-select" value={form.bloodGroup} onChange={handleChange} required>
              <option value="">Select Blood Group</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <input type="number" name="age" placeholder="Age" className="form-control" value={form.age} onChange={handleChange} required />
          </div>
          <div className="col-md-3">
            <input type="number" name="weight" placeholder="Weight (kg)" className="form-control" value={form.weight} onChange={handleChange} required />
          </div>
          <div className="col-md-6">
            <input type="email" name="email" placeholder="Email" className="form-control" value={form.email} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <input type="text" name="phone" placeholder="Phone" className="form-control" value={form.phone} onChange={handleChange} required />
          </div>
          <div className="col-12">
            <input type="text" name="address" placeholder="Address" className="form-control" value={form.address} onChange={handleChange} />
          </div>
          <div className="col-12">
            <select name="campId" className="form-select" value={form.campId} onChange={handleChange} required>
              <option value="">Select Camp</option>
              {camps.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} - {c.date ? new Date(c.date).toLocaleDateString() : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-danger mt-3">Register</button>
      </form>
    </div>
  );
};

export default Register;
