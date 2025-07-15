import React, { useEffect, useState } from "react";
import axios from "../axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Button,
  Badge,
} from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import MainNavbar from "../components/MainNavbar";
import ProfileWithFetch from "../components/ProfileWithFetch";
import SearchBarWithFilters from "../components/SearchBarWithFilters";
import "../App.css";

const SearchPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userType = localStorage.getItem("userType");
  const loggedInUserId = parseInt(localStorage.getItem("userId"));
  const isKrisshak = userType === "krisshak";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);
  const [previouslyAppointed, setPreviouslyAppointed] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userType) navigate("/login");
  }, [navigate, userType]);

  const fetchSuggestions = async () => {
    try {
      const endpoint = isKrisshak
        ? "search/search-bhooswamis/"
        : "search/search-krisshaks/";

      const { data } = await axios.get(endpoint, {
        withCredentials: true,
      });

      setSuggestedProfiles(data.ml_suggestions || []);
      setPreviouslyAppointed(
        data.previous_bhooswamis || data.previous_krisshaks || []
      );
      setAllProfiles(data.final_suggestions || []);
      setFiltersApplied(false);
    } catch (err) {
      setError("Could not fetch suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleRequest = async (targetUserId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(
        `/appointments/request/${targetUserId}/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success("✅ Appointment request sent!");
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Something went wrong while sending the request."
      );
    }
  };

  const handleAppoint = async (targetUserId) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(
        `/appointments/request/${targetUserId}/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      toast.success("✅ Appointment request sent!");
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Something went wrong while sending the request."
      );
    }
  };

  const handleFilterResult = (filtered) => {
    setFiltersApplied(true);
    setAllProfiles(filtered);
  };

  const renderSection = (title, list, isFiltered = false) => {
    const sectionLabel = isKrisshak ? "Bhooswamis" : "Krisshaks";
    const sectionTitle =
      isFiltered && filtersApplied
        ? `Filtered ${sectionLabel}`
        : title;

    return (
      <>
        <h5 className="mt-4 mb-3">
          {sectionTitle}{" "}
          <span
            className="text-muted"
            style={{ fontWeight: "normal", fontSize: "0.95rem" }}
          >
            (Found Profiles: {list.length})
          </span>
        </h5>

        {list.length > 0 ? (
          <Row className="g-4">
            {list.map((profile) => {
              const uid = profile.user?.id || profile.user_id || profile.id;

              const isRequestOnCooldown =
                profile.recent_request_status === "pending" &&
                Date.now() -
                  new Date(profile.recent_request_time).getTime() <
                  2 * 24 * 60 * 60 * 1000;

              const hasActiveAppointment =
                profile.appointment_status === "confirmed" &&
                Date.now() -
                  new Date(profile.appointment_created_at).getTime() <
                  30 * 24 * 60 * 60 * 1000;

              const buttonLogic = isKrisshak ? (
                hasActiveAppointment ? (
                  <>
                    <Button
                      variant="secondary"
                      disabled
                      className="mt-2 w-100"
                    >
                      Appointment Active
                    </Button>
                  </>
                ) : isRequestOnCooldown ? (
                  <Button
                    variant="outline-secondary"
                    disabled
                    className="w-100"
                  >
                    Request Sent (wait 2 days)
                  </Button>
                ) : (
                  <Button
                    variant="outline-primary"
                    onClick={() => handleRequest(uid)}
                    className="w-100"
                  >
                    Request Appointment
                  </Button>
                )
              ) : hasActiveAppointment ? (
                <>
                  <Badge bg="success">🟢 Active</Badge>
                  <Button
                    variant="secondary"
                    disabled
                    className="mt-2 w-100"
                  >
                    Appointment Active
                  </Button>
                </>
              ) : isRequestOnCooldown ? (
                <Button
                  variant="outline-secondary"
                  disabled
                  className="w-100"
                >
                  Request Sent (wait 2 days)
                </Button>
              ) : (
                <Button
                  variant={
                    profile.availability ? "primary" : "secondary"
                  }
                  onClick={() => handleAppoint(uid)}
                  disabled={!profile.availability}
                  className="w-100"
                >
                  {profile.availability ? "Appoint" : "Not Available"}
                </Button>
              );

              return (
                <Col key={`${uid}-${title}`} xs={12} sm={6} md={4} lg={3} className="d-flex">
                  <ProfileWithFetch
                    viewerType={userType}
                    userId={uid}
                    loggedInUserId={loggedInUserId}
                    appointmentStatus={profile.appointment_status}
                    requestStatus={profile.recent_request_status}
                    customMessage={
                      hasActiveAppointment
                        ? "🟢 Active Appointment"
                        : isRequestOnCooldown
                        ? "⏳ Request Cooldown"
                        : null
                    }
                    actionButtons={buttonLogic}
                  />
                </Col>
              );
            })}
          </Row>
        ) : (
          <p className="text-muted ms-2">
            {isFiltered && filtersApplied
              ? `0 ${sectionLabel.toLowerCase()} match your filters.`
              : `No ${title.toLowerCase()} found.`}
          </p>
        )}
      </>
    );
  };

  return (
    <>
      <MainNavbar />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((prev) => !prev)}/>

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
          <h2 className="mb-3 fw-bold mt-3 text-center"> 🔍 Search </h2>

          <SearchBarWithFilters
            userType={userType}
            onFilter={handleFilterResult}
          />

          {loading ? (
            <div className="text-center mt-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading suggestions...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <>
              {filtersApplied &&
                renderSection(
                  isKrisshak
                    ? "Filtered Bhooswamis"
                    : "Filtered Krisshaks",
                  allProfiles,
                  true
                )}

              {renderSection(
                isKrisshak
                  ? "Suggested Bhooswamis (ML)"
                  : "Suggested Krisshaks (ML)",
                suggestedProfiles
              )}

              {renderSection(
                isKrisshak
                  ? "Previously Appointed Bhooswamis"
                  : "Previously Appointed Krisshaks",
                previouslyAppointed
              )}

              {renderSection(
                isKrisshak
                  ? "All Bhooswamis in District"
                  : "All Krisshaks in District",
                allProfiles
              )}
            </>
          )}
        </div>
      </div>

    </>
  );
};

export default SearchPage;
