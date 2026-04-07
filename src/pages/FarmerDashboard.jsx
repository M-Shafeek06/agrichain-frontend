import { useState, useEffect, useCallback } from "react";
import "./FarmerDashboard.css";
import Navbar from "../components/Navbar";
import ProduceForm from "../components/ProduceForm";
import RecentSubmissions from "../components/RecentSubmissions";
import FarmerHistoryPanel from "../components/FarmerHistoryPanel";
import farmerAvatar from "../assets/farmer.png";
import { useNavigate, useLocation } from "react-router-dom";
import ProfileSettings from "../pages/ProfileSettings";
import Support from "../pages/Support";
import FarmerHome from "../pages/FarmerHome";
import api from "../api/axios";

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  // create | history | dashboard | profile | support

  const [createdBatch, setCreatedBatch] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [resetForm, setResetForm] = useState(false);

  // 🔁 Refresh controls (used by child components)
  const [refreshRecent, setRefreshRecent] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(false);

  const farmerName = localStorage.getItem("roleName");
  const farmerId = localStorage.getItem("roleId");
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {

    const checkProfile = async () => {

      try {

        const res = await api.get(`/profile/${farmerId}`);
        const p = res.data || {};

        const required = [
          "name",
          "organization",
          "address",
          "pincode",
          "emergencyContact"
        ];

        const missing = required.some(field => {
          const value = p[field];
          return value === "" || value === null || value === undefined;
        });

        setProfileIncomplete(missing);

        /* 🔒 FORCE PROFILE PAGE IF INCOMPLETE */
        if (missing) {
          setActiveTab("profile");
        }

      } catch (err) {
        console.error("Profile check failed");
      }

    };

    if (farmerId) checkProfile();

  }, [farmerId]);

  /* ---------- RESTORE TAB ON BACK NAV ---------- */
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    if (profileIncomplete) {
      setActiveTab("profile");
    }
  }, [profileIncomplete]);

  useEffect(() => {

    const refreshProfile = async () => {

      try {

        const res = await api.get(`/profile/${farmerId}`);
        const p = res.data || {};

        const required = [
          "name",
          "organization",
          "address",
          "pincode",
          "emergencyContact"
        ];

        const missing = required.some(field => {
          const value = p[field];
          return value === "" || value === null || value === undefined;
        });

        setProfileIncomplete(missing);

        /* 🔓 unlock dashboard automatically */
        if (!missing) {
          setActiveTab("create");
        }

      } catch (err) {
        console.error("Profile refresh failed");
      }

    };

    const handler = () => refreshProfile();

    window.addEventListener("profileUpdated", handler);

    return () => window.removeEventListener("profileUpdated", handler);

  }, [farmerId]);

  /* ---------- HANDLERS (NO LOGIC CHANGE) ---------- */
  const closeDrawerAndSetTab = useCallback((tab) => {

    if (profileIncomplete && tab !== "profile") {
      alert("⚠ Please complete your profile before accessing other sections.");
      setActiveTab("profile");
      setDrawerOpen(false);
      return;
    }

    setActiveTab(tab);
    setDrawerOpen(false);

  }, [profileIncomplete]);

  const handleLogout = useCallback(() => {
    const confirmExit = window.confirm(
      "You are completely going out from the farmer role page. Do you want to continue?"
    );
    if (!confirmExit) return;

    localStorage.clear();
    navigate("/auth");
  }, [navigate]);

  const handlePopupClose = useCallback(() => {
    setShowPopup(false);
    setCreatedBatch(null);

    // 🔄 Force live refresh everywhere
    setRefreshRecent(p => !p);
    setResetForm(p => !p);
    setRefreshHistory(p => !p);
  }, []);

  return (
    <>
      <Navbar />

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`drawer-panel ${drawerOpen ? "open" : ""}`}
        onMouseLeave={() => setDrawerOpen(false)}
      >
        <div className="drawer-profile">
          <div className="avatar-wrap">
            <img src={farmerAvatar} alt="farmer" />
          </div>
          <div>
            <div>{farmerName || "--"}</div>
            <div className="drawer-id">ID: {farmerId || "--"}</div>
          </div>
        </div>

        <ul className="drawer-nav">
          <li
            className={`nav-item ${activeTab === "create" ? "active" : ""}`}
            onClick={() => closeDrawerAndSetTab("create")}
          >
            Produce Registration
          </li>

          <li
            className={`nav-item ${activeTab === "history" ? "active" : ""}`}
            onClick={() => closeDrawerAndSetTab("history")}
          >
            My Produce History
          </li>

          <li
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => closeDrawerAndSetTab("dashboard")}
          >
            Dashboard
          </li>

          <li
            className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => closeDrawerAndSetTab("profile")}
          >
            Profile Settings
          </li>

          <li
            className={`nav-item ${activeTab === "support" ? "active" : ""}`}
            onClick={() => closeDrawerAndSetTab("support")}
          >
            Support
          </li>

          <li
            className="logout-item logout-btn"
            onClick={handleLogout}
          >
            LOG OUT
          </li>
        </ul>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="dashboard-layout">
        <div className="dashboard-main">

          <div className="dashboard-topbar">
            <span
              className="menu-btn"
              onMouseEnter={() => setDrawerOpen(true)}
            >
              ☰
            </span>
          </div>

          <section className="dashboard-content">

            {/* CREATE TAB */}
            {activeTab === "create" && (
              <div className="dashboard-grid">
                <div className="produce-card">
                  <ProduceForm
                    resetForm={resetForm}
                    setCreatedBatch={(data) => {
                      setCreatedBatch(data);
                      setShowPopup(true);
                    }}
                  />
                </div>

                <div className="recent-card">
                  <RecentSubmissions refresh={refreshRecent} />
                </div>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === "history" && (
              <FarmerHistoryPanel
                farmerId={farmerId}
                refresh={refreshHistory}
              />
            )}

            {/* DASHBOARD TAB */}
            {activeTab === "dashboard" && (
              <FarmerHome />
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <ProfileSettings />
            )}

            {/* SUPPORT TAB */}
            {activeTab === "support" && (
              <Support />
            )}

          </section>
        </div>
      </main>

      {/* ===== POPUP ===== */}
      {showPopup && createdBatch && (
        <div className="popup-overlay">
          <div className="popup-modal">
            <h3>Batch Created Successfully</h3>

            <p className="popup-batch-id">
              <strong>{createdBatch.batchId}</strong>
            </p>

            <img
              src={createdBatch.qrCode}
              alt="QR"
              className="popup-qr"
            />

            <button
              className="popup-btn"
              onClick={handlePopupClose}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
