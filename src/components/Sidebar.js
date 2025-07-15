import React from "react";
import { Nav,Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import "../App.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  // const links = [
  //   { to: "/", icon: "🏠", text: "Home" },
  //   { to: "/search", icon: "🔍", text: "Search" },
  //   { to: "/appointments", icon: "📅", text: "Appointments" },
  //   { to: "/requests", icon: "📨", text: "Requests" },
  //   { to: "/calender", icon: "🗓️", text: "Calendar" },
  //   { to: "/notice", icon: "📢", text: "Notices" },
  //   { to: "/favorites", icon: "❤️", text: "Favorites" },
  //   { to: "/payments", icon: "💰", text: "Payments" },
  //   { to: "/contact", icon: "☎️", text: "Contact" },
  //   { to: "/profile", icon: "👤", text: "My Profile" },
  // ];

const links = [
  { to: "/", icon: "bi-house", text: "Home" },
  { to: "/search", icon: "bi-search", text: "Search" },
  { to: "/appointments", icon: "bi-calendar-check", text: "Appointments" },
  { to: "/requests", icon: "bi-inbox", text: "Requests" },
  { to: "/calender", icon: "bi-calendar-event", text: "Calendar" },
  { to: "/notice", icon: "bi-megaphone", text: "Notices" },
  { to: "/favorites", icon: "bi-heart", text: "Favorites" },
  { to: "/payments", icon: "bi-currency-rupee", text: "Payments" },
  { to: "/contact", icon: "bi-envelope", text: "Contact" },
  { to: "/profile", icon: "bi-person", text: "My Profile" },
];

return (
    <div className={`sidebar ${isOpen ? "expanded" : "collapsed"}`}>
      <div className="toggle-btn">
        <Button variant="link" onClick={toggleSidebar}>
          {isOpen ? "←" : "→"}
        </Button>
      </div>
      <Nav className="sidebar-nav flex-column px-2">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          const activeIcon = isActive && link.icon !== "bi-search" && link.icon !== "bi-currency-rupee" ? `${link.icon}-fill` : link.icon;

          return (
            <Nav.Link
              key={link.to}
              as={Link}
              to={link.to}
              active={isActive}
              className={`d-flex align-items-center gap-3 py-2 px-3 sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="icon"><i className={`bi ${activeIcon}`}></i></span>
              {isOpen && <span className="label">{link.text}</span>}
            </Nav.Link>
          );
        })}
      </Nav>
    </div>
  );

};

export default Sidebar;
