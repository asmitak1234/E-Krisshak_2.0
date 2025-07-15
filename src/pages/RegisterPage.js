import React, { useEffect, useState } from "react";
import axios from "../axios";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import "../App.css"; 

const RegisterPage = () => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
    state_id: "",
    district_id: "",
    user_type: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "state_id") {
      setForm((prev) => ({ ...prev, district_id: "" }));
      axios
        .get(`users/districts/?state_id=${value}`)
        .then((res) => setDistricts(res.data))
        .catch(console.error);
    }

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

  const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      user_type: form.user_type,
      age: form.age,
      gender: form.gender,
      state: parseInt(form.state_id),
      district: parseInt(form.district_id),
      preferred_language: "en",
    };

    axios
      .post("users/register/", payload)
      .then(() => {
        alert("Registered! Check your email for OTP.");
        navigate("/verify-otp", { state: { email: form.email } });
      })
      .catch((err) => {
        alert(
          JSON.stringify(err.response?.data || "Something went wrong.")
        );
      });
  };

  useEffect(() => {
    axios
      .get("users/states/")
      .then((res) => setStates(res.data))
      .catch((err) => console.error("Failed to load states:", err));
  }, []);


  return (
    <>
    <MainNavbar/>
    <Container className="page-content mt-5">
      <h3 className="text-center mb-4">Create Your Account</h3>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" onChange={handleChange} required />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" type="email" onChange={handleChange} required />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Age</Form.Label>
              <Form.Control name="age" type="number" onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Gender</Form.Label>
              <Form.Select name="gender" onChange={handleChange} required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>User Type</Form.Label>
              <Form.Select name="user_type" onChange={handleChange} required>
                <option value="">Select</option>
                <option value="krisshak">Krisshak</option>
                <option value="bhooswami">Bhooswami</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>State</Form.Label>
              <Form.Select name="state_id" onChange={handleChange} required>
                <option value="">Select</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>District</Form.Label>
              <Form.Select name="district_id" onChange={handleChange} required>
                <option value="">Select</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control name="password" type="password" onChange={handleChange} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control name="confirmPassword" type="password" onChange={handleChange} />
            </Form.Group>
          </Col>
        </Row>

        <div className="text-center my-3">
                  <Button
                    type="submit"
                    variant="primary"
                    className="px-4 py-1 fw-bold fs-5"
                    style={{ minWidth: "140px", borderRadius: "8px" }}
                  >
                    Register
                  </Button>
                </div>
      </Form>
    </Container>
    </>
  );
};

export default RegisterPage;
