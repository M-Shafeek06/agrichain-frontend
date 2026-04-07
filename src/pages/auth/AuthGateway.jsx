import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

function AuthGateway() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (location.state?.skipRedirect) return;

    if (role) {
      switch (role) {
        case "FARMER":
          navigate("/farmer/dashboard", { replace: true });
          break;
        case "TRANSPORTER":
          navigate("/transporter-dashboard", { replace: true });
          break;
        case "RETAILER":
          navigate("/retailer-dashboard", { replace: true });
          break;
        case "ADMIN":
          navigate("/admin-dashboard", { replace: true });
          break;
        default:
          break;
      }
    }
  }, [navigate, location.state]);

  const handleCreateAccount = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("roleId");
    localStorage.removeItem("selectedRole");
    navigate("/select-role");
  };

  const handleLogin = () => {
    navigate("/login-role", { state: { skipRedirect: true } });
  };

  const hideBackButton = location.state?.hideBack === true;

  return (
    <>
      <Navbar />

      <div style={styles.container}>

        {/* ===== WAVE BACKGROUND ===== */}
        <div style={styles.waveContainer}>

          {/* Back Hill */}
          <svg viewBox="0 0 1440 500" style={styles.waveBack}>
            <path
              fill="#bbf7d0"
              d="M0,320 C360,220 720,420 1080,300 C1320,240 1440,320 1440,500 L0,500 Z"
            />
          </svg>

          {/* Middle Hill */}
          <svg viewBox="0 0 1440 500" style={styles.waveMid}>
            <path
              fill="#86efac"
              d="M0,360 C360,260 720,460 1080,340 C1320,280 1440,360 1440,500 L0,500 Z"
            />
          </svg>

          {/* Front Hill */}
          <svg viewBox="0 0 1440 500" style={styles.waveFront}>
            <path
              fill="#4ade80"
              d="M0,400 C360,300 720,500 1080,380 C1320,320 1440,400 1440,500 L0,500 Z"
            />
          </svg>
        </div>

        {!hideBackButton && (
          <div style={styles.backRow}>
            <button style={styles.backBtn} onClick={() => navigate("/")}>
              ← Back
            </button>
          </div>
        )}

        <div style={styles.contentWrapper}>
          <h2 style={styles.heading}>Welcome to AgriChainTrust</h2>

          <p style={styles.subheading}>
            Secure access for farmers, transporters, retailers, distributor & administrators
          </p>

          <div style={styles.box}>
            <button
              style={{
                ...styles.primaryBtn,
                ...(hovered === "create" && styles.hoverBtn)
              }}
              onMouseEnter={() => setHovered("create")}
              onMouseLeave={() => setHovered(null)}
              onClick={handleCreateAccount}
            >
              Create New Account
            </button>

            <button
              style={{
                ...styles.secondaryBtn,
                ...(hovered === "login" && styles.hoverBtn)
              }}
              onMouseEnter={() => setHovered("login")}
              onMouseLeave={() => setHovered(null)}
              onClick={handleLogin}
            >
              Login to Existing System
            </button>

            <button
              style={{
                ...styles.consumerBtn,
                ...(hovered === "verify" && styles.hoverBtn)
              }}
              onMouseEnter={() => setHovered("verify")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate("/scan")}
            >
              Verify Product (Consumer)
            </button>
          </div>
        </div>

      </div>
    </>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: "86px",
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    background: "linear-gradient(#f8fafc, #eef2f7)"
  },

  waveContainer: {
    position: "absolute",
    bottom: "-30vh",       // lift hills upward
    left: 0,
    width: "100%",
    height: "110vh",      // 🔥 taller mountains
    overflow: "hidden",
    zIndex: 0
  },

  waveBack: {
    position: "absolute",
    bottom: "-8%",
    width: "100%",
    height: "170%",       // 🔥 increase height
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
    fontSize: "14px",
    fontWeight: "550",
    cursor: "pointer",
    padding: 0
  },

  contentWrapper: {
    width: "480px",
    padding: "42px 40px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 28px rgba(20,83,45,0.18)",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1
  },

  heading: {
    fontSize: "30px",
    fontWeight: "700",
    marginBottom: "8px"
  },

  subheading: {
    fontSize: "15px",
    color: "#64748b",
    marginBottom: "32px",
    textAlign: "center",
    maxWidth: "420px"
  },

  box: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "18px"
  },

  primaryBtn: {
    padding: "14px",
    background: "#ffffff",
    color: "#14532d",
    border: "1px solid #14532d",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s"
  },

  secondaryBtn: {
    padding: "14px",
    background: "#ffffff",
    color: "#14532d",
    border: "1px solid #14532d",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s"
  },

  consumerBtn: {
    padding: "14px",
    background: "#ffffff",
    color: "#14532d",
    border: "1px solid #14532d",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s"
  },

  hoverBtn: {
    background: "#66ca8b",
    color: "#14532d"
  }
};

export default AuthGateway;
