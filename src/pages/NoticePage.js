import React, { useEffect, useState } from "react";
import NoticeFeed from "../components/NoticeFeed";
import NoticeComposer from "../components/NoticeComposer";
import WebSocketConnector from "../components/WebSocketConnector";
import axios from "../axios";
import Sidebar from "../components/Sidebar";
import MainNavbar from "../components/MainNavbar";
import "../App.css";

const NoticePage = () => {
  const [userType, setUserType] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    axios
      .get("users/user/profile/update/", {
        headers: { Authorization: `Token ${accessToken}` },
      })
      .then((res) => {
        const type = res.data.user_type || res.data.user?.user_type;
        setUserType(type);
      })
      .catch((err) => console.error("User type fetch failed:", err));
  }, [accessToken]);

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
          <h2 className="mb-3 fw-bold mt-3 text-center">📢 Notices </h2>
          {/* <h5 className="fw-bold">🗞️ Notices</h5> */}
          <NoticeComposer accessToken={accessToken} userType={userType} />
          <NoticeFeed accessToken={accessToken} />
        </div>
      </div>

      <WebSocketConnector
        onNoticeReceived={(message) => {
          alert("📢 New Notice Posted:\n" + message); // Or dispatch a toast
        }}
      />
    </>
  );
};

export default NoticePage;
