import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
// Optional: EmailJS (uncomment if needed)
// import emailjs from "@emailjs/browser";

const API_BASE = "https://www.lifelinebloodcenter.org/api"; 
// Change to your backend URL on Hostinger if different

const DonorRegistration = () => {
  const [donor, setDonor] = useState({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    email: "",
    phone: "",
    campId: "",
  });

  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ✅ Load camps from backend
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await axios.get(`${API_BASE}/camps/public`);
        setCamps(res.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load camps. Please try again later.");
      }
    };
    fetchCamps();
  }, []);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setDonor({ ...donor, [e.target.name]: e.target.value });
  };

  // ✅ Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Send donor data to backend
      const res = await axios.post(`${API_BASE}/donors`, donor);

      // ✅ Optional: send email via EmailJS (uncomment and configure)
      /*
      await emailjs.send(
        "your_service_id",
        "your_template_id",
        {
          donor_name: donor.name,
          donor_email: donor.email,
          donor_phone: donor.phone,
        },
        "your_public_key"
      );
      */

      setSuccess("Registration successful!");
      setDonor({
        name: "",
        age: "",
        gender: "",
        bloodGroup: "",
        email: "",
        phone: "",
        campId: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Donor Registration</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={donor.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="number"
                name="age"
                value={donor.age}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Gender</Form.Label>
              <Form.Select
                name="gender"
                value={donor.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Blood Group</Form.Label>
              <Form.Control
                type="text"
                name="bloodGroup"
                placeholder="e.g. O+, A-, AB+"
                value={donor.bloodGroup}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={donor.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={donor.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Camp</Form.Label>
              <Form.Select
                name="campId"
                value={donor.campId}
                onChange={handleChange}
                required
              >
                <option value="">Choose a camp</option>
                {camps.map((camp) => (
                  <option key={camp._id} value={camp._id}>
                    {camp.name} – {camp.location}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading} className="w-100">
              {loading ? <Spinner animation="border" size="sm" /> : "Register"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default DonorRegistration;
