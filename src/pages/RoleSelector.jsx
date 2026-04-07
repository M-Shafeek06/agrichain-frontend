import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RoleCard from "../components/RoleCard";

function RoleSelector() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    const roleId = localStorage.getItem("roleId");

    if (role && roleId) navigate("/auth");
  }, [navigate]);

  const handleRoleSelect = (role) => {
    localStorage.setItem("selectedRole", role);
    navigate("/register-role");
  };

  return (
    <>
      <Navbar />

      <div style={styles.wrapper}>

        {/* ===== MOUNTAIN BACKGROUND ===== */}
        <div style={styles.waveContainer}>

          <svg viewBox="0 0 1440 500" style={styles.waveBack}>
            <path
              fill="#bbf7d0"
              d="M0,320 C360,220 720,420 1080,300 C1320,240 1440,320 1440,500 L0,500 Z"
            />
          </svg>

          <svg viewBox="0 0 1440 500" style={styles.waveMid}>
            <path
              fill="#86efac"
              d="M0,360 C360,260 720,460 1080,340 C1320,280 1440,360 1440,500 L0,500 Z"
            />
          </svg>

          <svg viewBox="0 0 1440 500" style={styles.waveFront}>
            <path
              fill="#4ade80"
              d="M0,400 C360,300 720,500 1080,380 C1320,320 1440,400 1440,500 L0,500 Z"
            />
          </svg>

        </div>

        {/* Back button */}
        <div style={styles.backRow}>
          <button style={styles.backBtn} onClick={() => navigate("/auth")}>
            ← Back
          </button>
        </div>

        {/* Main content */}
        <div style={styles.centerBlock}>
          <h2 style={styles.heading}>SELECT YOUR ROLE</h2>

          <p style={styles.subheading}>
            Choose how you want to create your AgriChainTrust account
          </p>

          <div style={styles.grid}>
            <RoleCard
              icon="🌾"
              title="Farmer"
              description="Register agricultural produce."
              onClick={() => handleRoleSelect("FARMER")}
            />

            <RoleCard
              icon="🚚"
              title="Transporter"
              description="Update shipment logistics."
              onClick={() => handleRoleSelect("TRANSPORTER")}
            />

            <RoleCard
              icon="📦"
              title="Distributor"
              description="Manage warehouse & dispatch."
              onClick={() => handleRoleSelect("DISTRIBUTOR")}
            />

            <RoleCard
              icon="🏬"
              title="Retailer"
              description="Confirm product receipt."
              onClick={() => handleRoleSelect("RETAILER")}
            />

            <RoleCard
              icon="📊"
              title="Admin"
              description="View system analytics."
              onClick={() => handleRoleSelect("ADMIN")}
            />
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    top: "86px",
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
    background: "linear-gradient(#f8fafc, #eef2f7)"
  },

  /* ===== MOUNTAIN STYLES ===== */

  waveContainer: {
    position: "absolute",
    bottom: "-30vh",
    left: 0,
    width: "100%",
    height: "110vh",
    overflow: "hidden",
    zIndex: 0
  },

  waveBack: {
    position: "absolute",
    bottom: "-8%",
    width: "100%",
    height: "170%",
    transform: "scale(1.2)",
    filter: "blur(2px)"
  },

  waveMid: {
    position: "absolute",
    bottom: "-5%",
    width: "100%",
    height: "150%",
    transform: "scale(1.15)"
  },

  waveFront: {
    position: "absolute",
    bottom: "-2%",
    width: "100%",
    height: "130%",
    transform: "scale(1.1)"
  },

  /* ===== UI STYLES ===== */

  backRow: {
    position: "absolute",
    top: "24px",
    left: "48px",
    zIndex: 2
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "#14532d",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0
  },

  centerBlock: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1
  },

  heading: {
    fontSize: "30px",
    fontWeight: 700,
    textAlign: "center",
    marginBottom: "6px",
    fontFamily: "Calibri, Arial, sans-serif"
  },

  subheading: {
    fontSize: "15px",
    color: "#64748b",
    textAlign: "center",
    marginBottom: "36px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 220px)",
    gap: "28px",
    justifyContent: "center"
  }
};

export default RoleSelector;
