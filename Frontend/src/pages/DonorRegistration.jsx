import React, { useState, useEffect } from "react";
import axios from "axios";

const DonorRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    age: "",
    weight: "",
    bloodGroup: "",
    email: "",
    phone: "",
    address: "",
    camp: "",
    remark: ""
  });

  const [camps, setCamps] = useState([]);

  // Fetch camps from backend
  useEffect(() => {
    axios
      .get("https://www.lifelinebloodcenter.org/api/camps")
      .then((res) => setCamps(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://www.lifelinebloodcenter.org/api/donors", {
        ...formData,
        camp: formData.camp // ✅ ObjectId of camp
      });
      alert("Donor registered successfully!");
      setFormData({
        name: "",
        dob: "",
        age: "",
        weight: "",
        bloodGroup: "",
        email: "",
        phone: "",
        address: "",
        camp: "",
        remark: ""
      });
    } catch (error) {
      alert("Error registering donor: " + error.response?.data?.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="donor-form">
      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
      <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
      <input type="number" name="weight" placeholder="Weight" value={formData.weight} onChange={handleChange} required />
      <input name="bloodGroup" placeholder="Blood Group" value={formData.bloodGroup} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
      <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />

      <select name="camp" value={formData.camp} onChange={handleChange} required>
        <option value="">Select Camp</option>
        {camps.map((camp) => (
          <option key={camp._id} value={camp._id}>
            {camp.name}
          </option>
        ))}
      </select>

      <textarea name="remark" placeholder="Remark" value={formData.remark} onChange={handleChange}></textarea>

      <button type="submit">Register</button>
    </form>
  );
};

export default DonorRegister;
