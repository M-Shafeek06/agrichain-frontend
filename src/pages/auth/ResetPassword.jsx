import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";

function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/roles/reset-password", {
        token,
        newPassword: password,
      });

      alert("Password reset successful. Please login.");
      navigate("/login-role");
    } catch {
      setError("Invalid or expired token");
    }
  };

  return (
    <>
      <Navbar />

      <div style={styles.container}>

        {/* ===== Hill Background ===== */}
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

        {/* ===== Back Button ===== */}
        <div style={styles.backRow}>
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>

        {/* ===== Reset Card ===== */}
        <div style={styles.centerContainer}>
          <div style={styles.card}>

            <h2 style={styles.heading}>Reset Password</h2>

            <form style={styles.form} onSubmit={handleReset}>

              <input
                style={styles.input}
                placeholder="Reset Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />

              <input
                style={styles.input}
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <p style={styles.error}>{error}</p>}

              <button
                style={styles.button}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#14532d";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#14532d";
                }}
              >
                Update Password
              </button>

            </form>

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
    overflow: "hidden",
    background: "linear-gradient(#f8fafc, #eef2f7)"
  },

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
    fontWeight: "600",
    cursor: "pointer"
  },

  centerContainer: {
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    zIndex: 1
  },

  card: {
    maxWidth: "420px",
    width: "100%",
    padding: "32px",
    background: "#ffffff",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    textAlign: "center"
  },

  heading: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "24px"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },

  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1"
  },

  button: {
    background: "transparent",
    color: "#14532d",
    border: "1px solid #14532d",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "10px 18px",
    alignSelf: "center"
  },

  error: {
    color: "#b91c1c"
  }

};

export default ResetPassword;
