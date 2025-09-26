import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_APP_API_URL || "https://www.lifelinebloodcenter.org/api";

const DonorRegistration = () => {
  const { campName } = useParams(); // route param if used
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const campIdFromQuery = search.get("campId");

  const [form, setForm] = useState({
    name: "", age: "", weight: "", bloodGroup: "", email: "",
    phone: "", address: "", campId: ""
  });
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campName) {
      // if route param uses campName, we fill campId with campName (or store readable name)
      setForm(prev => ({ ...prev, campId: campName }));
    } else if (campIdFromQuery) {
      setForm(prev => ({ ...prev, campId: campIdFromQuery }));
    }
  }, [campName, campIdFromQuery]);

  // Optional: load public camps for select dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/camps/public`);
        setCamps(res.data || []);
      } catch (err) {
        console.error("Error loading camps", err);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/donors`, form);
      alert("Donor registered successfully!");
      setForm({ name: "", age: "", weight: "", bloodGroup: "", email: "", phone: "", address: "", campId: campIdFromQuery || campName || "" });
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Error registering donor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="text-danger mb-3">Donor Registration {campName && `for Camp: ${campName}`}</h3>
      <form onSubmit={handleSubmit} className="border p-3 rounded bg-light">
        <div className="mb-2">
          <input className="form-control" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <input className="form-control" name="age" type="number" placeholder="Age" value={form.age} onChange={handleChange} required />
        </div>
        <div className="mb-2">
          <input className="form-control" name="weight" placeholder="Weight (kg)" value={form.weight} onChange={handleChange} />
        </div>

        <div className="mb-2">
          <select className="form-select" name="bloodGroup" value={form.bloodGroup} onChange={handleChange} required>
            <option value="">Select Blood Group</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>

        <div className="mb-2">
          <input className="form-control" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
        </div>

        <div className="mb-2">
          <input className="form-control" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
        </div>

        {/* If camp was not pre-filled, show a select/dropdown */}
        {!campName && !campIdFromQuery && (
          <div className="mb-2">
            <select className="form-select" name="campId" value={form.campId} onChange={handleChange} required>
              <option value="">Choose a camp</option>
              {camps.map(c => <option key={c._id} value={c._id}>{c.name} — {c.location}</option>)}
            </select>
          </div>
        )}

        <div className="mb-2">
          <textarea className="form-control" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        </div>

        <button className="btn btn-danger" type="submit" disabled={loading}>{loading ? "Registering..." : "Register"}</button>
      </form>
    </div>
  );
};

export default DonorRegistration;
