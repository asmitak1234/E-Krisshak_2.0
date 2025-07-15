import React, { useEffect, useState } from "react";
import axios from "../axios";
import Cookies from "js-cookie";
import { Container, Row, Col } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import MainNavbar from "../components/MainNavbar";
import "../App.css";

const HomePage = () => {
  const [lang, setLang] = useState(Cookies.get("preferredLanguage") || null);
  const [languageConfirmed, setLanguageConfirmed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const [userType, setUserType] = useState(null);

  const confirmLanguage = (chosenLang) => {
    Cookies.set("preferredLanguage", chosenLang, { path: "/" });

    axios
      .get(`/core/set-language/${chosenLang}/`)
      .then(() => {
        setLang(chosenLang);
        setLanguageConfirmed(true);
      })
      .catch((err) => {
        console.error("Language setting failed:", err);
        alert("Could not sync language preference.");
      });
  };

  const handleLanguagePrompt = () => {
    const chosenLang = window.confirm("Click OK for English, Cancel for Hindi") ? "en" : "hi";
    confirmLanguage(chosenLang);
  };

  useEffect(() => {
    if (!lang) {
      setLanguageConfirmed(false); // wait for user to trigger
    } else {
      setLanguageConfirmed(true);
    }
  }, [lang]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      axios
        .get("users/user/profile/update/", {
          headers: { Authorization: `Token ${token}` },
        })
        .then((res) => {
          const name = res.data.name || res.data.user?.name;
          if (name) setUserName(name);

          const type = res.data.user_type || res.data.user?.user_type;
          if (type) setUserType(type);
        })
        .catch((err) => console.error("Failed to fetch user name:", err));
    }
  }, []);

  return (
    <>
      <MainNavbar />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div
        className="content-area"
        style={{
          marginTop: "56px",
          filter: sidebarOpen ? "blur(0.9px) brightness(0.8)" : "none",
          transition: "filter 0.3s ease",
        }}
      >
        <div className="container-fluid text-center">
          
          {!languageConfirmed && (
            <div className="alert alert-warning mt-4">
              🌐 Please choose your language preference:
              <button
                className="btn btn-sm btn-outline-primary mx-3"
                onClick={handleLanguagePrompt}
              >
                Select Language
              </button>
            </div>
          )}

          {userName && (
            <h4 className="mb-3">
              👋 Welcome back <span style={{ textTransform: "capitalize" }}>{userType}</span> 🌱 !<br />
              <strong><i>{userName},</i></strong> So Happy to see you 🥰💕
            </h4>
          )}

          <h1>Welcome to E-Krisshak 2.0!</h1>
          <p>This platform empowers Krisshaks and Bhooswamis to connect transparently and securely.</p>

          {languageConfirmed && (
            <p className="text-muted fst-italic">
              🌍 Language Preference: <strong>{lang?.toUpperCase()}</strong>
            </p>
          )}

          <Row className="mt-4">
            <Col>
              <img src="/farm1.jpg" alt="farm" className="img-fluid" />
            </Col>
            <Col>
              <img src="/farm2.jpg" alt="field" className="img-fluid" />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default HomePage;
