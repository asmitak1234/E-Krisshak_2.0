import React, { useState } from "react";
// import axios from "../axios";
import axios from "axios";
import Cookies from "js-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";
import MainNavbar from "../components/MainNavbar";
import "../App.css"; 

const LoginPage = () => {
  const [role, setRole] = useState("krisshak");
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const successMessage = location.state?.message;

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      role,
      preferred_language: Cookies.get("preferredLanguage") || "en",
      username_or_email:
        role === "state_admin" || role === "district_admin"
          ? form.email // will be the username
          : form.email.toLowerCase(),
      password: form.password,
    };

    axios
      .post("https://web-production-f62a7.up.railway.app/api/users/login/", payload)
      .then((res) => {
          localStorage.setItem("accessToken", res.data.token);
          localStorage.setItem("userType", role);
          localStorage.setItem("userId", res.data.user_id);
          Cookies.set("preferredLanguage", res.data.preferred_language);
          navigate("/search");
        })
      .catch((err) => {
        console.error("🛑 Login failed:", err);

        // More defensive fallback
        if (err.response) {
          const msg = err.response.data?.error || "Login failed: unexpected response.";
          setError(msg);
        } else if (err.request) {
          setError("No response from server. Please check your internet or try again.");
        } else {
          setError("Something went wrong while preparing the request.");
        }
      });

  };

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const renderSwitchRole = (r) => {
    if (r === role) return null; // 🔥 Skip the current role
    return (
      <Button
        variant="outline-secondary"
        className="me-2 mt-2"
        onClick={() => setRole(r)}
      >
        Login as {r.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Button>
    );
  };


  return (
    <>
    <MainNavbar/>
    <Container className="page-content mt-5" style={{ maxWidth: "500px" }}>
      <h3 className="text-center mb-3">
        Login as {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </h3>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">
            {role === "state_admin" || role === "district_admin"
              ? "Username"
              : "Email"}
          </Form.Label>
          <Form.Control
            name="email"
            type={role === "state_admin" || role === "district_admin" ? "text" : "email"}
            onChange={handleInput}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="fw-bold">Password</Form.Label>
          <Form.Control
            name="password"
            type="password"
            onChange={handleInput}
            minLength={8}
            required
            onBlur={() => {
              const { password } = form;
              if (
                password &&
                (!/[A-Z]/.test(password) ||
                  !/[a-z]/.test(password) ||
                  !/[0-9]/.test(password))
              ) {
                alert(
                  "Password must contain uppercase, lowercase, and at least one digit."
                );
              }
            }}
          />
        </Form.Group>

        <div className="text-center my-3">
          <Button
            type="submit"
            variant="primary"
            className="px-4 py-1 fw-bold fs-5"
            style={{ minWidth: "140px", borderRadius: "8px" }}
          >
            Login
          </Button>
        </div>
        
      </Form>
            <br/>
      <div className="mt-4 text-center">
        <strong className="fs-5">Select Role:</strong><br />
        <div>{renderSwitchRole("krisshak")}</div>
        <div>{renderSwitchRole("bhooswami")}</div>
        <div>{renderSwitchRole("district_admin")}</div>
        <div>{renderSwitchRole("state_admin")}</div>
      </div>

      {["krisshak", "bhooswami"].includes(role) && (
      <div className="text-center mt-3">
        <a href="/forgot-password">Forgot Password?</a>
      </div>
)}

    </Container>
    </>
  );
};

export default LoginPage;
