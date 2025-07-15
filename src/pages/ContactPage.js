import React, { useEffect, useState } from "react";
import axios from "../axios";
import Sidebar from "../components/Sidebar";
import MainNavbar from "../components/MainNavbar";
import { ToastContainer, toast } from "react-toastify";
import { Modal, Button, Form } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

const ContactPage = () => {
  const [userType, setUserType] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ name: "", subject: "", message: "", email: "" });
  const [replyText, setReplyText] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userData, setUserData] = useState({});
  const [viewMode, setViewMode] = useState("replies");
  const [viewModeAdmin, setViewModeAdmin] = useState("inbox");
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    axios.get("users/user/profile/update/", {
      headers: { Authorization: `Token ${accessToken}` },
    })
    .then((res) => {
      const user = res.data.user || res.data;
      const id = user.id || res.data.id;
      setUserType(user.user_type);
      setCurrentUserId(Number(id));
      setUserData(user);
    })
    .catch((err) => console.error("User type fetch failed:", err));
  }, [accessToken]);

  useEffect(() => {
    axios.get("contact/inbox/", {
      headers: { Authorization: `Token ${accessToken}` },
    })
    .then((res) => setContacts(res.data))
    .catch((err) => console.error("Failed to fetch contacts:", err));
  }, [accessToken]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      email: userData.email || "",
      name: formData.name || userData.name || "",
    };
    try {
      await axios.post("contact/send/", payload, {
        headers: { Authorization: `Token ${accessToken}` },
      });
      toast.success("✅ Message sent!");
      setFormData({ name: "", subject: "", message: "", email: "" });
      setShowModal(false);
    } catch (err) {
      toast.error("❌ Submission failed.");
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedId || !replyText) return;
    try {
      await axios.post(`contact/reply/${selectedId}/`, { message: replyText }, {
        headers: { Authorization: `Token ${accessToken}` },
      });
      toast.success("💬 Reply sent!");
      setReplyText("");
      setSelectedId(null);
      const updated = await axios.get("contact/inbox/", {
        headers: { Authorization: `Token ${accessToken}` },
      });
      setContacts(updated.data);
    } catch (err) {
      toast.error("❌ Reply failed.");
    }
  };

  const sentMessages = contacts.filter((m) => m.email === userData.email && !m.parent);
  const receivedReplies = contacts.filter((m) => m.parent !== null && m.sender !== currentUserId);
  const adminReplies = contacts.filter((m) => m.parent !== null && m.sender === currentUserId);

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
          <h2 className="fw-bold mt-3 mb-3 text-center">📬 Contact your District Admin </h2>
          <Button
            variant="success"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                name: userData.name || "",
              }));
              setShowModal(true);
            }}
            className="mb-4"
          >
            ✉️ Send Message
          </Button>

          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Send a Message</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    readOnly
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Control
                    as="textarea"
                    name="message"
                    placeholder="Message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Text className="text-muted">
                  📧 Your email: <strong>{userData.email || "—"}</strong>
                </Form.Text>
                <br />
                <Button type="submit" variant="primary" className="mt-2">
                  📤 Submit
                </Button>
              </Form>
            </Modal.Body>
          </Modal>

          {["krisshak", "bhooswami"].includes(userType) && (
            <>
              <div className="d-flex gap-2 mb-3">
                <Button
                  variant={viewMode === "replies" ? "primary" : "outline-primary"}
                  onClick={() => setViewMode("replies")}
                >
                  💬 Replies
                </Button>
                <Button
                  variant={viewMode === "sent" ? "primary" : "outline-primary"}
                  onClick={() => setViewMode("sent")}
                >
                  📤 Sent
                </Button>
              </div>

              {viewMode === "replies" ? (
                <>
                  <h5 className="fw-bold">💬 Replies Received</h5>
                  {receivedReplies.length === 0 ? (
                    <p className="text-muted">No replies received yet.</p>
                  ) : (
                    receivedReplies.map((r) => (
                      <div key={r.id} className="mb-3 p-3 border rounded">
                        <strong>RE: {r.subject?.replace(/^RE:\s*/, "")}</strong>
                        <p>{r.message}</p>
                        <small className="text-muted">{new Date(r.created_at).toLocaleString()}</small>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <>
                  <h5 className="fw-bold">📤 Sent Messages</h5>
                  {sentMessages.length === 0 ? (
                    <p className="text-muted">No messages sent yet.</p>
                  ) : (
                    sentMessages.map((msg) => (
                      <div key={msg.id} className="mb-3 p-3 border rounded">
                        <strong>{msg.subject}</strong>
                        <p>{msg.message}</p>
                        <small className="text-muted">{new Date(msg.created_at).toLocaleString()}</small>
                      </div>
                    ))
                  )}
                </>
              )}
            </>
          )}

          {["state_admin", "district_admin"].includes(userType) && (
            <>
              <div className="d-flex gap-2 mb-3">
                <Button
                  variant={viewModeAdmin === "inbox" ? "primary" : "outline-primary"}
                  onClick={() => setViewModeAdmin("inbox")}
                >
                  📥 Inbox
                </Button>
                <Button
                  variant={viewModeAdmin === "replied" ? "primary" : "outline-primary"}
                  onClick={() => setViewModeAdmin("replied")}
                >
                  💬 Replied
                </Button>
              </div>

              {viewModeAdmin === "inbox" ? (
                <>
                  <h5 className="fw-bold">📥 Inbox</h5>
                  {contacts.length === 0 ? (
                    <p className="text-muted">No messages found.</p>                  ) : (
                    contacts.map((msg) => (
                      <div key={msg.id} className="mb-3 p-3 border rounded">
                        <strong>{msg.name}</strong> ({msg.email})<br />
                        <em>{msg.subject}</em>
                        <p>{msg.message}</p>
                        <small className="text-muted">
                          {new Date(msg.created_at).toLocaleString()}
                        </small>

                        {msg.replies?.length > 0 && (
                          <div className="mt-2 border-top pt-2">
                            <strong>Replies:</strong>
                            <ul className="list-unstyled mt-2 ps-3">
                              {msg.replies.map((r) => (
                                <li key={r.id}>
                                  💬 {r.message}
                                  <br />
                                  <small className="text-muted">
                                    {new Date(r.created_at).toLocaleString()}
                                  </small>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="mt-2"
                          onClick={() => setSelectedId(msg.id)}
                        >
                          Reply
                        </Button>
                      </div>
                    ))
                  )}
                </>
              ) : (
                <>
                  <h5 className="fw-bold">💬 Replies You Sent</h5>
                  {adminReplies.length === 0 ? (
                    <p className="text-muted">No replies sent yet.</p>
                  ) : (
                    adminReplies.map((r) => (
                      <div key={r.id} className="mb-3 p-3 border rounded">
                        <strong>RE: {r.subject?.replace(/^RE:\s*/, "")}</strong>
                        <p>{r.message}</p>
                        <small className="text-muted">
                          Sent to: {r.parent?.name || "Unknown"} ({r.parent?.email || "—"})<br />
                          {new Date(r.created_at).toLocaleString()}
                        </small>
                      </div>
                    ))
                  )}
                </>
              )}

              {selectedId && (
                <div className="mt-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Type your reply"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <Button variant="primary" className="mt-2" onClick={handleReplySubmit}>
                    Send Reply
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactPage;
