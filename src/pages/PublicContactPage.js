import React, { useState, useEffect } from "react";
import axios from "../axios";
import MainNavbar from "../components/MainNavbar";
import Sidebar from "../components/Sidebar";
import { Container, Form, Button } from "react-bootstrap";
import {toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

const PublicContactPage = () => {
  const accessToken = localStorage.getItem("accessToken");
  const isAuthenticated = !!accessToken;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    });


  const [userData, setUserData] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      axios
        .get("users/user/profile/update/", {
          headers: { Authorization: `Token ${accessToken}` },
        })
        .then((res) => {
          const user = res.data.user || res.data;
          setUserData(user);
          setFormData((prev) => ({
            ...prev,
            name: user.name || "",
            email: user.email || "",
            subject: "",
            message: "",
          }));
        })
        .catch((err) => console.error("Failed to fetch user profile:", err));
    }
  }, [accessToken]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("contact/public/", formData);
      toast.success(" Message sent!");
      setFormData({ name: isAuthenticated ? userData.name || "" : "", email: isAuthenticated ? userData.email || "" : "", subject: "", message: "" });
    } catch (err) {
        const errors = err.response?.data;
        if (errors) {
            Object.entries(errors).forEach(([field, msgs]) => {
            msgs.forEach((msg) => toast.error(`${field}: ${msg}`));
            });
        } else {
            toast.error(" Submission failed.");
        }
            }
  };

  return (
    <>
      <MainNavbar />

      {isAuthenticated && (
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        )}

      {isAuthenticated && (
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      )}

      <div
        className="content-area"
        style={{
          marginTop: "56px",
          transition: "filter 0.3s ease",
          filter: isAuthenticated && sidebarOpen ? "blur(0.9px) brightness(0.8)" : "none",
        }}
      >
        <Container style={{ maxWidth: "600px" }}>
          <h4 className="fw-bold mt-3 mb-4 text-center">📮 Public Contact Form</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Your Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                readOnly={isAuthenticated}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                readOnly={isAuthenticated}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              ✉️ Send Message
            </Button>
          </Form>
        </Container>
      </div>
    </>
  );
};

export default PublicContactPage;
