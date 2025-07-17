import React, { useEffect, useState } from "react";
import MainNavbar from "../components/MainNavbar";
import Sidebar from "../components/Sidebar";
import axios from "../axios";
import ProfileWithFetch from "../components/ProfileWithFetch";
import {
  Button,
  Container,
  Row,
  Card,
  Spinner,
  Badge,
  Toast,
  ToastContainer,
  Modal,
} from "react-bootstrap";
import { toast } from "react-toastify";

const PaymentsPage = () => {
  const token = localStorage.getItem("accessToken");
  const isAuthenticated = !!token;
  const viewerType = localStorage.getItem("userType");
  const isBhooswami = viewerType === "bhooswami";
  const loggedInUserId = parseInt(localStorage.getItem("userId"));

  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [lastAddedPaymentId, setLastAddedPaymentId] = useState(null);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  useEffect(() => {
    const fetchAppointmentsAndPayments = async () => {
      try {
        const [appRes, payRes] = await Promise.all([
          axios.get("appointments/confirmed/", {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get("payments/my/", {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);

        const eligible = appRes.data
          .filter(
            (a) =>
              a.status === "confirmed" &&
              a.payment_status === "not_paid" &&
              new Date(a.date || a.created_at) < thirtyDaysAgo
          )
          .sort(
            (a, b) =>
              new Date(b.date || b.created_at) -
              new Date(a.date || a.created_at)
          );

         const withPrices = eligible.map((apt) => {
            const krisshak = apt.krisshak;
            const price = typeof krisshak === "object" ? parseFloat(krisshak.price) || 0 : 0;
            return { ...apt, price };
          });
        
        setAppointments(eligible);
        setPayments(payRes.data);

      } catch (err) {
        toast.error("❌ Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentsAndPayments();
  }, [token]);

  const handlePayNow = async (appointment, profile) => {
    console.log("🎯 profile passed to Razorpay:", profile);


    if (!isBhooswami) {
      toast.error("🚫 Payments can only be made by Bhooswami users.");
      return;
    }

    if (!profile?.id) {
      toast.error("⚠️ Recipient info missing. Cannot proceed.");
      return;
    }

    try {
      toast.info("🔄 Creating payment...");
      const payload = {
        recipient: profile.id,
        amount: profile.price,
        purpose: `Appointment ${appointment.id}`,
        type: "primary",
        is_custom_amount: false,
      };

      await axios.post("payments/create/", payload, {
        headers: { Authorization: `Token ${token}` },
      });

      const { data } = await axios.post(
        "payments/razorpay/order/",
        {
          recipient_id: profile.id,
          is_custom_amount: false,
          purpose: `Appointment ${appointment.id}`,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      const options = {
        key: data.key,
        amount: profile.price * 100 + 1100,
        currency: "INR",
        name: "E-Krisshak",
        description: "Service Payment",
        order_id: data.order_id,
        handler: async function () {
          toast.success("✅ Payment success!");

          try {
            await axios.patch(`appointments/mark-paid/${appointment.id}/`, null, {
              headers: { Authorization: `Token ${token}` },
            });

            setAppointments((prev) =>
              prev.map((a) => {
                const updated = a.id === appointment.id
                  ? { ...a, payment_status: "paid", updated_at: new Date().toISOString() }
                  : a;

                console.log("🔍 appointment", a.id, "krisshak type:", typeof a.krisshak, "price:", a.price);

                return updated;
              })
            );
            
            const newEntry = {
              id: `manual-${appointment.id}-${Date.now()}`,
              type: "payment",
              amount: profile.price,
              purpose: `Appointment ${appointment.id}`,
              status: "completed",
              created_at: new Date().toISOString(),
            };
            setPayments((prev) => [newEntry, ...prev]);
            setLastAddedPaymentId(newEntry.id);
          } catch (err) {
            toast.error("⚠️ Couldn't mark appointment as paid.");
          }
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("❌ Payment failed");
      console.error(err);
    }
  };

  const isPaidRecently = (appointment) =>
    appointment.payment_status === "paid" &&
    new Date(appointment.updated_at) > oneDayAgo;

  const totalPending = appointments.length;
  // const totalDue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalDue = paymentTarget?.profile?.price || 0;

  // const totalDue = appointments.length; // Count only if not paid


  return (
    <>
      <MainNavbar />
      {isBhooswami && (
        <ToastContainer position="top-center" className="mt-2">
          <Toast bg="light" className="shadow-sm">
            <Toast.Body>
              💡 <strong>{totalPending}</strong> appointments pending payment · Total due: ₹{totalDue}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      )}
      {isAuthenticated && (
        <>
          <Sidebar
            isOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />
          <div
            className={`sidebar-overlay ${sidebarOpen ? "visible" : "hidden"}`}
            onClick={() => setSidebarOpen(false)}
          ></div>
        </>
      )}

      <div
        className="content-area"
        style={{
          marginTop: "56px",
          transition: "filter 0.3s ease",
          filter: isAuthenticated && sidebarOpen ? "blur(0.9px) brightness(0.8)" : "none",
        }}
      >
        <Container>
          {isBhooswami ? (
            <>
              <h4 className="fw-bold mt-4 mb-3">💳 Pending Payments</h4>
              {loading ? (
                <Spinner animation="border" />
              ) : appointments.length === 0 ? (
                <p className="text-muted">No pending payments found or eligible after 30 days.</p>
              ) : (
                <Row className="gap-3">
                  {appointments.map((a) => {
                    const overrideTarget = {
                      userId:
                        a.krisshak_user_id === loggedInUserId
                          ? a.bhooswami_user_id
                          : a.krisshak_user_id,
                      userType:
                        a.krisshak_user_id === loggedInUserId
                          ? "bhooswami"
                          : "krisshak",
                    };

                    return (
                      <ProfileWithFetch
                        key={a.id}
                        appointment={a}
                        viewerType="bhooswami"
                        appointmentStatus="confirmed"
                        overrideTarget={overrideTarget}
                        customMessage="Confirmed appointment over 30 days old"
                        onPayNow={isBhooswami ? (profile) => setPaymentTarget({ appointment: a, profile }) : null}
                      />

                    //   <ProfileWithFetch
                    //     key={a.id}
                    //     appointment={a}
                    //     viewerType="bhooswami"
                    //     appointmentStatus="confirmed"
                    //     overrideTarget={overrideTarget}
                    //     actionButtons={
                    //       (() => {
                    //         const createdAt = new Date(a.date || a.created_at);
                    //         const updatedAt = new Date(a.updated_at || a.created_at);
                    //         const now = new Date();
                    //         const daysSinceCreated = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
                    //         const daysSincePaid = Math.floor((now - updatedAt) / (1000 * 60 * 60 * 24));
                    //         const isPaid = a.payment_status === "paid";

                    //         if (isPaid && daysSincePaid < 1) {
                    //           return <Button variant="secondary" disabled>✅ Paid</Button>;
                    //         }

                    //         if (!isPaid && daysSinceCreated < 30) {
                    //           const remaining = 30 - daysSinceCreated;
                    //           const progressPercent = Math.min((daysSinceCreated / 30) * 100, 100);

                    //           return (
                    //             <>
                    //               <Button variant="warning" disabled>⏳ Make Payment</Button>
                    //               <div className="mt-1">
                    //                 <div
                    //                   style={{
                    //                     height: "6px",
                    //                     borderRadius: "3px",
                    //                     backgroundColor: "#e9ecef",
                    //                     overflow: "hidden",
                    //                   }}
                    //                 >
                    //                   <div
                    //                     style={{
                    //                       width: `${progressPercent}%`,
                    //                       height: "100%",
                    //                       backgroundColor: "#ffc107",
                    //                       transition: "width 0.5s ease",
                    //                     }}
                    //                   />
                    //                 </div>
                    //                 <small className="text-muted d-block text-center mt-1">
                    //                   {daysSinceCreated} / 30 days completed · {remaining} days left
                    //               </small>
                    //             </div>
                    //           </>
                    //         );
                    //       }

                    //       if (!isPaid && daysSinceCreated >= 30) {
                    //         return (
                    //           <Button
                    //             variant="success"
                    //             onClick={() => setPaymentTarget({ appointment: a, profile: a.krisshak })}
                    //           >
                    //             💳 Pay Now
                    //           </Button>
                    //         );
                    //       }

                    //       return null;
                    //     })()
                    //   }
                    //   customMessage="Confirmed appointment over 30 days old"
                    //   onPayNow={(profile) => setPaymentTarget({ appointment: a, profile })}
                    // />
                    );
                  })}
                </Row>
              )}
              <hr className="my-4" />
            </>
          ) : (
            <div className="text-muted">
              ℹ️ Payments are handled by Bhooswami users only. Logged in as{""}<strong>Krisshak</strong>.
            </div>
          )}

          <h4 className="fw-bold mb-3">📜 Payment History</h4>
          {payments.length === 0 ? (
            <p className="text-muted">No payments found.</p>
          ) : (
            payments.map((p) => (
              <Card
                key={p.id}
                className={`mb-2 ${
                  p.id === lastAddedPaymentId ? "border-success border-3" : ""
                }`}
              >
                <Card.Body className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{p.type === "tip" ? "💰 Tip" : "💳 Payment"}</strong> — ₹{p.amount}
                    <br />
                    <small className="text-muted">{p.purpose}</small>
                  </div>
                  <div>
                    <Badge bg={p.status === "completed" ? "success" : "warning"}>
                      {p.status.toUpperCase()}
                    </Badge>
                    <br />
                    <small className="text-muted">{new Date(p.created_at).toLocaleString()}</small>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Container>
      </div>

      {/* Modal confirmation for Bhooswami users only */}
      {isBhooswami && paymentTarget && (
        <Modal show onHide={() => setPaymentTarget(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Payment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              💳 Are you sure you want to pay{" "}
              <strong>₹{paymentTarget?.profile?.price}</strong> to{" "}
              <strong>{paymentTarget?.profile?.name || "Krisshak"}</strong>?
            </p>
            {paymentTarget?.profile?.profile_picture && (
              <div className="text-center mb-2">
                <img
                  src={paymentTarget.profile.profile_picture}
                  alt="Recipient"
                  style={{ width: "80px", borderRadius: "50%" }}
                />
              </div>
            )}
            {paymentTarget?.profile?.preferred_language && (
              <p className="text-muted">
                Preferred language: {paymentTarget.profile.preferred_language}
              </p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setPaymentTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={() => {
                handlePayNow(paymentTarget.appointment, paymentTarget.profile);
                setPaymentTarget(null);
              }}
            >
              Proceed to Pay
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default PaymentsPage;
