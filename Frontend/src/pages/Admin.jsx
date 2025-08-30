import React, { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { QRCodeCanvas } from "qrcode.react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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
      navigate("/login")
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
      console.log("Donors response:", res.data)
      setDonors(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Failed to fetch donors:", error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("admin-token")
        navigate("/admin-login")
      }
      setDonors([])
    }
  }

  const fetchCamps = async () => {
    try {
      const res = await axios.get("https://www.lifelinebloodcenter.org/api/camps")
      console.log("Camps response:", res.data)
      setCamps(Array.isArray(res.data) ? res.data : [])
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
      await axios.post("https://www.lifelinebloodcenter.org/api/camps", newCamp, {
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
      await axios.delete(`http://lifelinebloodcenter.org/api/donors/${id}`, {
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
    if (!Array.isArray(donors) || donors.length === 0) {
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
        {Array.isArray(camps) &&
          camps.map((camp) => (
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
                  </p>
                  <button
                    className="btn btn-danger me-2"
                    onClick={() => setSelectedCamp(camp._id)}
                  >
                    View Donors
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Donors Section */}
      {selectedCamp && (
        <>
          <div className="my-3">
            <h3 className="text-danger mb-3">
              Donors List for Camp:{" "}
              {camps.find((c) => c._id === selectedCamp)?.name || ""}
            </h3>

            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search donors by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-danger" onClick={downloadPDF}>
                Download PDF
              </button>
            </div>

            <div className="table-responsive" style={{ maxHeight: "500px" }}>
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-danger sticky-top">
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
                    <th>QR Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(donors) &&
                    donors
                      .filter((donor) =>
                        donor.name.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((donor, index) => (
                        <tr key={donor._id}>
                          <td>{index + 1}</td>
                          <td>
                            {editDonorId === donor._id ? (
                              <input
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                              />
                            ) : (
                              donor.name
                            )}
                          </td>
                          <td>{donor.bloodGroup}</td>
                          <td>
                            {editDonorId === donor._id ? (
                              <input
                                type="number"
                                name="age"
                                value={editForm.age}
                                onChange={handleEditChange}
                                min={0}
                              />
                            ) : (
                              donor.age
                            )}
                          </td>
                          <td>
                            {editDonorId === donor._id ? (
                              <input
                                type="number"
                                name="weight"
                                value={editForm.weight}
                                onChange={handleEditChange}
                                min={0}
                              />
                            ) : (
                              donor.weight
                            )}
                          </td>
                          <td>
                            {editDonorId === donor._id ? (
                              <input
                                type="email"
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
                                type="text"
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
                                type="text"
                                name="address"
                                value={editForm.address}
                                onChange={handleEditChange}
                              />
                            ) : (
                              donor.address
                            )}
                          </td>
                          <td>
                            {editDonorId === donor._id ? (
                              <input
                                type="text"
                                name="remark"
                                value={editForm.remark}
                                onChange={handleEditChange}
                              />
                            ) : (
                              donor.remark || ""
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() =>
                                setShowQR((prev) => ({
                                  ...prev,
                                  [donor._id]: !prev[donor._id],
                                }))
                              }
                            >
                              {showQR[donor._id] ? "Hide" : "Show"} QR
                            </button>
                            {showQR[donor._id] && (
                              <QRCodeCanvas
                                value={`${window.location.origin}/donor/${donor._id}`}
                                size={128}
                                level="H"
                                includeMargin={true}
                              />
                            )}
                          </td>
                          <td>
                            {editDonorId === donor._id ? (
                              <>
                                <button
                                  className="btn btn-success btn-sm me-2"
                                  onClick={() => handleEditSave(donor._id)}
                                >
                                  Save
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setEditDonorId(null)}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-primary btn-sm me-2"
                                  onClick={() => handleEditClick(donor)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteDonor(donor._id)}
                                >
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
          </div>
        </>
      )}
    </div>
  )
}

export default Admin
