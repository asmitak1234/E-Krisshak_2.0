import React, { useEffect, useState, useRef } from "react";
import axios from "../axios";
import "../App.css";
import { toast } from "react-toastify";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import MainNavbar from "../components/MainNavbar";
import Sidebar from "../components/Sidebar";

const MyProfilePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const [roleData, setRoleData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpPhase, setOtpPhase] = useState(false); // Determines form step
  const [submitting, setSubmitting] = useState(false);

  const userType = localStorage.getItem("userType");

  const fileInputRef = useRef(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.warn("⚠️ No file chosen");
      return;
    }

    const formData = new FormData();

    formData.append("profile_picture", file);

    const token = localStorage.getItem("accessToken");
    try {
        await axios.patch("users/user/profile/update/", formData, {
        headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data"
        }
        });
      const updatedRes = await axios.get("users/user/profile/update/", {
      headers: { Authorization: `Token ${token}` },
    });

    setUserData(updatedRes.data); // ⬅️ This updates the image URL
    setUploadSuccess(true);
    toast.success("Picture updated!");

  } catch (err) {
    toast.error("Upload failed.");
  }
};

  // 🎖️ Earned Badges
  const earnedBadges = [];
  if (userData.profile_picture) earnedBadges.push("📸 Picture Perfect");
  if (userType === "krisshak" && roleData.specialization && roleData.experience && roleData.price)
    earnedBadges.push("🧠 Expert Krisshak");
  if (userType === "bhooswami" && roleData.land_area && roleData.land_location)
    earnedBadges.push("📍 Grounded Bhooswami");
  
  const checklistItems = [
    { label: "Add a profile picture", done: !!userData.profile_picture },
    { label: "Set your age", done: !!userData.age },
    { label: "Provide phone number", done: !!userData.phone_number },
    { label: userType === "krisshak" ? "Set specialization, experience, price" : "Provide land details", done:
        userType === "krisshak"
        ? !!roleData.specialization && !!roleData.experience && !!roleData.price
        : !!roleData.land_area && !!roleData.land_location
    }
  ];


  // 📊 Completion Tracker
  const calculateCompletion = () => {
    const fields = [
      userData.name,
      userData.age,
      userData.phone_number,
      userData.gender,
      userData.profile_picture,
      userType === "krisshak" ? roleData.specialization : roleData.land_location,
      userType === "krisshak" ? roleData.experience : roleData.land_area,
      userType === "krisshak" ? roleData.price : roleData.requirements,
      userType === "krisshak" ? (roleData.account_number || roleData.upi_id) : null
    ];
    const filledCount = fields.filter(Boolean).length;
    return Math.round((filledCount / fields.length) * 100);
  };

  const completionPercent = calculateCompletion();

  // 🔄 Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const userRes = await axios.get("users/user/profile/update/", {
          headers: { Authorization: `Token ${token}` },
        });

        const roleRes = await axios.get(
          userType === "krisshak"
            ? "users/krisshak/profile/"
            : "users/bhooswami/profile/",
          { headers: { Authorization: `Token ${token}` } }
        );

        setUserData(userRes.data);
        setRoleData(roleRes.data);

      } catch (err) {
        toast.error("Failed to load profile.")
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userType]);

  // 💾 Save profile updates
  const handleSave = async () => {
    if (parseInt(userData.age) < 18) {
      return toast.error("Age must be at least 18.");
    }

    try {
      const token = localStorage.getItem("accessToken");

      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("age", userData.age);
      formData.append("gender", userData.gender);
      formData.append("phone_number", userData.phone_number);

      // Only send profile picture if it's a new file
      if (userData.profile_picture instanceof File) {
        formData.append("profile_picture", userData.profile_picture);
      }

      await axios.patch("users/user/profile/update/", formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      await axios.patch(
        userType === "krisshak"
          ? "users/krisshak/profile/"
          : "users/bhooswami/profile/",
        roleData,
        { headers: { Authorization: `Token ${token}` } }
      );

      toast.success("Profile updated successfully!");
      setEditMode(false);

    } catch (err) {
      toast.error("Update failed. Check required fields.");
      console.error("🚨 Update error:", err?.response?.data);
    }
  };


  // 🔐 Password Reset Handler
  const handleResetPassword = async () => {
    if (!otpPhase) {
        setSubmitting(true);
        try {
        const token = localStorage.getItem("accessToken");
        await axios.post("users/forgot-password/", { email: userData.email }, {
            headers: { Authorization: `Token ${token}` }
        });
        setOtpPhase(true);
        toast.info("OTP sent to your email.");
        } catch {
            toast.error("Failed to send OTP.");
        }
        finally {
            setSubmitting(false);
        }
    } else {
        if (
        newPassword.length < 8 ||
        !/[A-Z]/.test(newPassword) ||
        !/[a-z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword)
        ) {
        return toast.error("Password must be 8+ chars with uppercase, lowercase, and digit.");
        }

    setSubmitting(true);
      try {
        const token = localStorage.getItem("accessToken");
        await axios.post("users/reset-password/", {
            otp:otp.toString(),
            new_password: newPassword
        }, {
            headers: { Authorization: `Token ${token}` }
        });

        toast.success("✅ Password reset successful!");

        setNewPassword("");
        setOtp("");
        setOtpPhase(false);
        } catch (err) {
            toast.error("OTP verification failed.");
            console.log(err.response?.data?.error);
        }finally {
      setSubmitting(false);
    }
    };
  };

  // 🧠 Universal change handler
  const handleChange = (target, key, value) => {
    target === "user"
      ? setUserData((prev) => ({ ...prev, [key]: value }))
      : setRoleData((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

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
        id="myprofilebadge"
      >

      <Container className="mb-5 container-fluid">

        <h2 className="mb-5 fw-bold mt-3 text-center"> 👤 My Profile </h2>

        <Row className="justify-content-center">
          <Col md={6}>
            <div className="mb-3">
                <ProgressBar
                    now={completionPercent}
                    animated
                    striped
                    variant="success"
                    label={`Profile : ${completionPercent}%`}
                    style={{ height: "24px", fontWeight: "bold" }}
                />
            </div>
            {completionPercent === 100 && (
                <div className="text-center mb-3">
                    <Badge bg="success" className="fs-5 px-3 py-2">
                    🎉 Fully Onboarded
                    </Badge>
                </div>
            )}<br/>

            {earnedBadges.length > 0 && (
              <div className="mb-3 text-center">
                <strong>Earned Badges:</strong>
                <div>
                  {earnedBadges.map((badge, idx) => (
                    <Badge key={idx} bg="success" className="me-2">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-3">
                <h5 className="mb-2 mt-4">✨ Profile Checklist :</h5>
                <ul className="ps-4">
                    {checklistItems.map((item, idx) => (
                    <li key={idx} className="mb-2 d-flex align-items-center">
                        <i className={`bi ${item.done ? "bi-check-circle-fill text-success" : "bi-circle"} me-2`}></i>
                        {item.label}
                    </li>
                    ))}
                </ul>
            </div>

            <div className="text-center mb-3 d-flex flex-column align-items-center">
              <img
                 src={userData.profile_picture}
                alt="Profile"
                onError={(e) => {
                  if (!e.target.src.includes("default_female.png")) {
                    e.target.onerror = null;
                    e.target.src = "/media/default_female.png";
                  }
                }}
                className="rounded-circle mb-2"
                style={{
                  objectFit: "cover",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",       
                  aspectRatio: "1",            
                  overflow: "hidden",
                  margin: "1rem auto",    
                  border: "2px solid #ced4da",      
                }}
              />

                <Button
                    variant="outline-secondary"
                    size="sm"
                    className="mt-2 mb-2 fw-bold"
                    onClick={() => fileInputRef.current.click()}
                    >
                    📷 Change Picture
                </Button>

                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  />

                {uploadSuccess && (
                    <small className="text-success ms-2 fw-bold">Picture updated!</small>
                )}


              <h4 className="mt-3 fw-bold">{userData.name || "Unnamed User"}</h4>
              <p className="text-muted fw-bold">
                {userData.gender?.charAt(0).toUpperCase() + userData.gender?.slice(1) || "—"} · Age:{" "}
                {userData.age ?? "—"}
              </p>

              <Button
                variant={editMode ? "danger" : "primary"}
                size="sm"
                onClick={() => setEditMode((prev) => !prev)}
              >
                <i className={`bi ${editMode ? "bi-x-circle" : "bi-pencil-square"} me-1`}></i>
                {editMode ? "Cancel Edit" : "Edit"}
              </Button>
            </div>

            <Form>
              <Form.Group className="mt-3 mb-3">
                <Form.Label className="fw-bold">Email (read-only)</Form.Label>
                <Form.Control type="email" value={userData.email || ""} readOnly />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">District (read-only)</Form.Label>
                <Form.Control
                  type="text"
                  value={userData.district_name || roleData.district_name || ""}
                  readOnly
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">State (read-only)</Form.Label>
                <Form.Control
                  type="text"
                  value={userData.state_name || roleData.state_name || ""}
                  readOnly
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">User Type</Form.Label>
                <div>
                  <Badge bg="dark" className="px-3 py-2 rounded-pill">
                    🎭 {userType?.charAt(0).toUpperCase() + userType?.slice(1)}
                  </Badge>
                </div>
              </Form.Group>

              <Form.Group>
                <Form.Label className="fw-bold" style={{ margin: "0.5rem" }}>Name</Form.Label>
                <Form.Control
                type="text"
                  value={userData.name || ""}
                  onChange={(e) => handleChange("user", "name", e.target.value)}
                  disabled={!editMode}
                  style={{
                    fontSize: "1rem",
                  }}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label className="fw-bold">Age</Form.Label>
                <Form.Control
                  type="number"
                  value={userData.age || ""}
                  onChange={(e) => handleChange("user", "age", e.target.value)}
                  disabled={!editMode}
                />
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Label className="fw-bold">Gender</Form.Label>
                <Form.Select
                    value={userData.gender || ""}
                    onChange={(e) => handleChange("user", "gender", e.target.value)}
                    disabled={!editMode}
                >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
   
              <Form.Group className="mt-3">
                <Form.Label className="fw-bold">Phone Number</Form.Label>
                <Form.Control
                  value={userData.phone_number || ""}
                  onChange={(e) => handleChange("user", "phone_number", e.target.value)}
                  disabled={!editMode}
                />
              </Form.Group>

              {userType === "krisshak" && (
                <>
                  <Form.Group className="mt-3">
                    <Form.Label className="fw-bold">Specialization</Form.Label>
                    <Form.Control
                      value={roleData.specialization || ""}
                      onChange={(e) => handleChange("role", "specialization", e.target.value)}
                      disabled={!editMode}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label className="fw-bold">Experience</Form.Label>
                    <Form.Control
                      value={roleData.experience || ""}
                      onChange={(e) => handleChange("role", "experience", e.target.value)}
                      disabled={!editMode}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label className="fw-bold">Price (₹/acre/month)</Form.Label>
                    <Form.Control
                      type="number"
                      value={roleData.price || ""}
                      onChange={(e) => handleChange("role", "price", e.target.value)}
                      disabled={!editMode}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label className="fw-bold">Bank Account Number</Form.Label>
                    <Form.Control
                        type="text"
                        value={roleData.account_number || ""}
                        onChange={(e) => handleChange("role", "account_number", e.target.value)}
                        disabled={!editMode}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label className="fw-bold">UPI ID</Form.Label>
                    <Form.Control
                        type="text"
                        value={roleData.upi_id || ""}
                        onChange={(e) => handleChange("role", "upi_id", e.target.value)}
                        disabled={!editMode}
                    />
                  </Form.Group>

                </>
              )}

              {userType === "bhooswami" && (
                <>
                  <Form.Group className="mt-3">
                    <Form.Label className="fw-bold">Land Area</Form.Label>
                    <Form.Control
                      type="number"
                      value={roleData.land_area || ""}
                      onChange={(e) => handleChange("role", "land_area", e.target.value)}
                      disabled={!editMode}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label className="fw-bold">Land Location</Form.Label>
                    <Form.Control
                      value={roleData.land_location || ""}
                      onChange={(e) => handleChange("role", "land_location", e.target.value)}
                      disabled={!editMode}
                    />
                  </Form.Group>

                  <Form.Group className="mt-3">
                    <Form.Label className="fw-bold">Requirements</Form.Label>
                    <Form.Control
                      as="textarea"
                      required
                      rows={3}
                      value={roleData.requirements || ""}
                      onChange={(e) => handleChange("role", "requirements", e.target.value)}
                      disabled={!editMode}
                    />
                  </Form.Group>
                </>
              )}

              {editMode && (
                <div className="mt-4 text-center">
                  <Button variant="success" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              )}
            </Form>

            <hr className="my-4" />

            <h5 className="mt-4">🔐 Reset Password</h5>
            { otpPhase && (
            <>
                <Form.Group className="mt-3">
                    <Form.Label className="fw-bold">OTP</Form.Label>
                    <Form.Control
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP from email"
                    />
                </Form.Group>

                <Form.Group className="mt-3">
                <Form.Label className="fw-bold">New Password</Form.Label>
                <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                />
                </Form.Group>
            </>
            )}
            
            <div className="mt-3 text-center">
              <Button variant={otpPhase ? "success" : "warning"} onClick={handleResetPassword} disabled={submitting}>
                {submitting
                    ? "Processing..."
                    : otpPhase
                    ? "Confirm & Reset"
                    : "Send OTP"
                }
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
</div>

    </>
  );
};

export default MyProfilePage;
