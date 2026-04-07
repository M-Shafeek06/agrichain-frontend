import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";

function ForgotPassword() {
  const [roleId, setRoleId] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setToken("");

    try {
      const res = await api.post("/roles/forgot-password", { roleId, phone });
      setToken(res.data.resetToken);
      setSuccess("Reset token generated successfully");
    } catch {
      setError("Invalid Role ID or request failed");
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
          <button style={styles.backBtn} onClick={() => navigate("/login-role")}>
            ← Back
          </button>
        </div>

        {/* ===== Center Content ===== */}
        <div style={styles.centerContainer}>

          <div style={styles.card}>

            <h2 style={styles.heading}>Forgot Password</h2>

            <p style={styles.subheading}>
              Enter your Role ID and registered phone number to verify your identity
            </p>

            <form style={styles.form} onSubmit={handleSubmit}>

              <input
                style={styles.input}
                placeholder="Enter Role ID (e.g. FARMER-XXXX)"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                required
              />

              <input
                style={styles.input}
                placeholder="Registered Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              {error && <p style={styles.error}>{error}</p>}
              {success && <p style={styles.success}>{success}</p>}

              {!token && (
                <button
                  type="submit"
                  style={styles.button}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#297748";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#14532d";
                  }}
                >
                  Generate Reset Token
                </button>
              )}

            </form>

            {token && (
              <div style={styles.tokenBox}>
                <strong>Reset Token (Demo Only)</strong>
                <p style={styles.token}>{token}</p>

                <button
                  style={styles.linkBtn}
                  onClick={() => navigate("/reset-password")}
                >
                  Reset Password →
                </button>
              </div>
            )}

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
    overflowY: "hidden  ", // allows safe scroll if token box expands
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
    minHeight: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    position: "relative",
    zIndex: 1
  },

  card: {
    maxWidth: "420px",
    width: "100%",
    padding: "32px",
    textAlign: "center",
    background: "#ffffff",
    borderRadius: "10px",
    border: "1px solid #e5e7eb"
  },

  heading: {
    fontSize: "26px",
    fontWeight: "700",
    marginBottom: "6px"
  },

  subheading: {
    fontSize: "14px",
    color: "#64748b",
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

  tokenBox: {
    marginTop: "26px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "6px",
    fontSize: "13px",
    border: "1px dashed #cbd5e1"
  },

  token: {
    marginTop: "6px",
    wordBreak: "break-all"
  },

  linkBtn: {
    marginTop: "12px",
    background: "none",
    border: "none",
    color: "#14532d",
    fontWeight: "600",
    cursor: "pointer"
  },

  error: {
    color: "#b91c1c",
    fontSize: "13px"
  },

  success: {
    color: "#14532d",
    fontSize: "13px"
  }

};

export default ForgotPassword;
