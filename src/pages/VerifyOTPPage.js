import React, { useState } from "react";
import axios from "../axios";
import { Container, Form, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import "../App.css"; 

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefilledEmail = location.state?.email || "";

  const [form, setForm] = useState({ email: prefilledEmail, otp: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("users/verify-otp/", form)
      .then(() => {
        alert("Email verified successfully.");
        navigate("/login", { state: { message: "✅ Email verified! Please log in to continue." } });
      })
      .catch((err) => {
        alert(
          err.response?.data?.error || "Invalid or expired OTP. Please try again."
        );
      });
  };

  return (
    <>
    <MainNavbar/>
    <Container className="page-content mt-5">
      <h3 className="text-center mb-4">Verify Your Email</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mt-3">
          <Form.Label>OTP</Form.Label>
          <Form.Control
            name="otp"
            value={form.otp}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <div className="text-center mt-4">
          <Button type="submit">Verify</Button>
        </div>
      </Form>
    </Container>
    </>
  );
};

export default VerifyOTPPage;
