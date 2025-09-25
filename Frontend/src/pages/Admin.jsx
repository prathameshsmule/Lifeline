import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE = "https://www.lifelinebloodcenter.org/api";

const Admin = () => {
  const [donors, setDonors] = useState([]);
  const [camps, setCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [showQR, setShowQR] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [loadingCamps, setLoadingCamps] = useState(false);
  const [editDonorId, setEditDonorId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newCamp, setNewCamp] = useState({
    name: "",
    location: "",
    date: "",
    organizerName: "",
    organizerContact: "",
    proName: "",
    hospitalName: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("admin-token");

  useEffect(() => {
    if (!token) return navigate("/admin-login");
    fetchCamps();
  }, []);

  useEffect(() => {
    if (selectedCamp) fetchDonors();
  }, [selectedCamp]);

  const fetchCamps = async () => {
    setLoadingCamps(true);
    try {
      const res = await axios.get(`${API_BASE}/camps`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCamps(res.data);
    } catch (err) {
      console.error(err.response || err);
      setCamps([]);
      if ([401, 403].includes(err.response?.status)) handleLogout();
    } finally {
      setLoadingCamps(false);
    }
  };

  const fetchDonors = async () => {
    setLoadingDonors(true);
    try {
      const res = await axios.get(`${API_BASE}/donors/camp/${selectedCamp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonors(res.data || []);
    } catch (err) {
      console.error(err.response || err);
      setDonors([]);
      if ([401, 403].includes(err.response?.status)) handleLogout();
    } finally {
      setLoadingDonors(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    navigate("/admin-login");
  };

  const handleNewCampChange = (e) => {
    setNewCamp({ ...newCamp, [e.target.name]: e.target.value });
  };

  const handleNewCampSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/camps`, newCamp, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewCamp({
        name: "", location: "", date: "", organizerName: "", organizerContact: "", proName: "", hospitalName: ""
      });
      fetchCamps();
      alert("Camp added successfully!");
    } catch (err) {
      console.error(err.response || err);
      alert("Error adding camp.");
    }
  };

  const handleDeleteDonor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donor?")) return;
    try {
      await axios.delete(`${API_BASE}/donors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDonors();
      alert("Donor deleted successfully!");
    } catch (err) {
      console.error(err.response || err);
      alert("Error deleting donor");
    }
  };

  const handleEditClick = (donor) => {
    setEditDonorId(donor._id);
    setEditForm({ ...donor });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    try {
      await axios.put(`${API_BASE}/donors/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonors((prev) =>
        prev.map((d) => (d._id === id ? { ...editForm } : d))
      );
      setEditDonorId(null);
    } catch (err) {
      console.error(err.response || err);
      alert("Error saving donor update");
    }
  };

  const downloadPDF = () => {
    if (!donors.length) return alert("No donors to export.");
    const doc = new jsPDF();
    doc.setFontSize(16);
    const campName = camps.find((c) => c._id === selectedCamp)?.name || "All Camps";
    doc.text(`Donor List for Camp: ${campName}`, 14, 15);
    const tableColumn = ["#", "Name", "Blood Group", "Age", "Weight (kg)", "Email", "Phone", "Address", "Remark"];
    const tableRows = donors.map((donor, index) => [
      index + 1, donor.name, donor.bloodGroup, donor.age, donor.weight,
      donor.email, donor.phone, donor.address, donor.remark || ""
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(`DonorList_${campName}.pdf`);
  };

  const filteredDonors = donors.filter((d) =>
    `${d.name} ${d.bloodGroup} ${d.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-2">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap px-3 py-2"
        style={{ position: "sticky", top: "70px", marginTop: "70px", backgroundColor: "white", borderBottom: "1px solid #ddd", zIndex: 1050 }}>
        <h2 className="text-danger mb-0">Camps</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      {/* Add Camp Form */}
      <form onSubmit={handleNewCampSubmit} className="border p-3 rounded mb-4 bg-light">
        <h5>Add New Camp</h5>
        <div className="row g-2">
          {["name","location","date","organizerName","organizerContact","proName"].map((field, idx) => (
            <div className="col-md-4" key={idx}>
              <input
                className="form-control"
                type={field === "date" ? "date" : "text"}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={newCamp[field]}
                onChange={handleNewCampChange}
                required={field === "name"}
              />
            </div>
          ))}
          <div className="col-md-4">
            <select className="form-select" name="hospitalName" value={newCamp.hospitalName} onChange={handleNewCampChange} required>
              <option value="">Select Hospital</option>
              {["Apollo Hospital","Fortis Hospital","AIIMS","Nanavati Hospital","Tata Memorial Hospital","Other"].map((h, i) => (
                <option key={i} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">Add Camp</button>
      </form>

      {/* Camp Cards */}
      {loadingCamps ? <p>Loading camps...</p> :
        <div className="row g-3">
          {camps.map((camp) => (
            <div key={camp._id} className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title text-danger">{camp.name}</h5>
                  <p className="card-text">
                    <strong>Location:</strong> {camp.location || "N/A"}<br/>
                    <strong>Date:</strong> {camp.date ? new Date(camp.date).toLocaleDateString() : "N/A"}<br/>
                    <strong>Organizer:</strong> {camp.organizerName || "N/A"}<br/>
                    <strong>Contact:</strong> {camp.organizerContact || "N/A"}<br/>
                    <strong>PRO:</strong> {camp.proName || "N/A"}<br/>
                    <strong>Hospital:</strong> {camp.hospitalName || "N/A"}<br/>
                    <strong>Donors Registered:</strong> {camp.donorCount ?? 0}
                  </p>
                  <button className="btn btn-outline-danger btn-sm me-2" onClick={() => setSelectedCamp(camp._id)}>View Donors</button>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => {
                    const link = `${window.location.origin}/register?campId=${camp._id}`;
                    navigator.clipboard.writeText(link);
                    alert(`✅ Registration link copied:\n${link}`);
                  }}>Copy Registration Link</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowQR(prev => ({ ...prev, [camp._id]: !prev[camp._id] }))}>
                    {showQR[camp._id] ? "Hide QR" : "Show QR"}
                  </button>
                  {showQR[camp._id] && <div className="mt-2"><QRCodeCanvas value={`${window.location.origin}/register?campId=${camp._id}`} size={128}/></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default Admin;
