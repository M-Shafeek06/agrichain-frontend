import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";
import StatusBadge from "../components/StatusBadge";

import api from "../api/axios";
import { DISTRICTS } from "../data/districts";

const COLORS = {
  primary: "#064e3b",        // Main dark green (sidebar/header)
  primaryHover: "#065f46",
  primaryLight: "#10b981",
  success: "#16a34a",
  border: "#e5e7eb",
  textSecondary: "#6b7280"
};

function TransporterUpdate({ embed = false }) {
  const navigate = useNavigate();

  const roleId = localStorage.getItem("roleId");
  const roleName = localStorage.getItem("roleName");

  /* ================= FORM STATE ================= */

  const [formData, setFormData] = useState({
    batchId: "",
    status: "",
    location: ""
  });

  /* ================= BRAND COLORS ================= */

  const [currentState, setCurrentState] = useState(null);
  const [allowedStatuses, setAllowedStatuses] = useState([]);

  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const sessionId = localStorage.getItem("sessionId");

  /* ================= FETCH BATCH STATE ================= */

  useEffect(() => {
    const fetchBatchState = async () => {
      if (!formData.batchId.trim()) {
        setAllowedStatuses([]);
        return;
      }

      try {
        const res = await api.get(
          `/produce/view/${formData.batchId.trim()}`
        );

        const produce = res.data;
        setCurrentState(produce.state);

        switch (produce.state) {
          case "IN_TRANSPORT_TO_DISTRIBUTOR":
            setAllowedStatuses(["IN_TRANSIT", "AT_DISTRIBUTOR"]);
            break;

          case "RETAILER_REQUESTED":
            setAllowedStatuses(["PICKED_UP"]);
            break;

          case "IN_TRANSPORT_TO_RETAILER":
            setAllowedStatuses(["IN_TRANSIT", "DELIVERED"]);
            break;

          default:
            setAllowedStatuses([]);
        }

      } catch {
        setAllowedStatuses([]);
      }
    };

    fetchBatchState();
  }, [formData.batchId]);

  /* ================= FETCH RECENT ================= */

  const fetchRecent = async () => {
    try {
      const res = await api.get(
        `/shipments/transporter-recent/${roleId}`
      );

      setRecent(res.data || []);
    } catch {
      setRecent([]);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [roleId]);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "batchId" ? { status: "" } : {})
    }));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!allowedStatuses.includes(formData.status)) {
      setError("Invalid status for current batch state.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/shipments/update", {
        batchId: formData.batchId.trim(),
        handlerId: roleId,
        sessionId: sessionId,   // ✅ added
        status: formData.status,
        location: formData.location
      });

      setSuccess("Shipment update recorded successfully.");
      setFormData({ batchId: "", status: "", location: "" });

      fetchRecent();

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Failed to update shipment."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  const Content = (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1.5fr",
      gap: 32,
      marginTop: 20
    }}>
      <div style={styles.card}>
        <h2 style={styles.heading}>
          Transporter Shipment Update
        </h2>

        <p style={styles.subheading}>
          Update transport status for produce batch
        </p>

        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            style={{ ...styles.input, background: "#f1f5f9" }}
            value={roleName}
            readOnly
          />

          <input
            style={styles.input}
            name="batchId"
            placeholder="Batch ID"
            value={formData.batchId}
            onChange={handleChange}
            required
          />

          <select
            style={styles.input}
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="">Select Status</option>

            {allowedStatuses.map(status => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          <select
            style={styles.input}
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          >
            <option value="">Select Current District</option>

            {DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Updating..." : "Submit"}
          </button>
        </form>
      </div>

      <div style={styles.recentCard}>
        <div style={styles.headerRow}>
          <h3 style={styles.recentHeading}>
            Recent Shipment Updates
          </h3>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Latest 3
          </span>
        </div>

        {!recent.length && (
          <p style={styles.empty}>
            No shipment updates yet
          </p>
        )}

        {recent.slice(0, 3).map((r) => {
          const normalizedStatus = r.status?.replaceAll(" ", "_");

          let progressPercent = 0;

          switch (normalizedStatus) {
            case "PICKED_UP":
              progressPercent = 40;
              break;

            case "IN_TRANSIT":
              progressPercent = 70;
              break;

            case "AT_DISTRIBUTOR":
            case "DELIVERED":
              progressPercent = 100;
              break;

            default:
              progressPercent = 0;
          }

          const progressColorMap = {
            PICKED_UP: "#10b981",
            IN_TRANSIT: "#059669",
            AT_DISTRIBUTOR: "#064e3b",
            DELIVERED: COLORS.primary
          };

          const progressColor =
            progressColorMap[normalizedStatus] || "#9ca3af";

          return (
            <div key={r._id} style={styles.shipmentRow}>

              {/* LEFT SECTION */}
              <div style={styles.leftSection}>
                <div style={styles.batchId}>{r.batchId}</div>

                {r.shipmentSessionId && (
                  <div style={styles.sessionText}>
                    Session: {r.shipmentSessionId}
                  </div>
                )}

                {r.shipmentQuantity !== undefined && (
                  <div style={styles.sessionText}>
                    Quantity: {r.shipmentQuantity} kg
                  </div>
                )}

                <div style={styles.metaRow}>
                  {r.cropName && <>🌾 {r.cropName}</>}
                  📍 {r.location}
                  {(r.timestamp || r.createdAt) && (
                    <> • {new Date(r.timestamp || r.createdAt)
                      .toLocaleTimeString("en-IN", { hour12: false })}
                    </>
                  )}
                </div>
              </div>


              {/* CENTER SECTION */}
              <div style={styles.centerSection}>
                <div style={styles.slimProgressTrack}>
                  <div
                    style={{
                      ...styles.slimProgressFill,
                      width: `${progressPercent}%`,
                      background: progressColor
                    }}
                  />
                </div>

                <div style={styles.inlineLabels}>
                  <span>Picked Up</span>
                  <span>In Transit</span>
                  <span>Delivered</span>
                </div>
              </div>

              {/* RIGHT SECTION */}
              <div style={styles.rightSection}>
                <StatusBadge status={r.status} />
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );

  if (embed) return Content;

  return (
    <>
      <Navbar />
      <PageWrapper>
        <button
          style={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        {Content}
      </PageWrapper>
    </>
  );
}
const styles = {
  backBtn: {
    background: "none",
    border: "none",
    color: COLORS.primary,
    fontWeight: 600,
    cursor: "pointer"
  },

  /* ================= LEFT FORM CARD ================= */

  card: {
    background: "#fff",
    padding: 32,
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
  },

  heading: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 6
  },

  subheading: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 24,
    textAlign: "center"
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 14
  },

  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    fontSize: 14
  },

  submitBtn: {
    padding: "10px 24px",
    background: COLORS.primary,
    color: "#ffffff",
    borderRadius: 8,
    border: "none",
    width: "fit-content",
    alignSelf: "center",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.25s ease"
  },

  error: {
    color: "#b91c1c",
    textAlign: "center",
    fontSize: 13
  },

  success: {
    color: COLORS.success,
    textAlign: "center",
    fontSize: 13
  },

  /* ================= RIGHT CARD ================= */

  recentCard: {
    background: "#fff",
    padding: 22,
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  recentHeading: {
    fontWeight: 700,
    fontSize: 16
  },

  /* ================= SHIPMENT ROW (NEW GRID LAYOUT) ================= */

  shipmentRow: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1.6fr 160px",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid #e5e7eb",
    gap: 20
  },

  leftSection: {
    display: "flex",
    flexDirection: "column",
    gap: 4
  },

  centerSection: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 6
  },

  rightSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  batchId: {
    fontWeight: 700,
    fontSize: 14,
    color: "#111827"
  },

  sessionText: {
    fontSize: 12,
    color: "#374151"
  },

  metaRow: {
    display: "flex",
    gap: 8,
    fontSize: 12,
    color: "#6b7280",
    flexWrap: "wrap"
  },

  /* ================= PROGRESS BAR ================= */

  slimProgressTrack: {
    height: 7,
    background: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden"
  },

  slimProgressFill: {
    height: "100%",
    borderRadius: 8,
    transition: "width 0.35s ease"
  },

  inlineLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
    padding: "0 2px"
  }
};
export default TransporterUpdate;