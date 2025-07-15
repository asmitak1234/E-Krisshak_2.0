import React, { useEffect, useState } from "react";
import { Col, Spinner } from "react-bootstrap";
import { motion } from "framer-motion";
import axios from "../axios";
import ProfileCard from "./ProfileCard";
import "../App.css";

const ProfileWithFetch = ({
  appointment = null,
  userId = null,
  viewerType,
  onPayNow,
  appointmentStatus,
  requestStatus,
  actionButtons,
  loggedInUserId = null,
  customMessage,
  overrideTarget = null,
}) => {
  const [profile, setProfile] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const numericLoggedInUserId = Number(loggedInUserId);
  const currentUserType = localStorage.getItem("userType");
  const isBhooswami = currentUserType === "bhooswami";

  const getOppositeUserType = (type) =>
    type === "krisshak" ? "bhooswami" : "krisshak";

  let targetUserId = null;
  let targetUserType = null;

  if (overrideTarget) {
    targetUserId = overrideTarget.userId;
    targetUserType = overrideTarget.userType;
  } else if (appointment) {
    const isSender = appointment.sender_user_id === numericLoggedInUserId;
    targetUserId = isSender
      ? appointment.recipient_user_id
      : appointment.sender_user_id;
    targetUserType = isSender
      ? appointment.recipient_user_type
      : appointment.sender_user_type;
  } else if (userId && viewerType) {
    targetUserId = userId;
    targetUserType = getOppositeUserType(viewerType);
  }

 const profileEndpoint = targetUserId && targetUserType
    ? `users/${targetUserType}s/${targetUserId}/`
    : null;


  useEffect(() => {
    if (!targetUserId || !targetUserType) return;
    if (!profileEndpoint) {
      console.warn("⚠️ Missing profileEndpoint. Skipping fetch.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const { data } = await axios.get(profileEndpoint, {
          headers: { Authorization: `Token ${token}` },
        });

        setProfile({
          id: data.user?.id || data.id,
          name: data.user?.name || "Unnamed",
          email: data.user?.email,
          phone_number: data.user?.phone_number,
          profile_picture: data.user?.profile_picture,
          preferred_language: data.user?.preferred_language,
          gender: data.user?.gender,
          age: data.user?.age,
          ratings: data.ratings || 0,
          availability: data.availability,
          price: parseFloat(data.price) || 0,
          specialization: data.specialization,
          experience: data.experience,
          upi_id: data.upi_id,
        });

      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
        setFetchError(true);
      }
    };

    fetchProfile();
  }, [targetUserId, targetUserType]);

  if (fetchError) {
    return (
      <Col className="text-danger text-center mt-2">
        ⚠️ Failed to load profile.
      </Col>
    );
  }

  if (!profile) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-100">
        <Col className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
          <Spinner animation="border" size="sm" />
        </Col>
      </motion.div>
    );
  }

  return (
    <Col xs={12} sm={6} md={4} lg={3}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="w-100"
      >
        <ProfileCard
          profile={profile}
          userType={viewerType}
          appointmentStatus={appointmentStatus}
          requestStatus={requestStatus}
          actionButtons={typeof actionButtons !== "undefined" ? actionButtons : undefined}
          customMessage={customMessage}
          appointmentCreatedAt={appointment?.created_at || appointment?.date}
          onPayNow={isBhooswami ? (profile) => onPayNow?.(profile) : null}
          // onPayNow={onPayNow}       
       />

      </motion.div>
    </Col>
  );
};

export default ProfileWithFetch;
