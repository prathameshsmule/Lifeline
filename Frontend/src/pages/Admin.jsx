import React, { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/Admin.css";

const QRCode = React.lazy(() => import("qrcode.react"));

// 🔧 Point to the API you’re actually running (prod vs local)
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "https://www.lifelinebloodcenter.org/api";

const Admin = () => {
  const [donors, setDonors] = useState([]);
  const [camps, setCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [showQR, setShowQR] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [campQuery, setCampQuery] = useState("");
  const [campSort, setCampSort] = useState("newest");

  const [loadingDonors, setLoadingDonors] = useState(false);
  const [loadingCamps, setLoadingCamps] = useState(false);

  // Donor inline edit
  const [editDonorId, setEditDonorId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Add Camp
  const [newCamp, setNewCamp] = useState({
    name: "", location: "", date: "",
    organizerName: "", organizerContact: "",
    proName: "", hospitalName: "",
  });

  // Camp EDIT (Modal)
  const [editCampId, setEditCampId] = useState(null);
  const [editCampForm, setEditCampForm] = useState({
    name: "", location: "", date: "",
    organizerName: "", organizerContact: "",
    proName: "", hospitalName: "",
  });
  const isEditModalOpen = Boolean(editCampId);

  const navigate = useNavigate();
  const token = localStorage.getItem("admin-token");

  useEffect(() => {
    if (!token) return navigate("/admin-login");
    fetchCamps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCamp) fetchDonors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamp]);

  // ========= Camps =========
  const fetchCamps = async () => {
    setLoadingCamps(true);
    try {
      const res = await axios.get(`${API_BASE}/camps/with-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCamps(res.data || []);
    } catch (err) {
      console.error("Failed to fetch camps:", err?.response || err);
      setCamps([]);
      const status = err?.response?.status;
      if (status === 401 || status === 403) handleLogout();
      alert(err?.response?.data?.message || err?.message || "Error fetching camps");
    } finally {
      setLoadingCamps(false);
    }
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
        name: "", location: "", date: "",
        organizerName: "", organizerContact: "",
        proName: "", hospitalName: "",
      });
      await fetchCamps();
      alert("Camp added successfully!");
    } catch (err) {
      console.error("Add camp failed:", err?.response || err);
      alert(err?.response?.data?.message || err?.message || "Error adding camp.");
    }
  };

  // ========= Camp Edit (Modal) =========
  const startEditCamp = (camp) => {
    setEditCampId(camp._id);
    setEditCampForm({
      name: camp.name || "",
      location: camp.location || "",
      date: camp.date ? new Date(camp.date).toISOString().slice(0, 10) : "",
      organizerName: camp.organizerName || "",
      organizerContact: camp.organizerContact || "",
      proName: camp.proName || "",
      hospitalName: camp.hospitalName || "",
    });
  };

  const handleEditCampChange = (e) => {
    const { name, value } = e.target;
    setEditCampForm((f) => ({ ...f, [name]: value }));
  };

  const cancelEditCamp = () => {
    setEditCampId(null);
    setEditCampForm({
      name: "", location: "", date: "",
      organizerName: "", organizerContact: "",
      proName: "", hospitalName: "",
    });
  };

  const saveCampEdits = async () => {
    if (!editCampId) return alert("No camp selected.");
    try {
      const payload = { ...editCampForm };
      // trim + remove blanks to avoid failing validators with empty strings
      for (const k of Object.keys(payload)) {
        if (typeof payload[k] === "string") payload[k] = payload[k].trim();
        if (payload[k] === "") delete payload[k];
      }

      const res = await axios.put(`${API_BASE}/camps/${editCampId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = res.data?.camp || null;
      if (updated) {
        setCamps((prev) =>
          prev.map((c) =>
            c._id === editCampId
              ? {
                  ...c,
                  ...updated,
                  donorCount:
                    typeof updated.donorCount === "number" ? updated.donorCount : c.donorCount,
                }
              : c
          )
        );
      } else {
        await fetchCamps();
      }

      cancelEditCamp();
      alert("Camp updated successfully!");
    } catch (err) {
      console.error("Camp update failed:", err?.response || err);
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || "Error updating camp";
      if (status === 409) {
        alert("Another camp with this name already exists. Please choose a different name.");
      } else if (status === 400 || status === 422) {
        alert(`Validation error: ${msg}`);
      } else if (status === 401 || status === 403) {
        alert("Your session expired. Please log in again.");
        handleLogout();
      } else {
        alert(`Update failed: ${msg}`);
      }
    }
  };

  // ========= Donors =========
  const fetchDonors = async () => {
    if (!selectedCamp) return;
    setLoadingDonors(true);
    try {
      const res = await axios.get(`${API_BASE}/donors/camp/${selectedCamp}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonors(res.data || []);
    } catch (err) {
      console.error("Failed to fetch donors:", err?.response || err);
      setDonors([]);
      const status = err?.response?.status;
      if (status === 401 || status === 403) handleLogout();
      alert(err?.response?.data?.message || err?.message || "Error fetching donors");
    } finally {
      setLoadingDonors(false);
    }
  };

  const handleDeleteDonor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donor?")) return;
    try {
      await axios.delete(`${API_BASE}/donors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchDonors();
      await fetchCamps(); // refresh counts
      alert("Donor deleted successfully!");
    } catch (err) {
      console.error("Delete donor failed:", err?.response || err);
      alert(err?.response?.data?.message || err?.message || "Error deleting donor");
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
      const { _id, ...payload } = editForm;
      const res = await axios.put(`${API_BASE}/donors/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updated = res.data?.donor || { ...payload, _id: id };
      setDonors((prev) => prev.map((d) => (d._id === id ? updated : d)));
      setEditDonorId(null);
    } catch (err) {
      console.error("Update donor failed:", err?.response || err);
      alert(err?.response?.data?.message || err?.message || "Error saving donor update");
    }
  };

  // ========= Utils =========
  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    navigate("/admin-login");
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
      donor.name ?? "",
      donor.bloodGroup ?? "",
      donor.age ?? "",
      donor.weight ?? "",
      donor.email ?? "",
      donor.phone ?? "",
      donor.address ?? "",
      donor.remark ?? "",
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(`DonorList_${campName}.pdf`);
  };

  const filteredDonors = donors.filter((d) =>
    `${d?.name ?? ""} ${d?.bloodGroup ?? ""} ${d?.phone ?? ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredCamps = camps
    .filter((c) => {
      const needle = campQuery.trim().toLowerCase();
      if (!needle) return true;
      return (
        (c?.name ?? "").toLowerCase().includes(needle) ||
        (c?.location ?? "").toLowerCase().includes(needle) ||
        (c?.hospitalName ?? "").toLowerCase().includes(needle)
      );
    })
    .sort((a, b) => {
      const da = a?.date ? new Date(a.date).getTime() : 0;
      const db = b?.date ? new Date(b.date).getTime() : 0;
      return campSort === "newest" ? db - da : da - db;
    });

  return (
    <div className="container py-2 admin-root">
      {/* Header */}
      <div className="admin-sticky-header d-flex justify-content-between align-items-center flex-wrap px-3 py-2">
        <h2 className="text-danger mb-0">Camps</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      {/* Add Camp Form */}
      <form onSubmit={handleNewCampSubmit} className="border p-3 rounded mb-4 bg-light admin-card">
        <h5 className="mb-3">Add New Camp</h5>
        <div className="row g-2">
          {["name", "location", "date", "organizerName", "organizerContact", "proName"].map((field, idx) => (
            <div className="col-md-4" key={idx}>
              <input
                className="form-control"
                type={field === "date" ? "date" : "text"}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={newCamp[field]}
                onChange={handleNewCampChange}
                required={field === "name"}
                disabled={isEditModalOpen}
              />
            </div>
          ))}
          <div className="col-md-4">
            <select
              className="form-select"
              name="hospitalName"
              value={newCamp.hospitalName}
              onChange={handleNewCampChange}
              required
              disabled={isEditModalOpen}
            >
              <option value="">Select Hospital</option>
              {["Apollo Hospital","Fortis Hospital","AIIMS","Nanavati Hospital","Tata Memorial Hospital","Other"].map((h, i) => (
                <option key={i} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3" disabled={isEditModalOpen}>Add Camp</button>
      </form>

      {/* Camp Filters */}
      <div className="admin-card border p-3 rounded mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Search camps by name, location, or hospital…"
              value={campQuery}
              onChange={(e) => setCampQuery(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={campSort} onChange={(e) => setCampSort(e.target.value)}>
              <option value="newest">Sort: Newest first</option>
              <option value="oldest">Sort: Oldest first</option>
            </select>
          </div>
        </div>
        <div className="mt-2 small text-muted">
          Showing <strong>{filteredCamps.length}</strong> of {camps.length} camps
        </div>
      </div>

      {/* Camp Cards */}
      {loadingCamps ? (
        <p>Loading camps...</p>
      ) : (
        <div className="row g-3">
          {filteredCamps.map((camp) => (
            <div key={camp._id} className="col-md-4">
              <div className="card h-100 admin-camp-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title text-danger mb-2">{camp.name}</h5>
                    <span className="badge text-bg-light admin-badge">
                      {camp.date ? new Date(camp.date).toLocaleDateString() : "No date"}
                    </span>
                  </div>
                  <p className="card-text mb-2">
                    <strong>Location:</strong> {camp.location || "N/A"}<br/>
                    <strong>Organizer:</strong> {camp.organizerName || "N/A"}<br/>
                    <strong>Contact:</strong> {camp.organizerContact || "N/A"}<br/>
                    <strong>PRO:</strong> {camp.proName || "N/A"}<br/>
                    <strong>Hospital:</strong> {camp.hospitalName || "N/A"}
                  </p>
                  <div className="mb-3">
                    <span className="badge rounded-pill text-bg-danger">
                      Donors: {typeof camp.donorCount === "number" ? camp.donorCount : 0}
                    </span>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <button className="btn btn-outline-danger btn-sm" onClick={() => setSelectedCamp(camp._id)}>
                      View Donors
                    </button>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => {
                        const link = `${window.location.origin}/register?campId=${camp._id}`;
                        navigator.clipboard.writeText(link);
                        alert(`✅ Registration link copied:\n${link}`);
                      }}
                    >
                      Copy Registration Link
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setShowQR((prev) => ({ ...prev, [camp._id]: !prev[camp._id] }))}
                    >
                      {showQR[camp._id] ? "Hide QR" : "Show QR"}
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => startEditCamp(camp)}
                    >
                      Edit
                    </button>
                  </div>

                  {showQR[camp._id] && (
                    <div className="mt-2">
                      <Suspense fallback={<div className="small text-muted">Loading QR…</div>}>
                        <QRCode.QRCodeCanvas value={`${window.location.origin}/register?campId=${camp._id}`} size={128} />
                      </Suspense>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!filteredCamps.length && (
            <div className="col-12">
              <div className="alert alert-light border text-center">No camps match your search.</div>
            </div>
          )}
        </div>
      )}

      {/* Donor Table */}
      {selectedCamp && (
        <div className="mt-5 admin-card border p-3 rounded">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="text-danger mb-0">
              Donors for Camp: {camps.find((c) => c._id === selectedCamp)?.name || ""}
            </h4>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                style={{ minWidth: 220 }}
                placeholder="Search donors…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-success" onClick={downloadPDF}>Download PDF</button>
            </div>
          </div>

          {loadingDonors ? (
            <p className="mt-3">Loading donors...</p>
          ) : (
            <div className="table-responsive mt-3">
              <table className="table table-bordered table-hover text-center align-middle admin-table">
                <thead className="table-danger">
                  <tr>
                    {["#", "Name", "Blood Group", "Age", "Weight (kg)", "Email", "Phone", "Address", "Remark", "Action"].map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDonors.length === 0 ? (
                    <tr>
                      <td colSpan="10">No donor data available.</td>
                    </tr>
                  ) : (
                    filteredDonors.map((donor, index) => (
                      <tr key={donor._id}>
                        <td>{index + 1}</td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="name" value={editForm.name ?? ""} onChange={handleEditChange} />
                          ) : (donor.name)}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <select className="form-select form-select-sm" name="bloodGroup" value={editForm.bloodGroup ?? ""} onChange={handleEditChange}>
                              <option value="">Select</option>
                              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                                <option key={bg} value={bg}>{bg}</option>
                              ))}
                            </select>
                          ) : (donor.bloodGroup)}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="age" value={editForm.age ?? ""} onChange={handleEditChange} />
                          ) : (donor.age)}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="weight" value={editForm.weight ?? ""} onChange={handleEditChange} />
                          ) : (donor.weight)}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="email" value={editForm.email ?? ""} onChange={handleEditChange} />
                          ) : (donor.email)}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="phone" value={editForm.phone ?? ""} onChange={handleEditChange} />
                          ) : (donor.phone)}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="address" value={editForm.address ?? ""} onChange={handleEditChange} />
                          ) : (donor.address)}
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={donor.remark || ""}
                            onChange={async (e) => {
                              const remark = e.target.value;
                              try {
                                await axios.put(`${API_BASE}/donors/${donor._id}`, { remark }, { headers: { Authorization: `Bearer ${token}` } });
                                setDonors((prev) => prev.map((d) => (d._id === donor._id ? { ...d, remark } : d)));
                              } catch (err) {
                                console.error("Update remark failed:", err?.response || err);
                                alert("Error updating remark");
                              }
                            }}
                          >
                            <option value="">Select</option>
                            <option value="Donation Done">Donation Done</option>
                            <option value="Not Done">Not Done</option>
                          </select>
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <>
                              <button className="btn btn-sm btn-success me-2" onClick={() => handleEditSave(donor._id)}>Save</button>
                              <button className="btn btn-sm btn-secondary" onClick={() => setEditDonorId(null)}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(donor)}>Edit</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteDonor(donor._id)}>Delete</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== Edit Camp Modal ===== */}
      {isEditModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={cancelEditCamp}
          />
          {/* Modal */}
          <div
            className="modal fade show"
            role="dialog"
            style={{ display: "block", zIndex: 1050 }}
            aria-modal="true"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Camp</h5>
                  <button type="button" className="btn-close" onClick={cancelEditCamp} aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Camp Name</label>
                      <input
                        className="form-control"
                        name="name"
                        value={editCampForm.name}
                        onChange={handleEditCampChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Location</label>
                      <input
                        className="form-control"
                        name="location"
                        value={editCampForm.location}
                        onChange={handleEditCampChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        name="date"
                        value={editCampForm.date}
                        onChange={handleEditCampChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Organizer Name</label>
                      <input
                        className="form-control"
                        name="organizerName"
                        value={editCampForm.organizerName}
                        onChange={handleEditCampChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Organizer Contact</label>
                      <input
                        className="form-control"
                        name="organizerContact"
                        value={editCampForm.organizerContact}
                        onChange={handleEditCampChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">PRO Name</label>
                      <input
                        className="form-control"
                        name="proName"
                        value={editCampForm.proName}
                        onChange={handleEditCampChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Hospital</label>
                      <select
                        className="form-select"
                        name="hospitalName"
                        value={editCampForm.hospitalName}
                        onChange={handleEditCampChange}
                      >
                        <option value="">Select Hospital</option>
                        {["Apollo Hospital","Fortis Hospital","AIIMS","Nanavati Hospital","Tata Memorial Hospital","Other"].map((h, i) => (
                          <option key={i} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={cancelEditCamp}>Cancel</button>
                  <button className="btn btn-success" onClick={saveCampEdits}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Admin;
