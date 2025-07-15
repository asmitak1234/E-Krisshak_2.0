import React, { useEffect, useState } from "react";
import axios from "../axios";
import { Container, Row, Col, Button, Tabs, Tab, Spinner } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import MainNavbar from "../components/MainNavbar";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileWithFetch from "../components/ProfileWithFetch"; // ✅ make sure the path is correct
import "../App.css"; 

const RequestsPage = ({ userType }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingIds, setLoadingIds] = useState([]);
  const loggedInUserId = parseInt(localStorage.getItem("userId") || "0" );

  const [openSections, setOpenSections] = useState({
    received: false,
    sent: false
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const { data } = await axios.get("/appointments/requests/", {
          headers: { Authorization: `Token ${token}` },
        });
        setSent(data.sent_requests || []);
        setReceived(data.received_requests || []);
      } catch (err) {
        toast.error("🚨 Uh oh. Failed to load requests. Try again?");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [location.pathname]);

  const handleAccept = async (id) => {
    setLoadingIds((prev) => [...prev, id]);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(`/appointments/accept-request/${id}/`, {}, {
        headers: { Authorization: `Token ${token}` },
      });

      setReceived((prev) => prev.filter((r) => r.id !== id));
      toast.success("🎉 Woo! Request accepted. Appointment confirmed. Let the prepping begin!");
      window.scrollTo({ top: 0, behavior: "smooth" });

      const { data } = await axios.get("/appointments/", {
        headers: { Authorization: `Token ${token}` },
      });
      localStorage.setItem("latestAppointmentSnapshot", JSON.stringify(data));
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("⛔ Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error("Could not accept request. Try again?");
      }
    } finally {
      setLoadingIds((prev) => prev.filter((val) => val !== id));
    }
  };

  const handleCancel = async (id) => {
    setLoadingIds((prev) => [...prev, id]);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`/appointments/cancel-request/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setSent((prev) => prev.filter((r) => r.id !== id));
      setReceived((prev) => prev.filter((r) => r.id !== id));
      toast.info("🗑️ Request withdrawn. Clean slate!");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("⛔ Session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error("Could not cancel request. Try again?");
      }
    } finally {
      setLoadingIds((prev) => prev.filter((val) => val !== id));
    }
  };

  
  const renderRequestList = (list, isReceived) => (
    <Row className="g-4 mb-5">
      <AnimatePresence mode="popLayout">
        {list.map((r) => {
          return (
            <Col key={r.id} xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="h-100 w-100"
              >
              <ProfileWithFetch
                appointment={r}
                viewerType={userType}
                loggedInUserId={loggedInUserId} 
                requestStatus={r.status}
                appointmentStatus={r.appointment_status}
                customMessage={
                  r.status === "pending"
                    ? isReceived
                      ? "📥 Awaiting your response"
                      : "📤 Request pending"
                    : r.status === "accepted"
                    ? "✅ Accepted"
                    : "❌ Expired or Cancelled"
                }
                actionButtons={
                  isReceived ? (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleAccept(r.id)}
                        disabled={loadingIds.includes(r.id)}
                      >
                        Accept
                      </Button>{" "}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleCancel(r.id)}
                        disabled={loadingIds.includes(r.id)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleCancel(r.id)}
                      disabled={loadingIds.includes(r.id)}
                    >
                      Cancel
                    </Button>
                  )
                }
              />
              </motion.div>
            </Col>
        
      );
        })}
      </AnimatePresence>
    </Row>
  );

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
        <div className="container-fluid">
          <h2 className="mb-3 fw-bold mt-3 text-center"> 📨 Appointment Requests</h2>

          {loading ? (
            <Spinner animation="border" />
          ) : received.length === 0 && sent.length === 0 ? (
            <div className="text-muted mt-3 ms-2">
              No appointment requests found. ✨ Try exploring profiles and making your first connection!
            </div>
          ) : (
            <>
              {/* 📥 Received Requests Section */}
              <div className="mb-4">
                <div
                  className="nav nav-tabs mb-2"
                  role="tablist"
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setOpenSections((prev) => ({ ...prev, received: !prev.received }))}
                >
                  <div className="nav-item nav-link active">
                    📥 Received Requests ({received.length}) {openSections.received ? "▲" : "▼"}
                  </div>
                </div>

                {openSections.received &&
                  (received.length === 0 ? (
                    <div className="text-muted mb-4">
                      You don’t have any new appointment requests. 📭
                    </div>
                  ) : (
                    renderRequestList(received, true)
                  ))}
              </div>

              <hr className="my-4" />

              {/* 📤 Sent Requests Section */}
              <div>
                <div
                  className="nav nav-tabs mb-2"
                  role="tablist"
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => setOpenSections((prev) => ({ ...prev, sent: !prev.sent }))}
                >
                  <div className="nav-item nav-link active">
                    📤 Sent Requests ({sent.length}) {openSections.sent ? "▲" : "▼"}
                  </div>
                </div>

                {openSections.sent &&
                  (sent.length === 0 ? (
                    <div className="text-muted">
                      You haven’t sent any requests yet. 🧑‍🌾 Go to <strong>Search</strong> and connect!
                    </div>
                  ) : (
                    renderRequestList(sent, false)
                  ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default RequestsPage;
