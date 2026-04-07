import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";

function LoginRole() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    roleId: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/roles/login", {
        roleId: formData.roleId.trim(),
        password: formData.password.trim()
      });

      // Accept multiple possible backend field names
      const role =
        res.data.role?.toUpperCase() ||
        res.data.roleType?.toUpperCase() ||
        "";

      const roleId = res.data.roleId || formData.roleId.trim();
      const roleName = res.data.roleName || res.data.name || "";

      if (!role || !roleId) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);
      localStorage.setItem("roleId", roleId);
      localStorage.setItem("roleName", roleName);

      switch (role) {
        case "FARMER":
          navigate("/farmer/dashboard", { replace: true });
          break;

        case "TRANSPORTER":
          navigate("/transporter-dashboard", { replace: true });
          break;

        case "DISTRIBUTOR":
          navigate("/distributor/dashboard", { replace: true });
          break;

        case "RETAILER":
          navigate("/retailer-dashboard", { replace: true });
          break;

        case "ADMIN":
          navigate("/admin-dashboard", { replace: true });
          break;

        default:
          throw new Error("Invalid role assigned");
      }
    } catch (err) {
      console.error("Login Error:", err);
      localStorage.clear();
      setError("Invalid Role ID or Password");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Navbar />

      <div style={styles.container}>

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

        <div style={styles.backRow}>
          <button style={styles.backBtn} onClick={() => navigate("/auth")}>
            ← Back
          </button>
        </div>

        <div style={styles.centerWrapper}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Role Login</h2>
            <p style={styles.subheading}>
              Login using your registered Role ID and password
            </p>

            <form style={styles.form} onSubmit={handleLogin}>
              <input
                style={styles.input}
                name="roleId"
                placeholder="Role ID"
                value={formData.roleId}
                onChange={handleChange}
                required
              />

              <div style={styles.passwordGroup}>
                <input
                  style={styles.input}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <span
                  style={styles.toggle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>

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
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p
              style={styles.forgotLink}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </p>
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

  centerWrapper: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%"
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
    zIndex: 2   // IMPORTANT
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "#14532d",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    padding: 0
  },
  page: { display: "flex", justifyContent: "center", padding: "0 20px" },
  card: {
    width: "100%",
    maxWidth: "520px",   // ← bigger card width
    padding: "42px 40px", // ← same padding as Auth card
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    textAlign: "center",
    boxShadow: "0 10px 28px rgba(20,83,45,0.18)" // same shadow as Auth
  },
  heading: {
    fontSize: "30px",
    fontWeight: "700",
    marginBottom: "8px"
  },

  subheading: {
    fontSize: "15px",
    color: "#64748b",
    marginBottom: "32px"
  },

  form: { display: "flex", flexDirection: "column", gap: "14px" },
  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    boxSizing: "border-box"
  },
  passwordGroup: { position: "relative" },
  toggle: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "12px",
    color: "#14532d",
    cursor: "pointer",
    fontWeight: "600"
  },
  button: {
    background: "transparent",
    color: "#14532d",
    border: "1px solid #14532d",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    padding: "10px 28px",
    alignSelf: "center"
  },
  forgotLink: {
    marginTop: "14px",
    color: "#14532d",
    fontWeight: "600",
    cursor: "pointer"
  },
  error: { color: "#b91c1c", fontSize: "14px" }
};

export default LoginRole;
