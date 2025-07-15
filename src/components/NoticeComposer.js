import React, { useState } from "react";
import axios from "../axios";
import { toast } from "react-toastify";

const NoticeComposer = ({ accessToken, userType }) => {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim()) return toast.warn("Please enter notice content.");

    axios
      .post(
        "/contact/notices/create/",
        { content },
        { headers: { Authorization: `Token ${accessToken}` } }
      )
      .then(() => {
        toast.success("Notice posted!");
        setContent("");
      })
      .catch((err) => toast.error("Failed to post notice."));
  };

  if (!["state_admin", "district_admin"].includes(userType)) return null;

  return (
    <div className="mb-4">
      <textarea
        className="form-control"
        rows="3"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your notice here..."
      />
      <button className="btn btn-primary mt-2" onClick={handleSend}>
        📢 Send Notice
      </button>
    </div>
  );
};

export default NoticeComposer;
