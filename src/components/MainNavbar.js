import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import "../App.css";

const MainNavbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("accessToken");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Navbar
      bg="light"
      expand="lg"
      className="shadow-sm main-navbar"
      style={{ position: "fixed", top: 0, width: "100%", zIndex: 1000 }}
    >
      <Container className="d-flex justify-content-between align-items-center">
        <Navbar.Brand as={Link} to="/">
          <img src="/logo192.png" alt="logo" width="30" className="me-2" />
          E-Krisshak 2.0
        </Navbar.Brand>
        <Nav className="ms-auto d-flex align-items-center gap-2">
          {isAuthenticated ? (
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <>
              <Button variant="outline-primary" as={Link} to="/register">
                Register
              </Button>
              <Button variant="outline-success" as={Link} to="/login">
                Login
              </Button>
            </>
          )}
            <Button variant="outline-secondary" as={Link} to="/contact/public">
              📮 Contact Us
            </Button>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default MainNavbar;
