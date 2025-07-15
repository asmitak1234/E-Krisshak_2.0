import React, { useEffect, useState } from "react";
import axios from "../axios";
import"../App.css";
import WebSocketConnector from "./WebSocketConnector"; 

const NoticeFeed = ({ accessToken }) => {
  const [notices, setNotices] = useState([]);
const [highlightedNotice, setHighlightedNotice] = useState(null);

  useEffect(() => {
    axios
      .get("contact/notices/", {
        headers: { Authorization: `Token ${accessToken}` },
      })
      .then((res) => setNotices(res.data.notices || []))
      .catch((err) => console.error("Failed to fetch notices:", err));
  }, [accessToken]);

  return (
    <div className="mt-3">
      
      {notices.length === 0 ? (
        <p className="text-muted">No notices found.</p>
      ) : (
        <ul className="list-group">
          {notices.map((notice, i) => (
            <li key={i} className="list-group-item">
              <span
                className={`badge rounded-pill ${
                    notice.author_name.includes("State Admin") ? "bg-primary" : "bg-info text-dark"
                } ${highlightedNotice === notice.content ? "pulse-animation" : ""}`}
                >
                {notice.author_name.includes("State Admin") ? "🏛️ " : "🏘️ "}
                {notice.author_name}
                </span>

              <div className="mt-2">{notice.content}</div>
              <small className="text-muted">{new Date(notice.timestamp).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
      <WebSocketConnector
        onNoticeReceived={(message) => {
            setHighlightedNotice(message); // can be the text or timestamp
            toast.info("📢 New Notice: " + message); // optional toast
            setTimeout(() => setHighlightedNotice(null), 4000); // Remove animation after 4s
        }}
        />

    </div>
  );
};

export default NoticeFeed;
