import { useEffect } from "react";

const WebSocketConnector = ({ onNoticeReceived }) => {
  useEffect(() => {
    
  const token = localStorage.getItem("accessToken");
  const socket = new WebSocket(`wss://web-production-f62a7.up.railway.app/ws/notifications/?token=${token}`);
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.title === "📢 New Notice Posted") {
        onNoticeReceived(data.message);
      }
    };
    return () => socket.close();
  }, [onNoticeReceived]);

  return null;
};

export default WebSocketConnector;
