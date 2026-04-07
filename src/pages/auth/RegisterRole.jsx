import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import { DISTRICTS } from "../../data/districts";
import Select from "react-select";

function RegisterRole() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    organization: "",
    location: ""
  });

  const districtOptions = DISTRICTS.map(d => ({
    value: d,
    label: d
  }));

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roleId, setRoleId] = useState("");
  const [registeredName, setRegisteredName] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("selectedRole");
    if (!role) navigate("/select-role");
    else setSelectedRole(role);
  }, [navigate]);

  const conditions = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password)
  };

  const nameRegex = /^[A-Za-z\s]{1,25}$/;
  const nameValid = nameRegex.test(formData.name.trim());

  const passwordStrong = Object.values(conditions).every(Boolean);

  const passwordsMatch =
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const isFormValid =
    selectedRole &&
    nameValid &&
    passwordStrong &&
    passwordsMatch &&
    formData.location.trim() &&
    !loading;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      setLoading(true);

      const res = await api.post("/roles/register", {
        role: selectedRole,
        name: formData.name.trim(),
        password: formData.password,
        organization: formData.organization,
        location: formData.location
      });

      setRoleId(res.data.roleId);
      setRegisteredName(formData.name);
      localStorage.removeItem("selectedRole");

    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div style={styles.container}>

        {/* Hill Background */}
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

        {/* Back Button */}
        <div style={styles.topRow}>
          <button
            style={styles.backBtn}
            onClick={() => navigate("/select-role")}
          >
            ← Back
          </button>
        </div>

        {!roleId && (
          <div style={styles.titleWrapper}>
            <h2 style={styles.pageTitle}>REGISTER ROLE IDENTITY</h2>
          </div>
        )}

        <div style={roleId ? styles.successPage : styles.page}>
          <div style={{ ...styles.card, maxWidth: roleId ? "720px" : "420px" }}>

            {!roleId ? (

              <div style={styles.formWrapper}>
                <div style={styles.roleText}>
                  SELECTED ROLE: {selectedRole}
                </div>

                <form style={styles.form} onSubmit={handleSubmit}>

                  <label>Full Name *</label>
                  <input
                    style={styles.input}
                    name="name"
                    maxLength={25}
                    value={formData.name}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (/^[A-Za-z\s]*$/.test(value)) {
                        setFormData({ ...formData, name: value });
                      }
                    }}
                  />
                  {formData.name && !nameValid && (
                    <p style={{ fontSize: "12px", color: "#dc2626" }}>
                      Name must contain only letters and be under 25 characters.
                    </p>
                  )}

                  <label>Password *</label>
                  <div style={styles.inputGroup}>
                    <input
                      style={styles.input}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <span
                      style={styles.eye}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      👁
                    </span>
                  </div>

                  {formData.password && (
                    <p style={styles.ruleText}>
                      <span style={{ color: conditions.length ? "#16a34a" : "#dc2626" }}>8 chars</span>,{" "}
                      <span style={{ color: conditions.uppercase ? "#16a34a" : "#dc2626" }}>uppercase</span>,{" "}
                      <span style={{ color: conditions.number ? "#16a34a" : "#dc2626" }}>number</span>,{" "}
                      <span style={{ color: conditions.special ? "#16a34a" : "#dc2626" }}>special</span>
                    </p>
                  )}

                  <label>Confirm Password *</label>
                  <div style={styles.inputGroup}>
                    <input
                      style={styles.input}
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <span
                      style={styles.eye}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      👁
                    </span>
                  </div>

                  {formData.confirmPassword && (
                    <p style={{
                      fontSize: "12px",
                      color: passwordsMatch ? "#16a34a" : "#dc2626"
                    }}>
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}

                  <label>Organization (optional)</label>
                  <input
                    style={styles.input}
                    name="organization"
                    placeholder="Organization Name"
                    value={formData.organization}
                    onChange={handleChange}
                  />

                  <label>Location *</label>

                  <div style={{ position: "relative", zIndex: 5 }}>
                    <Select
                      options={districtOptions}
                      placeholder="Search & select district"
                      value={
                        districtOptions.find(
                          option => option.value === formData.location
                        ) || null
                      }
                      onChange={(selected) =>
                        setFormData({
                          ...formData,
                          location: selected ? selected.value : ""
                        })
                      }
                      menuPortalTarget={document.body}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderRadius: "6px",
                          borderColor: "#cbd5e1",
                          minHeight: "40px"
                        }),
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999
                        })
                      }}
                    />
                  </div>

                  {error && <p style={styles.error}>{error}</p>}

                  <button
                    disabled={!isFormValid}
                    style={{
                      ...styles.submitBtn,
                      background: isFormValid ? "#14532d" : "#9ca3af"
                    }}
                  >
                    {loading ? "Registering..." : "Register Role"}
                  </button>

                </form>
              </div>

            ) : (

              <div style={styles.successWrapper}>
                <h3 style={{ color: "#14532d" }}>
                  Registration Successful
                </h3>

                <p>Your <b>{selectedRole}</b> role has been registered.</p>
                <p><b>Full Name:</b> {registeredName}</p>
                <p><b>Role ID:</b> {roleId}</p>

                <button
                  style={{ ...styles.submitBtn, background: "#14532d" }}
                  onClick={() => navigate("/auth")}
                >
                  Proceed to Login
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
    overflowY: "hidden",
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

  topRow: {
    padding: "24px 39px",
    position: "relative",
    zIndex: 2
  },

  titleWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: "-30px",
    marginBottom: "4px",
    position: "relative",
    zIndex: 2
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "#14532d",
    fontWeight: "600",
    cursor: "pointer"
  },

  pageTitle: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    letterSpacing: "1px",
    textTransform: "uppercase",
    fontFamily: "Calibri, Arial, sans-serif"
  },

  page: {
    display: "flex",
    justifyContent: "center",
    padding: "6px 20px",
    position: "relative",
    zIndex: 1
  },

  successPage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "70vh",
    position: "relative",
    zIndex: 1
  },

  card: {
    width: "100%",
    padding: "20px",
    border: "1.5px solid #cbd5e1",
    borderRadius: "10px",
    background: "#fff",
    display: "flex",
    justifyContent: "center"
  },

  formWrapper: {
    width: "360px",
    display: "flex",
    flexDirection: "column"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  inputGroup: {
    position: "relative"
  },

  input: {
    width: "100%",
    padding: "10px 40px 10px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box"
  },

  eye: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    fontSize: "14px"
  },

  ruleText: {
    fontSize: "12px"
  },

  error: {
    color: "#dc2626",
    fontSize: "12px"
  },

  submitBtn: {
    marginTop: "12px",
    padding: "8px 20px",
    border: "none",
    borderRadius: "6px",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    alignSelf: "center"
  },

  roleText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#14532d",
    marginBottom: "10px"
  },

  successWrapper: {
    textAlign: "center",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px"
  }

};

export default RegisterRole;
