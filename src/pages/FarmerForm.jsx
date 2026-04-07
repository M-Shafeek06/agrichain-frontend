import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import Fuse from "fuse.js";
import PageWrapper from "../components/PageWrapper";
import { cropOptions } from "../data/cropOptions";


function FarmerForm() {
  const navigate = useNavigate();

  const roleId = localStorage.getItem("roleId");
  const roleName = localStorage.getItem("roleName");

  const [formData, setFormData] = useState({
    cropName: "",
    quantity: "",
    harvestDate: "",
    qualityGrade: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [batchId, setBatchId] = useState("");
  const [qrCode, setQrCode] = useState("");

  /* ===== SEARCHABLE DROPDOWN STATE ===== */

  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState("");

  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fuse = new Fuse(cropOptions, {
    threshold: 0.3,
    keys: [
      "english",
      "tamil",
      "malayalam",
      "tamilRoman",
      "malayalamRoman"
    ]
  });

  const filteredCrops =
    searchText.trim() === ""
      ? cropOptions
      : fuse.search(searchText).map((result) => result.item);

  useEffect(() => {
    if (!roleId || !roleName) {
      navigate("/auth");
    }
  }, [navigate, roleId, roleName]);

  /* ✅ Minimum allowed date = today - 3 days */

  const minHarvestDate = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 3);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${y}-${m}-${day}`;
  })();

  const isDateAllowed = (value) => {
    const selected = new Date(value);
    selected.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const min = new Date(today);
    min.setDate(min.getDate() - 3);

    return selected >= min;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.cropName) {
      setError("Please select a crop from the dropdown.");
      return;
    }

    // ✅ FINAL QUANTITY CHECK
    const qty = Number(formData.quantity);
    if (qty < 100 || qty > 1000) {
      setError("Quantity must be between 100 kg and 1000 kg.");
      return;
    }

    if (!isDateAllowed(formData.harvestDate)) {
      setError("Harvest date cannot be earlier than 3 days from today.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/produce/create", {
        farmerId: roleId,
        farmerName: roleName,
        cropName: formData.cropName,
        quantity: qty,
        qualityGrade: formData.qualityGrade,
        harvestDate: formData.harvestDate,
      });

      setBatchId(res.data.batchId);
      setQrCode(res.data.qrCode);

    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(msg || "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div style={styles.backRow}>
        <button
          style={styles.backBtn}
          onClick={() => navigate("/login-role")}
        >
          ← Back
        </button>
      </div>

      <PageWrapper>
        <div style={styles.page}>
          <div style={styles.grid}>
            {/* ================= FORM ================= */}

            <div style={styles.formCard}>
              <h2 style={styles.heading}>
                Farmer Produce Registration
              </h2>

              <form style={styles.form} onSubmit={handleSubmit}>
                <input
                  style={{
                    ...styles.input,
                    background: "#f1f5f9",
                    cursor: "not-allowed",
                  }}
                  value={roleName}
                  readOnly
                />

                {/* ===== SEARCHABLE CROP DROPDOWN ===== */}

                <div className="dropdown-wrap" ref={dropdownRef}>
                  <input className="produce-input"
                    placeholder="Search Crop (English / Tamil / Malayalam)..."
                    value={searchText}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchText(value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    required
                  />

                  {showDropdown && (
                    <div className="dropdown">
                      {filteredCrops.length > 0 ? (
                        filteredCrops.map((crop) => (
                          <div
                            key={crop.english}
                            className="dropdown-item"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                cropName: crop.english
                              });

                              setSearchText(
                                `${crop.english} / ${crop.tamil} / ${crop.malayalam}`
                              );

                              setShowDropdown(false);
                            }}
                          >
                            {crop.english} / {crop.tamil} / {crop.malayalam}
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-item">
                          No results found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <input
                  style={styles.input}
                  type="number"
                  name="quantity"
                  placeholder="Quantity (kg) — 100 to 1000 kg"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="100"
                  max="1000"
                  required
                />

                <input
                  style={styles.input}
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  min={minHarvestDate}
                  required
                />

                <select
                  style={styles.input}
                  name="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Quality Grade</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>

                {error && (
                  <p style={styles.error}>{error}</p>
                )}

                <button
                  style={styles.submitBtn}
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Produce Data"}
                </button>
              </form>
            </div>

            {/* ================= RESULT ================= */}

            <div style={styles.resultCard}>
              {batchId ? (
                <>
                  <h3 style={styles.successTitle}>
                    Batch Successfully Registered
                  </h3>

                  <p style={styles.batchText}>{batchId}</p>

                  <img
                    src={qrCode}
                    alt="QR Code"
                    style={styles.qrImg}
                  />
                </>
              ) : (
                <p style={styles.placeholder}>
                  Submit the form to generate Batch ID & QR Code
                </p>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
}

/* ================= STYLES ================= */

const styles = {
  backRow: {
    width: "100%",
    padding: "25px 48px 0",
    boxSizing: "border-box",
  },

  backBtn: {
    background: "none",
    border: "none",
    color: "#14532d",
    fontWeight: 600,
    cursor: "pointer",
  },

  page: {
    padding: "32px 80px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "40px",
  },

  formCard: {
    background: "#fff",
    padding: "32px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    overflow: "visible"
  },

  resultCard: {
    background: "#f9fafb",
    padding: "32px",
    borderRadius: "10px",
    border: "1px dashed #cbd5e1",
    textAlign: "center",
  },

  heading: {
    fontSize: "28px",
    fontWeight: 700,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  input: {
    padding: "12px 14px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
  },

  dropdown: {
    position: "absolute",
    top: "110%",
    left: 0,
    width: "100%",
    maxHeight: "220px",
    overflowY: "auto",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    zIndex: 99999
  },

  dropdownItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #f1f5f9",
  },

  dropdownWrapper: {
    position: "relative",
    zIndex: 9999,
  },

  submitBtn: {
    background: "transparent",
    color: "#14532d",
    border: "1px solid #14532d",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
    padding: "10px 18px",
    alignSelf: "center",
  },

  error: {
    color: "#b91c1c",
    textAlign: "center",
  },

  successTitle: {
    fontSize: "18px",
    color: "#14532d",
  },

  batchText: {
    fontSize: "14px",
    wordBreak: "break-word",
  },

  qrImg: {
    width: "200px",
    margin: "16px auto",
  },

  placeholder: {
    color: "#94a3b8",
  },
};

export default FarmerForm;
