import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Direct live domain
const API_BASE = "https://lifelinebloodcenter.org/api";

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
    name: "", location: "", date: "", organizerName: "", organizerContact: "", proName: "", hospitalName: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");
    if (!token) navigate("/admin-login");
    else fetchCamps();
  }, []);

  useEffect(() => {
    if (selectedCamp) fetchDonors();
  }, [selectedCamp]);

  const fetchCamps = async () => {
    setLoadingCamps(true);
    try {
      const res = await axios.get(`${API_BASE}/camps`);
      setCamps(res.data);
    } catch (err) {
      console.error(err);
      setCamps([]);
    } finally {
      setLoadingCamps(false);
    }
  };

  const fetchDonors = async () => {
    const token = localStorage.getItem("admin-token");
    if (!token) return navigate("/admin-login");

    setLoadingDonors(true);
    try {
      const res = await axios.get(`${API_BASE}/donors/camp/${selectedCamp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonors(res.data || []);
    } catch (err) {
      console.error(err);
      setDonors([]);
      if ([401, 403].includes(err.response?.status)) {
        localStorage.removeItem("admin-token");
        navigate("/admin-login");
      }
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
      const token = localStorage.getItem("admin-token");
      await axios.post(`${API_BASE}/camps`, newCamp, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewCamp({
        name: "", location: "", date: "", organizerName: "", organizerContact: "", proName: "", hospitalName: ""
      });
      fetchCamps();
      alert("Camp added successfully!");
    } catch (err) {
      console.error(err);
      alert("Error adding camp.");
    }
  };

  const handleDeleteDonor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donor?")) return;
    try {
      const token = localStorage.getItem("admin-token");
      await axios.delete(`${API_BASE}/donors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDonors();
      alert("Donor deleted successfully!");
    } catch (err) {
      console.error(err);
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
      const token = localStorage.getItem("admin-token");
      await axios.put(`${API_BASE}/donors/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonors((prev) =>
        prev.map((d) => (d._id === id ? { ...d, ...editForm } : d))
      );
      setEditDonorId(null);
    } catch (err) {
      console.error(err);
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
      index + 1,
      donor.name,
      donor.bloodGroup,
      donor.age,
      donor.weight,
      donor.email,
      donor.phone,
      donor.address,
      donor.remark || ""
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

      {/* Donor Table */}
      {selectedCamp && (
        <div className="mt-5">
          <h4 className="text-danger">Donors for Camp: {camps.find(c => c._id === selectedCamp)?.name || ""}</h4>
          <input type="text" className="form-control mb-3" placeholder="Search donors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
          <button className="btn btn-success mb-3" onClick={downloadPDF}>Download PDF</button>

          {loadingDonors ? <p>Loading donors...</p> :
          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center align-middle">
              <thead className="table-danger">
                <tr>
                  {["#","Name","Blood Group","Age","Weight (kg)","Email","Phone","Address","Remark","Action"].map((h,i)=><th key={i}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredDonors.length === 0 ? (
                  <tr><td colSpan="10">No donor data available.</td></tr>
                ) : filteredDonors.map((donor,index) => (
                  <tr key={donor._id}>
                    <td>{index + 1}</td>
                    <td>{editDonorId === donor._id ? <input className="form-control form-control-sm" name="name" value={editForm.name} onChange={handleEditChange}/> : donor.name}</td>
                    <td>{editDonorId === donor._id ? (
                      <select className="form-select form-select-sm" name="bloodGroup" value={editForm.bloodGroup} onChange={handleEditChange}>
                        <option value="">Select</option>
                        {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    ) : donor.bloodGroup}</td>
                    <td>{editDonorId === donor._id ? <input className="form-control form-control-sm" name="age" value={editForm.age} onChange={handleEditChange}/> : donor.age}</td>
                    <td>{editDonorId === donor._id ? <input className="form-control form-control-sm" name="weight" value={editForm.weight} onChange={handleEditChange}/> : donor.weight}</td>
                    <td>{editDonorId === donor._id ? <input className="form-control form-control-sm" name="email" value={editForm.email} onChange={handleEditChange}/> : donor.email}</td>
                    <td>{editDonorId === donor._id ? <input className="form-control form-control-sm" name="phone" value={editForm.phone} onChange={handleEditChange}/> : donor.phone}</td>
                    <td>{editDonorId === donor._id ? <input className="form-control form-control-sm" name="address" value={editForm.address} onChange={handleEditChange}/> : donor.address}</td>
                    <td>
                      <select className="form-select form-select-sm" value={donor.remark || ""} onChange={async e => {
                        const remark = e.target.value;
                        try {
                          const token = localStorage.getItem("admin-token");
                          await axios.put(`${API_BASE}/donors/${donor._id}`, { remark }, { headers: { Authorization: `Bearer ${token}` } });
                          setDonors(prev => prev.map(d => d._id === donor._id ? { ...d, remark } : d));
                        } catch { alert("Error updating remark"); }
                      }}>
                        <option value="">Select</option>
                        <option value="Donation Done">Donation Done</option>
                        <option value="Not Done">Not Done</option>
                      </select>
                    </td>
                    <td>{editDonorId === donor._id ? (
                      <>
                        <button className="btn btn-sm btn-success me-2" onClick={() => handleEditSave(donor._id)}>Save</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditDonorId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(donor)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteDonor(donor._id)}>Delete</button>
                      </>
                    )}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </div>
      )}
    </div>
  );
};

export default Admin;
