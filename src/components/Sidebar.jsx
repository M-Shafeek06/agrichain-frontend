import { useNavigate } from "react-router-dom";

export default function Sidebar({ onToggle, open, farmerName, farmerId }) {
  const navigate = useNavigate();

  const navItem = {
    padding: "12px 16px",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 6,
    color: "#e5f5ef",
    fontWeight: 500
  };

  const logoutItem = {
    ...navItem,
    marginTop: 28,
    color: "#fecaca",
    borderTop: "1px solid rgba(255,255,255,0.25)",
    paddingTop: 16,
    fontWeight: 600
  };

  return (
    <>
      {/* Hover trigger */}
      <div
        className="drawer-hover-zone"
        onMouseEnter={() => onToggle(true)}
      >
        <div className="drawer-toggle">☰</div>
      </div>

      {/* Sidebar panel – stays open while cursor is inside */}
      <div
        className={`drawer-panel ${open ? "open" : ""}`}
        onMouseLeave={() => onToggle(false)}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 64px)",
          overflow: "hidden"
        }}
      >
        <div className="drawer-profile">
          <div className="drawer-avatar"></div>
          <div className="drawer-user">
            <div className="drawer-name">{farmerName}</div>
            <div className="drawer-id">ID: {farmerId}</div>
          </div>
        </div>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}
        >
          <li
            className={activeTab === "create" ? "nav-item active" : "nav-item"}
            onClick={() => { setActiveTab("create"); setDrawerOpen(false); }}
          >
            Produce Registration
          </li>

          <li
            className={activeTab === "history" ? "nav-item active" : "nav-item"}
            onClick={() => { setActiveTab("history"); setDrawerOpen(false); }}
          >
            My Produce History
          </li>

          <li
            className={activeTab === "analytics" ? "nav-item active" : "nav-item"}
            onClick={() => { setActiveTab("analytics"); setDrawerOpen(false); }}
          >
            Analytics Dashboard
          </li>

          <li className="nav-item">Profile Settings</li>
          <li className="nav-item">Support</li>

          {/* 🔴 LOGOUT – FIXED JUST BELOW SUPPORT */}
          <li
            className="nav-item"
            style={{
              marginTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.2)",
              paddingTop: 12,
              color: "#fecaca",
              fontWeight: 600
            }}
            onClick={() => {
              const confirmExit = window.confirm(
                "You are completely going out from the farmer batch production. Do you want to continue?"
              );
              if (!confirmExit) return;
              localStorage.clear();
              navigate("/auth");
            }}
          >
            ⎋ Logout
          </li>
        </ul>
      </div>
    </>
  );
}