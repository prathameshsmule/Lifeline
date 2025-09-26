import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import '../styles/Admin.css';

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

  // NEW: camp filters
  const [campQuery, setCampQuery] = useState("");
  const [onlyUpcoming, setOnlyUpcoming] = useState(true);
  const [onlyComingSoon, setOnlyComingSoon] = useState(false); // ≤7 days
  const [sortMode, setSortMode] = useState("date-asc"); // date-asc | date-desc | newest-created (fallback)

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

  // ========= Helpers (dates) =========
  const toDate = (d) => (d ? new Date(d) : null);
  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const daysUntil = (d) => {
    if (!d) return Infinity;
    const today = startOfDay(new Date());
    const target = startOfDay(d);
    const diffMs = target - today;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };
  const isUpcoming = (d) => {
    if (!d) return false;
    return daysUntil(d) >= 0;
  };
  const isSoon = (d, windowDays = 7) => {
    if (!d) return false;
    const du = daysUntil(d);
    return du >= 0 && du <= windowDays;
  };

  // ========= Camps =========
  const fetchCamps = async () => {
    setLoadingCamps(true);
    try {
      const res = await axios.get(`${API_BASE}/camps/with-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCamps(res.data || []);
    } catch (err) {
      console.error("Failed to fetch camps:", err.response || err);
      setCamps([]);
      if ([401, 403].includes(err.response?.status)) handleLogout();
      alert(err?.response?.data?.message || err?.message || "Error fetching camps");
    } finally {
      setLoadingCamps(false);
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
      console.error("Failed to fetch donors:", err.response || err);
      setDonors([]);
      if ([401, 403].includes(err.response?.status)) handleLogout();
      alert(err?.response?.data?.message || err?.message || "Error fetching donors");
    } finally {
      setLoadingDonors(false);
    }
  };

  // ========= Auth =========
  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    navigate("/admin-login");
  };

  // ========= Add Camp =========
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
        name: "",
        location: "",
        date: "",
        organizerName: "",
        organizerContact: "",
        proName: "",
        hospitalName: "",
      });
      fetchCamps();
      alert("Camp added successfully!");
    } catch (err) {
      console.error(err.response || err);
      alert(err?.response?.data?.message || "Error adding camp.");
    }
  };

  // ========= Donor actions =========
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
      console.error(err.response || err);
      alert(err?.response?.data?.message || "Error deleting donor");
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
      setDonors((prev) => prev.map((d) => (d._id === id ? { ...editForm } : d)));
      setEditDonorId(null);
    } catch (err) {
      console.error(err.response || err);
      alert(err?.response?.data?.message || "Error saving donor update");
    }
  };

  // ========= PDF =========
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

  // ========= Derived: counts & filters =========
  const totalDonorsAcrossCamps = camps.reduce(
    (sum, c) => sum + (typeof c.donorCount === "number" ? c.donorCount : 0),
    0
  );

  const filteredCamps = useMemo(() => {
    let list = [...camps];
    const q = campQuery.trim().toLowerCase();

    if (q) {
      list = list.filter((c) => {
        const s = [
          c?.name,
          c?.location,
          c?.hospitalName,
          c?.organizerName,
          c?.organizerContact,
          c?.proName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return s.includes(q);
      });
    }

    if (onlyUpcoming) {
      list = list.filter((c) => isUpcoming(toDate(c?.date)));
    }

    if (onlyComingSoon) {
      list = list.filter((c) => isSoon(toDate(c?.date), 7));
    }

    list.sort((a, b) => {
      const da = a?.date ? new Date(a.date).getTime() : 0;
      const db = b?.date ? new Date(b.date).getTime() : 0;
      if (sortMode === "date-asc") return da - db;
      if (sortMode === "date-desc") return db - da;
      return 0;
    });

    return list;
  }, [camps, campQuery, onlyUpcoming, onlyComingSoon, sortMode]);

  // Camps within 3 days for banner alert
  const urgentCamps = useMemo(
    () =>
      camps
        .filter((c) => isSoon(toDate(c?.date), 3))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [camps]
  );

  // ========= UI =========
  return (
    <div className="container py-2">
      {/* Header */}
      <div
        className="d-flex justify-content-between align-items-center flex-wrap px-3 py-2"
        style={{
          position: "sticky",
          top: "70px",
          marginTop: "70px",
          backgroundColor: "white",
          borderBottom: "1px solid #ddd",
          zIndex: 1050,
        }}
      >
        <h2 className="text-danger mb-0">Camps</h2>
        <div className="d-flex align-items-center gap-3">
          <span className="badge text-bg-danger">
            Total donors (all camps): {totalDonorsAcrossCamps}
          </span>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* URGENT BANNER: camps in ≤ 3 days */}
      {!!urgentCamps.length && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mt-3" role="alert">
          <strong>Heads up:</strong>
          <span className="ms-1">
            {urgentCamps.map((c, i) => {
              const d = toDate(c.date);
              const du = daysUntil(d);
              const label =
                du === 0 ? "Today" : du === 1 ? "Tomorrow" : `In ${du} days`;
              return (
                <span key={c._id} className="me-3">
                  <span className="fw-semibold">{c.name}</span> ({label})
                </span>
              );
            })}
          </span>
        </div>
      )}

      {/* Add Camp Form */}
      <form onSubmit={handleNewCampSubmit} className="border p-3 rounded mb-4 bg-light">
        <h5>Add New Camp</h5>
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
            >
              <option value="">Select Hospital</option>
              {["Apollo Hospital", "Fortis Hospital", "AIIMS", "Nanavati Hospital", "Tata Memorial Hospital", "Other"].map((h, i) => (
                <option key={i} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Add Camp
        </button>
      </form>

      {/* Camp Filters */}
      <div className="border p-3 rounded mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-6">
            <label className="form-label">Search camps</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, location, hospital, organizer…"
              value={campQuery}
              onChange={(e) => setCampQuery(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Sort by</label>
            <select
              className="form-select"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
            >
              <option value="date-asc">Date: Soonest first</option>
              <option value="date-desc">Date: Latest first</option>
            </select>
          </div>
          <div className="col-md-3 d-flex gap-3 flex-wrap">
            <div className="form-check mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="onlyUpcoming"
                checked={onlyUpcoming}
                onChange={(e) => setOnlyUpcoming(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="onlyUpcoming">
                Only upcoming
              </label>
            </div>
            <div className="form-check mt-4">
              <input
                className="form-check-input"
                type="checkbox"
                id="onlySoon"
                checked={onlyComingSoon}
                onChange={(e) => setOnlyComingSoon(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="onlySoon">
                Coming soon (≤ 7 days)
              </label>
            </div>
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
          {filteredCamps.map((camp) => {
            const d = toDate(camp.date);
            const du = daysUntil(d); // can be negative for past
            const whenLabel =
              !d
                ? null
                : du < 0
                ? "Overdue"
                : du === 0
                ? "Today"
                : du === 1
                ? "Tomorrow"
                : `In ${du} days`;

            const dateBadgeClass =
              du < 0
                ? "text-bg-secondary"
                : du <= 3
                ? "text-bg-warning"
                : "text-bg-light";

            return (
              <div key={camp._id} className="col-md-4">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title text-danger d-flex justify-content-between align-items-start">
                      <span>{camp.name}</span>
                      <span className="badge text-bg-danger">
                        Donors: {typeof camp.donorCount === "number" ? camp.donorCount : 0}
                      </span>
                    </h5>

                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge text-bg-light">
                        {camp.date ? new Date(camp.date).toLocaleDateString() : "No date"}
                      </span>
                      {whenLabel && <span className={`badge ${dateBadgeClass}`}>{whenLabel}</span>}
                    </div>

                    <p className="card-text mb-3">
                      <strong>Location:</strong> {camp.location || "N/A"}
                      <br />
                      <strong>Organizer:</strong> {camp.organizerName || "N/A"}
                      <br />
                      <strong>Contact:</strong> {camp.organizerContact || "N/A"}
                      <br />
                      <strong>PRO:</strong> {camp.proName || "N/A"}
                      <br />
                      <strong>Hospital:</strong> {camp.hospitalName || "N/A"}
                    </p>

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
                    </div>

                    {showQR[camp._id] && (
                      <div className="mt-2">
                        <QRCodeCanvas value={`${window.location.origin}/register?campId=${camp._id}`} size={128} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {!filteredCamps.length && (
            <div className="col-12">
              <div className="alert alert-light border text-center">No camps match your filters.</div>
            </div>
          )}
        </div>
      )}

      {/* Donor Table */}
      {selectedCamp && (
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h4 className="text-danger mb-0">
              Donors for Camp: {camps.find((c) => c._id === selectedCamp)?.name || ""}
            </h4>
            <span className="badge text-bg-danger">Total donors in this camp: {donors.length}</span>
          </div>

          <input
            type="text"
            className="form-control my-3"
            placeholder="Search donors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-success mb-3" onClick={downloadPDF}>
            Download PDF
          </button>

          {loadingDonors ? (
            <p>Loading donors...</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover text-center align-middle">
                <thead className="table-danger">
                  <tr>
                    {["#", "Name", "Blood Group", "Age", "Weight (kg)", "Email", "Phone", "Address", "Remark", "Action"].map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {donors
                    .filter((d) =>
                      `${d?.name ?? ""} ${d?.bloodGroup ?? ""} ${d?.phone ?? ""}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
                    )
                    .map((donor, index) => (
                      <tr key={donor._id}>
                        <td>{index + 1}</td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="name" value={editForm.name || ""} onChange={handleEditChange} />
                          ) : (
                            donor.name
                          )}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <select className="form-select form-select-sm" name="bloodGroup" value={editForm.bloodGroup || ""} onChange={handleEditChange}>
                              <option value="">Select</option>
                              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                                <option key={bg} value={bg}>
                                  {bg}
                                </option>
                              ))}
                            </select>
                          ) : (
                            donor.bloodGroup
                          )}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="age" value={editForm.age || ""} onChange={handleEditChange} />
                          ) : (
                            donor.age
                          )}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="weight" value={editForm.weight || ""} onChange={handleEditChange} />
                          ) : (
                            donor.weight
                          )}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="email" value={editForm.email || ""} onChange={handleEditChange} />
                          ) : (
                            donor.email
                          )}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="phone" value={editForm.phone || ""} onChange={handleEditChange} />
                          ) : (
                            donor.phone
                          )}
                        </td>
                        <td>
                          {editDonorId === donor._id ? (
                            <input className="form-control form-control-sm" name="address" value={editForm.address || ""} onChange={handleEditChange} />
                          ) : (
                            donor.address
                          )}
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={donor.remark || ""}
                            onChange={async (e) => {
                              const remark = e.target.value;
                              try {
                                await axios.put(
                                  `${API_BASE}/donors/${donor._id}`,
                                  { remark },
                                  { headers: { Authorization: `Bearer ${token}` } }
                                );
                                setDonors((prev) => prev.map((d) => (d._id === donor._id ? { ...d, remark } : d)));
                              } catch {
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
                              <button className="btn btn-sm btn-success me-2" onClick={() => handleEditSave(donor._id)}>
                                Save
                              </button>
                              <button className="btn btn-sm btn-secondary" onClick={() => setEditDonorId(null)}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-sm btn-warning me-2" onClick={() => handleEditClick(donor)}>
                                Edit
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteDonor(donor._id)}>
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
