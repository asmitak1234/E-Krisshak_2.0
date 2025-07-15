import React, { useEffect, useState } from "react";
import axios from "../axios";
import Sidebar from "../components/Sidebar";
import MainNavbar from "../components/MainNavbar";
import { Container, Row, Col, Spinner, Button } from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import ProfileWithFetch from "../components/ProfileWithFetch";
import "../App.css";
import { useNavigate } from "react-router-dom";

const AppointmentsPage = ({ userType }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState({
    pending: false,
    confirmed: false,
  });

  const navigate = useNavigate();
  const loggedInUserId = parseInt(localStorage.getItem("userId"));
  const viewerType = localStorage.getItem("userType");
  const isBhooswami = viewerType === "bhooswami";

  useEffect(() => {
    const cached = localStorage.getItem("latestAppointmentSnapshot");
    if (cached) {
      setAppointments(JSON.parse(cached));
      localStorage.removeItem("latestAppointmentSnapshot");
    }

    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const { data } = await axios.get("/appointments/", {
          headers: { Authorization: `Token ${token}` },
        });
        setAppointments(data);
      } catch (err) {
        console.error("Failed to load appointments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handlePayment = (appointmentId) => {
    navigate(`/payments?appointment=${appointmentId}`);
  };

  const isPending = (a) => a.status === "pending";
  const isConfirmed = (a) => a.status === "confirmed";

  const renderSection = (title, listKey, list) => (
    <>
      <div
        className="nav nav-tabs mb-2"
        role="tablist"
        style={{ cursor: "pointer", userSelect: "none" }}
        onClick={() =>
          setOpenSections((prev) => ({
            ...prev,
            [listKey]: !prev[listKey],
          }))
        }
      >
        <div className="nav-item nav-link active">
          {title} {openSections[listKey] ? "▲" : "▼"}
        </div>
      </div>

      {openSections[listKey] &&
        (list.length === 0 ? (
          <div className="text-muted mt-2 ms-2">
            {listKey === "pending"
              ? "No pending appointments yet. 📭 Explore some profiles to get started!"
              : "No confirmed appointments yet. ✅ Once confirmed, they’ll show up here!"}
          </div>
        ) : (
          <Row className="g-4 mb-5">
            <AnimatePresence mode="popLayout">
              {list.map((apt) => {
                const showPaymentPrompt = apt.payment_status === "not_paid";
                const customMessage = showPaymentPrompt
                  ? "💰 Payment Pending"
                  : "🟢 Active Appointment";

                return (
                  <Col key={apt.id} xs={12} sm={6} md={4} className="d-flex justify-content-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-100 h-100"
                    >
                      <ProfileWithFetch
                        appointment={apt}
                        viewerType={userType}
                        loggedInUserId={loggedInUserId}
                        appointmentStatus={apt.status}
                        overrideTarget={{
                          userId:
                            apt.krisshak_user_id === loggedInUserId
                              ? apt.bhooswami_user_id
                              : apt.krisshak_user_id,
                          userType:
                            apt.krisshak_user_id === loggedInUserId
                              ? "bhooswami"
                              : "krisshak",
                        }}
                        customMessage={customMessage}
                        actionButtons={
                          isBhooswami
                            ? (() => {
                                const createdAt = new Date(apt.date || apt.created_at);
                                const updatedAt = new Date(apt.updated_at || apt.created_at);
                                const now = new Date();
                                const daysSinceCreated = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
                                const daysSincePaid = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
                                const isPaid = apt.payment_status === "paid";

                                if (isPaid && daysSincePaid < 1) {
                                  return <Button variant="secondary" className="w-100" disabled>✅ Paid</Button>;
                                }

                                if (!isPaid && daysSinceCreated < 30) {
                                  const remaining = 30 - daysSinceCreated;
                                  const progressPercent = Math.min((daysSinceCreated / 30) * 100, 100);

                                  return (
                                    <>
                                      <Button variant="warning" disabled className="w-100">⏳ Make Payment</Button>
                                      <div className="mt-1">
                                        <div
                                          style={{
                                            height: "6px",
                                            borderRadius: "3px",
                                            backgroundColor: "#e9ecef",
                                            overflow: "hidden",
                                          }}
                                        >
                                          <div
                                            style={{
                                              width: `${progressPercent}%`,
                                              height: "100%",
                                              backgroundColor: "#ffc107",
                                              transition: "width 0.5s ease",
                                            }}
                                          />
                                        </div>
                                        <small className="text-muted d-block text-center mt-1">
                                          {daysSinceCreated} / 30 days completed · {remaining} days left
                                        </small>
                                      </div>
                                    </>
                                  );
                                }

                                if (!isPaid && daysSinceCreated >= 30) {
                                  return (
                                    <Button
                                      variant="success"
                                      className="w-100"
                                      onClick={() => handlePayment(apt.id)}
                                    >
                                      💳 Pay Now
                                    </Button>
                                  );
                                }

                                return null;
                              })()
                            : null
                        }
                      />
                    </motion.div>
                  </Col>
                );
              })}
            </AnimatePresence>
          </Row>
        ))}
    </>
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
          <h2 className="mb-3 fw-bold mt-3 text-center"> 📅 Appointments</h2>

          {loading ? (
            <Spinner animation="border" />
          ) : appointments.length === 0 ? (
            <p className="text-muted mt-3 ms-2">
              No appointments found. 📭 Head over to <strong>Search</strong> and connect with someone!
            </p>
          ) : (
            <>
              {renderSection("📮 Pending Appointments", "pending", appointments.filter(isPending))}
              <hr className="my-4" />
              {renderSection("📌 Confirmed Appointments", "confirmed", appointments.filter(isConfirmed))}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AppointmentsPage;
