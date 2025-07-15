import React, { useState } from "react";
import axios from "../axios";
import { Container, Form, Button, Alert } from "react-bootstrap";
import MainNavbar from "../components/MainNavbar";
import "../App.css"; 

const ForgotResetPasswordPage = () => {
  const [phase, setPhase] = useState("email"); // "email" or "reset"
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ otp: "", new_password: "", confirm: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");
    axios
      .post("users/forgot-password/", { email })
      .then(() => {
        setMessage("OTP sent to your email.");
        setPhase("reset");
      })
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to send OTP.")
      );
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (form.new_password !== form.confirm) {
      return setError("Passwords do not match.");
    }

    const password = form.new_password;
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return setError(
        "Password must be 8+ chars with uppercase, lowercase, and a digit."
      );
    }

    axios
      .post("users/reset-password/", {
        email,
        otp: form.otp,
        new_password: password,
      })
      .then(() => {
        setMessage("Password reset successful. You can now log in.");
        setPhase("done");
      })
      .catch((err) =>
        setError(err.response?.data?.error || "Reset failed.")
      );
  };

  return (
    <>
    <MainNavbar/>
    <Container className="page-content mt-5" style={{ maxWidth: "500px" }}>
      <h3 className="text-center mb-3">Reset Password</h3>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {phase === "email" && (
        <Form onSubmit={handleEmailSubmit}>
          <Form.Group>
            <Form.Label className="fw-bold">Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <div className="text-center mt-4">
            <Button type="submit">Send OTP</Button>
          </div>
        </Form>
      )}

      {phase === "reset" && (
        <Form onSubmit={handleResetSubmit}>
          <Form.Group>
            <Form.Label className="fw-bold">OTP</Form.Label>
            <Form.Control
              name="otp"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label className="fw-bold">New Password</Form.Label>
            <Form.Control
              name="new_password"
              type="password"
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label className="fw-bold">Confirm Password</Form.Label>
            <Form.Control
              name="confirm"
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </Form.Group>
          <div className="text-center mt-4">
            <Button type="submit">Reset Password</Button>
          </div>
        </Form>
      )}

      {phase === "done" && (
        <div className="text-center mt-4">
          <a href="/login">Click here to log in</a>
        </div>
      )}
    </Container>
    </>
  );
};

export default ForgotResetPasswordPage;
