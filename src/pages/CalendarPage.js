import React, { useEffect, useState } from "react";
import {
  Container, Row, Col, Button, Modal, Form, Badge, Card, Spinner
} from "react-bootstrap";
import axios from "../axios";
import MainNavbar from "../components/MainNavbar";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
import isToday from "dayjs/plugin/isToday";
import "../App.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const formatTime = (input) => {
  if (!input || typeof input !== "string") return "No time set";

  const cleanInput = input.includes(".") ? input.split(".")[0] : input;

  const parsed = dayjs(cleanInput, [
    "HH:mm:ss.SSSSSS",
    "HH:mm:ss",
    "HH:mm",
    "H:mm",
  ]);
  return parsed.isValid() ? parsed.format("h:mm A") : "Invalid time";
};


dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(isToday);

const CalendarPage = () => {
  const token = localStorage.getItem("accessToken");
  const [events, setEvents] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(dayjs().startOf("month"));
  const [firstLoginMonth, setFirstLoginMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState({ title: "", time: "" });

  useEffect(() => {
    axios.get("users/user/profile/update/", {
      headers: { Authorization: `Token ${token}` },
    }).then((res) => {
      const joined = dayjs(res.data.date_joined || res.data.user?.date_joined);
      const startMonth = joined.startOf("month");
      setFirstLoginMonth(startMonth);
      setCalendarMonth(startMonth);
      setSelectedDate(dayjs());
    });
  }, []);

  useEffect(() => {
    if (firstLoginMonth) {
      axios.get("calender/", {
        headers: { Authorization: `Token ${token}` },
      }).then((res) => setEvents(res.data));
    }
  }, [calendarMonth, firstLoginMonth]);

const getEventsForDateGrouped = (date) => {
  const filtered = events
    .filter((ev) => dayjs(ev.date).isSame(date, "day"))
    .filter((ev) => ev.time) // Ignore null or missing time
    .sort((a, b) => {
      const timeA = dayjs(a.time, ["HH:mm:ss.SSSSSS", "HH:mm:ss", "HH:mm"]);
      const timeB = dayjs(b.time, ["HH:mm:ss.SSSSSS", "HH:mm:ss", "HH:mm"]);
      return timeA.isBefore(timeB) ? -1 : 1;
    });

  const morning = [];
  const afternoon = [];
  const evening = [];

  filtered.forEach((ev) => {
    const time = dayjs(ev.time, ["HH:mm:ss.SSSSSS", "HH:mm:ss", "HH:mm"]);
    const hour = time.hour();

    if (hour >= 5 && hour < 12) morning.push(ev);
    else if (hour >= 12 && hour < 17) afternoon.push(ev);
    else if (hour >= 17 && hour <= 23) evening.push(ev);
  });

  return { morning, afternoon, evening };
};

  if (!firstLoginMonth) {
    return (
      <>
        <MainNavbar />
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((p) => !p)} />
        <Container className="d-flex justify-content-center align-items-center"
          style={{ height: "80vh", marginLeft: sidebarOpen ? "240px" : "60px" }}
        >
          <Spinner animation="border" variant="primary" />
        </Container>
      </>
    );
  }

  const daysInGrid = [];
  const start = calendarMonth.startOf("month").startOf("week");
  const end = calendarMonth.endOf("month").endOf("week");
  let currentDay = start;

  while (currentDay.isBefore(end)) {
    daysInGrid.push(currentDay);
    currentDay = currentDay.add(1, "day");
  }

  const handlePrevMonth = () => {
    const prev = calendarMonth.subtract(1, "month");
    if (prev.isBefore(firstLoginMonth)) return;
    setCalendarMonth(prev);
    setSelectedDate(prev.startOf("month"));
  };

  const handleNextMonth = () => {
    const next = calendarMonth.add(1, "month");
    if (next.isAfter(firstLoginMonth.add(2, "month"))) return;
    setCalendarMonth(next);
    setSelectedDate(next.startOf("month"));
  };

const createEvent = async () => {
  try {
    if (!editingEvent.title) {
      toast.error("Please enter a title.");
      return;
    }

    if (!editingEvent.time || editingEvent.time.length < 4) {
      toast.error("Please select a valid time.");
      return;
    }

    await axios.post("calender/", {
      title: editingEvent.title,
      date: selectedDate.format("YYYY-MM-DD"),
      time: editingEvent.time,
    }, {
      headers: { Authorization: `Token ${token}` }
    });

    toast.success("Event created successfully!");
    setShowCreateModal(false);

    const res = await axios.get("calender/", {
      headers: { Authorization: `Token ${token}` },
    });
    setEvents(res.data);
  } catch (error) {
    console.error("Create failed:", error);
    toast.error("Error creating event. Please try again.");
  }
};



const updateEvent = async () => {
  try {
    await axios.patch(`calender/${editingEvent.id}/`, {
      title: editingEvent.title,
      time: editingEvent.time,
    }, {
      headers: { Authorization: `Token ${token}` }
    });

    toast.success("Event updated successfully!");
    setShowEditModal(false);
    setEditingEvent({ title: "", time: "" });

    const res = await axios.get("calender/", {
      headers: { Authorization: `Token ${token}` },
    });
    setEvents(res.data);
  } catch (error) {
    console.error("Failed to update event:", error);
    toast.error("Error updating event.");
  }
};


const deleteEvent = async (id) => {
  const eventToDelete = events.find((ev) => ev.id === id);
  if (!eventToDelete) {
    toast.error("Event not found.");
    return;
  }

  if (!window.confirm(`Delete event "${eventToDelete.title}"?`)) return;

  try {
    await axios.delete(`calender/${id}/`, {
      headers: { Authorization: `Token ${token}` }
    });

    toast.info(`Deleted: "${eventToDelete.title}"`);
    const res = await axios.get("calender/", {
      headers: { Authorization: `Token ${token}` },
    });
    setEvents(res.data);
  } catch (error) {
    console.error("Failed to delete event:", error);
    toast.error(`Error deleting "${eventToDelete.title}"`);
  }
};



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
            <div className="container-fluid"
            style={{
              maxWidth: "100%",
              overflowX: "auto",
              margin: "0 auto",
            }}>

              <h2 className="mb-3 fw-bold mt-3 text-center"> 🗓️ Calendar </h2>
                <motion.div
                    key={calendarMonth.format("YYYY-MM")}
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    >
                    <div className="d-flex justify-content-between align-items-center mb-3" style={{ maxWidth: "900px", margin: "0 auto" }}>
                        {calendarMonth.isAfter(firstLoginMonth) && (
                        <Button variant="outline-secondary" onClick={handlePrevMonth} className="d-flex align-items-center gap-1">
                           <i className="bi bi-chevron-left"></i> 
                           <span><strong>Prev </strong></span>
                        </Button>
                        )}
                        <h2 className="fw-bold text-center mb-0" style={{ fontSize: "2rem", color: "#0ea5e9" ,minWidth: "200px",margin: "0 12px",}}>  
                            {/* dark mode : color: "#38bdf8" */}
                            {calendarMonth.format("MMMM YYYY")}
                        </h2>

                        {calendarMonth.isBefore(firstLoginMonth.add(2, "month")) && (
                        <Button variant="outline-secondary" onClick={handleNextMonth} className="d-flex align-items-center gap-1">
                            <span><strong>Next</strong> </span> <i className="bi bi-chevron-right"></i>
                        </Button>
                        )}
                    </div>

                   <div className="d-flex justify-content-center">
                      <div
                        className="calendar-wrapper"
                        style={{
                           border: "3px solid #3b82f6",
                          borderTop: "8px solid #3b82f6",         // bold top border like emoji header
                          borderBottom: "2px solid #d1d5db",       // soft bottom frame
                          borderRadius: "12px 12px 6px 6px",
                          padding: "16px",
                          backgroundColor: "#fff",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
                           width: "65%",
                            maxWidth: "900px",
                            minWidth: "320px",
                           
                           }}
                      >
                      <div className="weekday-row">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                          <div key={d} className="weekday-box">
                            <span className="d-none d-sm-inline weekday-name">{d}</span>
                            <span className="d-inline d-sm-none">{d.slice(0, 1)}</span> {/* e.g. S, M, T */}
                           </div>
                        ))}
                      </div>                           
                        {/* dark mode : color: "#94a3b8" */}

                    {Array.from({ length: daysInGrid.length / 7 }).map((_, weekIndex) => (
                        <Row key={weekIndex}>
                            {daysInGrid.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, idx) => {
                            const isToday = day.isToday();
                            const isCurrentMonth = day.month() === calendarMonth.month();
                            const groupedDayEvents = getEventsForDateGrouped(day);
                            const dayEvents = [
                              ...groupedDayEvents.morning,
                              ...groupedDayEvents.afternoon,
                              ...groupedDayEvents.evening,
                            ];

                            return (
                                <Col
                                key={idx}
                                className="border text-center p-1"
                                style={{
                                    minHeight: "80px", 
                                    // maxWidth: "110px",           // Shrunk height
                                    cursor: "pointer",
                                    flex: "1 1 0",
                                    minWidth:"35px",
                                    backgroundColor: isCurrentMonth ? "#ffffff" : "#f3f4f6",
                                    color: isCurrentMonth ? "#111827" : "#6b7280",
                                    border: isToday ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                                    borderRadius: "6px",
                                    transition: "background-color 0.3s ease",
                                    overflowY: "auto",
                                }}

                                // for dark mode:
                                // backgroundColor: isCurrentMonth ? "#1f2937" : "#111827",
                                // color: isCurrentMonth ? "#f9fafb" : "#6b7280",
                                // border: isToday ? "2px solid #60a5fa" : "1px solid #374151",

                                onClick={() => {
                                    if (!isCurrentMonth) setCalendarMonth(day.startOf("month"));
                                    setSelectedDate(day);
                                }}
                                >
                                <div
                                    style={{
                                    borderRadius: "50%",
                                    backgroundColor: isToday ? "#3b82f6" : "",
                                    color: isToday ? "#3b82f6" : isCurrentMonth ? "#111827" : "#6b7280",
                                    width: "32px",
                                    fontWeight: isToday ? "bold" : "500",
                                    fontSize: "1.2rem",
                                    height: "32px",
                                    margin: "0 auto 6px",
                                    marginBottom:"6px",
                                    lineHeight: "1.6rem",
                                    fontWeight: isToday ? "bold" : "normal",
                                    }}
                                >
                                    {day.date()}
                                </div>

                                {/* 🟠 Horizontal lines for number of events */}
                                <div className="d-flex flex-column align-items-center">
                                    {dayEvents.map((ev, i) => (
                                        <div
                                        key={i}
                                        style={{
                                            width: "60%",
                                            height: "5px",
                                            backgroundColor: ev.event_type === "manual" ? "#f59e0b" : "#10b981",
                                            marginBottom: "4px",
                                            borderRadius: "3px",
                                        }}
                                        ></div>
                                    ))}
                                </div>
                                </Col>
                            );
                            })}
                        </Row>
                        ))}
                    </div>
                  </div>

                    <hr />

                    {selectedDate.isSame(dayjs(), "day") && (
                      <h3 className="fw-bold text-center mb-3" style={{ fontSize: "1.4rem",color: "#3b82f6",}}>
                        Today
                      </h3>
                    )}

                    <h4 className="fw-bold text-center mb-3" style={{ fontSize: "1.5rem", color: "#0f172a" }}>
                      {selectedDate.format("dddd")}, {selectedDate.format("MMM D, YYYY")}
                    </h4>

                        {/* dark mode: color: "#f9fafb" */}

                    <hr />

                  {Object.values(getEventsForDateGrouped(selectedDate)).flat().length === 0 ? (
                    <p className="text-muted text-center">No events scheduled.</p>
                  ) : (
                    <>
                      {["morning", "afternoon", "evening"].map((section) => {
                        const grouped = getEventsForDateGrouped(selectedDate);
                        return grouped[section].length > 0 && (
                          <div key={section}>
                            <h5 className="fw-bold mt-4 mb-3">
                              {section === "morning" && "☀️ Morning"}
                              {section === "afternoon" && "🌤️ Afternoon"}
                              {section === "evening" && "🌙 Evening"}
                            </h5>

                            <Row xs={1} md={2}>
                              {grouped[section].map((ev) => (
                                <Col key={ev.id} className="d-flex">
                                  <Card
                                    className="mb-3 w-100"
                                    style={{
                                      minHeight: "140px",
                                      borderLeft: `6px solid ${ev.event_type === "manual" ? "#f59e0b" : "#10b981"}`,
                                    }}
                                  >
                                    <Card.Body>
                                      <Card.Title>{ev.title}</Card.Title>
                                      <Card.Subtitle className="mb-2 text-muted">
                                        {ev.date} at {formatTime(ev.time)}
                                      </Card.Subtitle>
                                      <Badge
                                        bg={ev.event_type === "manual" ? "warning" : "success"}
                                        className="text-dark text-uppercase"
                                      >
                                        {ev.event_type}
                                      </Badge>
                                      {ev.event_type === "manual" && (
                                        <div className="mt-3 d-flex gap-2">
                                          <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => {
                                              setEditingEvent(ev);
                                              setShowEditModal(true);
                                            }}
                                          >
                                            <i className="bi bi-pencil-square"></i> Edit
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => deleteEvent(ev.id)}
                                          >
                                            <i className="bi bi-trash"></i> Delete
                                          </Button>
                                        </div>
                                      )}
                                    </Card.Body>
                                  </Card>
                                </Col>
                              ))}
                            </Row>
                          </div>
                        );
                      })}
                    </>
                  )}


                    <div className="text-center mt-4">
                        <Button
                        variant="outline-primary"
                        onClick={() => {
                            setEditingEvent({ title: "", time: "" });
                            setShowCreateModal(true);
                        }}
                        >
                        <i className="bi bi-calendar-plus"></i> Create Manual Event
                        </Button>
                    </div>

                    {/* Create Event Modal */}
                    <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                        <Modal.Header closeButton>
                        <Modal.Title>Add Event for {selectedDate.format("MMM D")}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                placeholder="Enter title"
                                value={editingEvent.title}
                                onChange={(e) =>
                                setEditingEvent({ ...editingEvent, title: e.target.value })
                                }
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Time</Form.Label>
                            <Form.Control
                                type="time"
                                value={editingEvent.time || ""}
                                onChange={(e) =>
                                setEditingEvent({ ...editingEvent, time: e.target.value })
                                }
                            />

                            {editingEvent.time?.length >= 4 && (
                                <div className="text-muted mt-2">
                                Selected time: {formatTime(editingEvent.time)}
                                </div>
                            )}
                        </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={createEvent}>
                            Save Event
                        </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Edit Event Modal */}
                    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                        <Modal.Header closeButton>
                        <Modal.Title>Edit Event</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                            value={editingEvent.title}
                            onChange={(e) =>
                                setEditingEvent({ ...editingEvent, title: e.target.value })
                            }
                            />      
                            
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Time</Form.Label>
                            <Form.Control
                            type="time"
                            value= {editingEvent.time || ""}
                            onChange={(e) =>
                                setEditingEvent({ ...editingEvent, time: e.target.value })
                            }
                            /> 
                            {editingEvent.time?.length >= 4 && (
                                <div className="text-muted mt-2">
                                    Current time: {formatTime(editingEvent.time)}
                                </div>
                            )}
                        </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={updateEvent}>
                            Update Event
                        </Button>
                        </Modal.Footer>
                    </Modal>
                    </motion.div>
            </div>
        </div>
    </>   
  );
};

export default CalendarPage;
