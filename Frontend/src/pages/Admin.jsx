import React, { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { QRCodeCanvas } from "qrcode.react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
const API_BASE = "https://lifelinebloodcenter.org/api"
const Admin = () => {
  const [donors, setDonors] = useState([])
  const [camps, setCamps] = useState([])
  const [selectedCamp, setSelectedCamp] = useState(null)
  const [showQR, setShowQR] = useState({})
  const [searchTerm, setSearchTerm] = useState("")

  const [editDonorId, setEditDonorId] = useState(null)
  const [editForm, setEditForm] = useState({})

  const [newCamp, setNewCamp] = useState({
    name: "",
    location: "",
    date: "",
    organizerName: "",
    organizerContact: "",
    proName: "",
    hospitalName: "",
  })

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (!token) {
      navigate("/admin-login")
    } else {
      fetchCamps()
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("admin-token")
    if (selectedCamp && token) {
      fetchDonors(token)
    }
  }, [selectedCamp])

  const fetchDonors = async (token) => {
    try {
      const res = await axios.get(
        `https://www.lifelinebloodcenter.org/api/donors/camp/${selectedCamp}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      setDonors(res.data)
    } catch (error) {
      console.error("Failed to fetch donors:", error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("admin-token")
        navigate("/admin-login")
      }
    }
  }

  const fetchCamps = async () => {
    try {
      const res = await axios.get("https://www.lifelinebloodcenter.org/api/camps")
      setCamps(res.data)
    } catch (err) {
      setCamps([])
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin-token")
    navigate("/admin-login")
  }

  const handleNewCampChange = (e) => {
    setNewCamp({ ...newCamp, [e.target.name]: e.target.value })
  }

  const handleNewCampSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("admin-token")
      await axios.post("https://lifelinebloodcenter.org/api/camps", newCamp, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNewCamp({
        name: "",
        location: "",
        date: "",
        organizerName: "",
        organizerContact: "",
        proName: "",
        hospitalName: "",
      })
      fetchCamps()
      alert("Camp added successfully!")
    } catch (err) {
      alert("Error adding camp.")
    }
  }

  // Delete donor
  const handleDeleteDonor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donor?")) return
    try {
      const token = localStorage.getItem("admin-token")
      await axios.delete(`https://lifelinebloodcenter.org/api/donors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      alert("Donor deleted successfully!")
      fetchDonors(token) // refresh list
    } catch (err) {
      alert("Error deleting donor")
    }
  }

  // Edit donor
  const handleEditClick = (donor) => {
    setEditDonorId(donor._id)
    setEditForm({ ...donor })
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditSave = async (id) => {
    try {
      const token = localStorage.getItem("admin-token")
      await axios.put(`https://www.lifelinebloodcenter.org/api/donors/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDonors((prev) =>
        prev.map((d) => (d._id === id ? { ...editForm } : d))
      )
      setEditDonorId(null)
    } catch (err) {
      alert("Error saving donor update")
    }
  }

  // PDF Download
  const downloadPDF = () => {
    if (!donors.length) {
      alert("No donors to export.")
      return
    }

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text(
      `Donor List for Camp: ${
        camps.find((c) => c._id === selectedCamp)?.name || ""
      }`,
      14,
      15
    )

    const tableColumn = [
      "#",
      "Name",
      "Blood Group",
      "Age",
      "Weight (kg)",
      "Email",
      "Phone",
      "Address",
      "Remark",
    ]
    const tableRows = donors.map((donor, index) => [
      index + 1,
      donor.name,
      donor.bloodGroup,
      donor.age,
      donor.weight,
      donor.email,
      donor.phone,
      donor.address,
      donor.remark || "",
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    })

    doc.save(
      `DonorList_${camps.find((c) => c._id === selectedCamp)?.name || ""}.pdf`
    )
  }

  return (
    <div className="container py-2">
      {/* Sticky Navbar Header */}
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
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Add Camp Form */}
      <form
        onSubmit={handleNewCampSubmit}
        className="border p-3 rounded mb-4 bg-light"
      >
        <h5>Add New Camp</h5>
        <div className="row g-2">
          <div className="col-md-4">
            <input
              className="form-control"
              name="name"
              placeholder="Camp Name"
              value={newCamp.name}
              onChange={handleNewCampChange}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              name="location"
              placeholder="Location"
              value={newCamp.location}
              onChange={handleNewCampChange}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              name="date"
              type="date"
              value={newCamp.date}
              onChange={handleNewCampChange}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              name="organizerName"
              placeholder="Organizer Name"
              value={newCamp.organizerName}
              onChange={handleNewCampChange}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              name="organizerContact"
              placeholder="Organizer Contact No."
              value={newCamp.organizerContact}
              onChange={handleNewCampChange}
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              name="proName"
              placeholder="PRO Name"
              value={newCamp.proName}
              onChange={handleNewCampChange}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              name="hospitalName"
              value={newCamp.hospitalName}
              onChange={handleNewCampChange}
              required
            >
              <option value="">Select Hospital</option>
              <option value="Apollo Hospital">Apollo Hospital</option>
              <option value="Fortis Hospital">Fortis Hospital</option>
              <option value="AIIMS">AIIMS</option>
              <option value="Nanavati Hospital">Nanavati Hospital</option>
              <option value="Tata Memorial Hospital">Tata Memorial Hospital</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          Add Camp
        </button>
      </form>

      {/* Camp Cards */}
      <div className="row g-3">
        {camps.map((camp) => (
          <div key={camp._id} className="col-md-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title text-danger">{camp.name}</h5>
                <p className="card-text">
                  <strong>Location:</strong> {camp.location || "N/A"}
                  <br />
                  <strong>Date:</strong>{" "}
                  {camp.date ? new Date(camp.date).toLocaleDateString() : "N/A"}
                  <br />
                  <strong>Organizer:</strong> {camp.organizerName || "N/A"}
                  <br />
                  <strong>Contact:</strong> {camp.organizerContact || "N/A"}
                  <br />
                  <strong>PRO:</strong> {camp.proName || "N/A"}
                  <br />
                  <strong>Hospital:</strong> {camp.hospitalName || "N/A"}
                  <br />
                  <strong>Donors Registered:</strong> {camp.donorCount ?? 0}
                </p>
                <button
                  className="btn btn-outline-danger btn-sm me-2"
                  onClick={() => setSelectedCamp(camp._id)}
                >
                  View Donors
                </button>

                <div className="mt-2">
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => {
                      const shareLink = `${window.location.origin}/register?campId=${camp._id}`
                      navigator.clipboard.writeText(shareLink)
                      alert(`✅ Registration link copied:\n${shareLink}`)
                    }}
                  >
                    Copy Registration Link
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      setShowQR((prev) => ({
                        ...prev,
                        [camp._id]: !prev[camp._id],
                      }))
                    }
                  >
                    {showQR?.[camp._id] ? "Hide QR" : "Show QR"}
                  </button>

                  {showQR?.[camp._id] && (
                    <div className="mt-2">
                      <QRCodeCanvas
                        value={`${window.location.origin}/register?campId=${camp._id}`}
                        size={128}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Donor Table */}
      {selectedCamp && (
        <div className="mt-5">
          <h4 className="text-danger">
            Donors for Camp: {camps.find((c) => c._id === selectedCamp)?.name || ""}
          </h4>

          {/* Search box */}
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search donors by name, blood group, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button className="btn btn-success mb-3" onClick={downloadPDF}>
            Download PDF
          </button>

          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center align-middle">
              <thead className="table-danger">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Blood Group</th>
                  <th>Age</th>
                  <th>Weight (kg)</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Remark</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {donors
                  .filter((donor) =>
                    `${donor.name} ${donor.bloodGroup} ${donor.phone}`
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((donor, index) => (
                    <tr key={donor._id}>
                      <td>{index + 1}</td>
                      <td>
                        {editDonorId === donor._id ? (
                          <input
                            className="form-control form-control-sm"
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                          />
                        ) : (
                          donor.name
                        )}
                      </td>
                      <td>
                        {editDonorId === donor._id ? (
                          <select
                            className="form-select form-select-sm"
                            name="bloodGroup"
                            value={editForm.bloodGroup}
                            onChange={handleEditChange}
                          >
                            <option value="">Select</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        ) : (
                          donor.bloodGroup
                        )}
                      </td>
                      <td>
                        {editDonorId === donor._id ? (
                          <input
                            className="form-control form-control-sm"
                            name="age"
                            value={editForm.age}
                            onChange={handleEditChange}
                          />
                        ) : (
                          donor.age
                        )}
                      </td>
                      <td>
                        {editDonorId === donor._id ? (
                          <input
                            className="form-control form-control-sm"
                            name="weight"
                            value={editForm.weight}
                            onChange={handleEditChange}
                          />
                        ) : (
                          donor.weight
                        )}
                      </td>
                      <td>
                        {editDonorId === donor._id ? (
                          <input
                            className="form-control form-control-sm"
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                          />
                        ) : (
                          donor.email
                        )}
                      </td>
                      <td>
                        {editDonorId === donor._id ? (
                          <input
                            className="form-control form-control-sm"
                            name="phone"
                            value={editForm.phone}
                            onChange={handleEditChange}
                          />
                        ) : (
                          donor.phone
                        )}
                      </td>
                      <td>
                        {editDonorId === donor._id ? (
                          <input
                            className="form-control form-control-sm"
                            name="address"
                            value={editForm.address}
                            onChange={handleEditChange}
                          />
                        ) : (
                          donor.address
                        )}
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={donor.remark || ""}
                          onChange={async (e) => {
                            const newRemark = e.target.value
                            try {
                              const token = localStorage.getItem("admin-token")
                              await axios.put(
                                `https://lifelinebloodcenter.org/api/donors/${donor._id}`,
                                { remark: newRemark },
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              )
                              setDonors((prev) =>
                                prev.map((d) =>
                                  d._id === donor._id
                                    ? { ...d, remark: newRemark }
                                    : d
                                )
                              )
                            } catch {
                              alert("Error updating remark")
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
                            <button
                              className="btn btn-sm btn-success me-2"
                              onClick={() => handleEditSave(donor._id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => setEditDonorId(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-sm btn-warning me-2"
                              onClick={() => handleEditClick(donor)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteDonor(donor._id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                {donors.length === 0 && (
                  <tr>
                    <td colSpan="10">No donor data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
