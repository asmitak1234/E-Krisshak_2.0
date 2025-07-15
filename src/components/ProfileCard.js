import React, { useState } from "react";
import { Card, Button, Badge, Collapse } from "react-bootstrap";
import "../App.css";

const ProfileCard = ({
  profile,
  userType,
  onAppoint,
  onRequest,
  appointmentCreatedAt,
  onPayNow,
  actionButtons,
  requestStatus,
  appointmentStatus,
  customMessage,
}) => {
  const isViewingKrisshak = userType === "krisshak";
  const isAvailable = profile.availability;
  const resolvedId = profile.id || profile.user_id;
  const isConfirmed = appointmentStatus === "confirmed";
  const [showContact, setShowContact] = useState(false);

  const renderStatusBadge = () => {
    if (appointmentStatus === "confirmed") return <Badge bg="success">✅ Confirmed</Badge>;
    if (appointmentStatus === "pending") return <Badge bg="warning" text="dark">🟡 Pending</Badge>;
    if (requestStatus === "pending") return <Badge bg="info">📩 Request Sent</Badge>;
    if (typeof isAvailable === "boolean") {
      return (
        <Badge bg={isAvailable ? "success" : "secondary"}>
          {isAvailable ? "🟢 Available" : "🔴 Not Available"}
        </Badge>
      );
    }
    return null;
  };

  // Calculate days since appointment creation if available in profile object
  const createdAt = new Date(appointmentCreatedAt || Date.now());
  const now = new Date();
  const daysOld = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

  const showPayNowButton =
    appointmentStatus === "confirmed" &&
    daysOld >= 30 &&
    typeof onPayNow === "function";

  return (
    <Card className="shadow-sm h-100 w-100" style={{ maxWidth: "100%", minWidth: "260px", borderRadius: "10px" }}>
      <Card.Img
        variant="top"
        src={profile.profile_picture ? profile.profile_picture + "?v=" + new Date().getTime() : "/media/default_user.png"}
        alt="Profile"
        className="img-fluid"
        style={{
          width: "100px",
          height: "100px",
          objectFit: "cover",
          borderRadius: "50%",
          aspectRatio: "1",
          margin: "0.3rem auto",
          boxShadow: "0 0 6px rgba(0, 0, 0, 0.15)",
        }}
      />
      <Card.Body className="text-center px-3 py-1">
        <Card.Title>{profile.name || "Unnamed User"}</Card.Title>
        <Card.Subtitle className="mb-1 text-muted">
          {profile.gender?.charAt(0).toUpperCase() + profile.gender?.slice(1) || "—"} · Age: {profile.age ?? "—"}
        </Card.Subtitle>

        <div className="mb-0">{renderStatusBadge()}</div>
        {isConfirmed && <Badge bg="primary" className="mb-0">🔓 Full Profile Unlocked</Badge>}
        {typeof profile.ratings === "number" && profile.ratings > 0 && (
          <div className="mb-1">
            <Badge bg="success">⭐ {profile.ratings.toFixed(1)} Rating</Badge>
          </div>
        )}

        {!isViewingKrisshak && (
          <>
            {profile.specialization && (
              <div className="mb-1">
                <small className="text-muted">Specialization: {profile.specialization}</small>
              </div>
            )}
            {profile.price && (
              <div className="mb-1">
                <small className="text-muted">Price: ₹{profile.price} /acre /month</small>
              </div>
            )}
            {profile.experience && (
              <div className="mb-1">
                <small className="text-muted">Experience: {profile.experience} years</small>
              </div>
            )}
          </>
        )}

        {isViewingKrisshak && (
          <>
            {profile.land_area && (
              <div className="mb-1">
                <small className="text-muted">Land Area: {profile.land_area}</small>
              </div>
            )}
            {profile.land_location && (
              <div className="mb-1">
                <small className="text-muted">Location: {profile.land_location}</small>
              </div>
            )}
            {profile.requirements && (
              <div className="mb-1">
                <small className="text-muted">Requirements: {profile.requirements}</small>
              </div>
            )}
          </>
        )}

        {isConfirmed && (
          <>
            <Button
              variant="outline-secondary"
              size="sm"
              className="mt-1 mb-0"
              onClick={() => setShowContact((prev) => !prev)}
              aria-controls={`contact-${resolvedId}`}
              aria-expanded={showContact}
            >
              📞 {showContact ? "Hide" : "Show"} Contact Details
            </Button>

            <Collapse in={showContact}>
              <div id={`contact-${resolvedId}`}>
                <div className="border rounded p-2 bg-light mb-1">
                  {profile.email && (
                    <div className="mb-1">
                      <strong>Email:</strong>{" "}
                      <a href={`mailto:${profile.email}`} target="_blank" rel="noopener noreferrer">
                        📧 {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.phone_number && (
                    <div className="mb-1">
                      <strong>Phone:</strong>{" "}
                      <a href={`tel:${profile.phone_number}`} target="_blank" rel="noopener noreferrer">
                        📱 {profile.phone_number}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Collapse>
          </>
        )}

        {customMessage && <div className="text-muted mt-1 text-center fw-bold">{customMessage}</div>}

        <div className="d-grid gap-2 mt-1">
          {typeof actionButtons !== "undefined" ? (
            actionButtons
          ) : showPayNowButton ? (
            <Button variant="success" onClick={() => onPayNow(profile)}>
              💳 Pay Now
            </Button>
          ) : isViewingKrisshak ? (
            <Button
              variant="outline-primary"
              onClick={() => {
                if (window.confirm(`Are you sure you want to send an Appointment Request to ${profile.name}?`)) {
                  onRequest?.(resolvedId);
                }
              }}
            >
              Request Appointment
            </Button>
          ) : (
            <Button
              variant={isAvailable ? "primary" : "secondary"}
              onClick={() => {
                if (window.confirm(`Are you sure you want to Appoint ${profile.name}?`)) {
                  onAppoint?.(resolvedId);
                }
              }}
              disabled={!isAvailable}
            >
              {isAvailable ? "Appoint" : "Not Available"}
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProfileCard;
