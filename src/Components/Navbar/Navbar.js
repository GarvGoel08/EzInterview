import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);

  const logout = () => {
    localStorage.removeItem("auth-token");
    window.location.href = "/login";
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  return (
    <>
      {/* Button to toggle sidebar on small screens */}
      <button className="ShowSidebarButton" onClick={toggleSidebar}>
        <span className="material-symbols-outlined">menu</span>
      </button>
      <div className={`SideNavbarMain ${showSidebar ? "show" : ""}`}>
        <div className="SideNavbar">
          <button onClick={closeSidebar} className={`CloseButton ${showSidebar ? "show" : ""}`}>
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="SideNavbarLogo">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135682.png"
              alt="Logo"
            />
          </div>
          <div className="SideNavbarMenu">
            <ul>
              <li className={location.pathname === "/profile" ? "NavItemSelected" : ""}>
                <a href="/profile" title="Manage Interviews">
                  <span className="material-symbols-outlined">account_circle</span>
                </a>
              </li>
              <li className={location.pathname === "/candidate" ? "NavItemSelected" : ""}>
                <a href="/candidate" title="Manage Candidates">
                  <span className="material-symbols-outlined">groups</span>
                </a>
              </li>
              <li className={location.pathname === "/interviews" ? "NavItemSelected" : ""}>
                <a href="/interviews" title="Manage Interviews">
                  <span className="material-symbols-outlined">devices</span>
                </a>
              </li>
              <li className={location.pathname === "/candidates/score-list" || location.pathname.startsWith("/candidates/score/") ? "NavItemSelected" : ""}>
                <a href="/candidates/score-list" title="Scores">
                  <span className="material-symbols-outlined">scoreboard</span>
                </a>
              </li>
              <li className={location.pathname === "/candidates/auto-generate" ? "NavItemSelected" : ""}>
                <a href="/candidates/auto-generate" title="Test">
                  <span className="material-symbols-outlined">quiz</span>
                </a>
              </li>
            </ul>
          </div>
          <div>
            <button onClick={logout} className="LogoutButton">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
