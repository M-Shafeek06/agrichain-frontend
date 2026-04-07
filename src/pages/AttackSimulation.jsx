import { useState } from "react";
import api from "../api/axios";
import AdminLayout from "../layouts/AdminLayout";

export default function AttackSimulation() {
  const [batchId, setBatchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [details, setDetails] = useState(null); // 🔥 popup trigger

  const runSimulation = async () => {
    if (!batchId.trim()) {
      setError("Batch ID is required to simulate an attack");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setDetails(null);

    try {
      const res = await api.post("/admin/simulate-attack", { batchId });

      setResult(res.data?.message || "Attack simulation completed");
      setDetails(res.data); // ✅ open popup
    } catch {
      setError("Attack simulation failed. Please verify Batch ID.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setBatchId("");
    setError("");
    setResult("");
    setDetails(null);
  };

  return (
    <AdminLayout>
      <div style={styles.pageWrapper}>
        <div style={styles.card}>
          <h2 style={styles.title}>Security Attack Simulation</h2>

          <p style={styles.subtitle}>
            This module tests system resilience by simulating blockchain tampering
            and data integrity violations on a specific batch.
          </p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Batch ID</label>
            <input
              type="text"
              placeholder="Enter Batch ID (e.g. BATCH-xxxx)"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              style={styles.input}
            />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
          {result && <div style={styles.successBox}>{result}</div>}

          <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
            <button
              onClick={runSimulation}
              disabled={loading}
              style={styles.primaryBtn}
              onMouseEnter={(e) => {
                e.target.style.background = "#166534";
                e.target.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#166534";
              }}
            >
              {loading ? "Simulating..." : "Run Attack Simulation"}
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 ATTACK DETAILS POPUP */}
      {details && details.tamperedField && (
        <div style={styles.modalOverlay} onClick={resetAll}>
          <div
            style={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: 10, color: "#7f1d1d" }}>
              🚨 Attack Impact Detected
            </h3>

            <div style={styles.forensicBox}>
              <p><b>Field Tampered:</b> {details.tamperedField}</p>
              <p><b>Batch:</b> {batchId}</p>
              <p><b>Before:</b> {details.beforeValue}</p>
              <p><b>After:</b> {details.afterValue}</p>
              <p><b>Status:</b> {details.integrityStatus}</p>
              <p><b>Integrity Score:</b> {(details.integrityScore ?? 0)}%</p>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={resetAll}
                style={styles.resetBtn}
                onMouseEnter={(e) => {
                  e.target.style.background = "#166534";
                  e.target.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#ffffff";
                  e.target.style.color = "#166534";
                }}
              >
                Reset Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  pageWrapper: {
    minHeight: "calc(100vh - 120px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: 60
  },

  card: {
    width: "100%",
    maxWidth: 520,
    background: "#ffffff",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
    border: "2px solid #16a34a"
  },

  title: { marginBottom: 10 },

  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 20
  },

  inputGroup: { marginBottom: 16 },

  label: {
    display: "block",
    marginBottom: 6,
    fontWeight: 600
  },

  input: {
    width: "94%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "2px solid #16a34a",
    outline: "none"
  },

  primaryBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 20px",   // 👈 hugs text
    borderRadius: 10,
    background: "transparent",
    color: "#166534",
    border: "2px solid #166534",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease"
  },

  errorBox: {
    background: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    color: "#991b1b",
    marginBottom: 10
  },

  successBox: {
    background: "#dcfce7",
    padding: 10,
    borderRadius: 8,
    color: "#166534",
    marginBottom: 10
  },

  /* 🔥 MODAL */
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },

  modal: {
    background: "#ffffff",
    width: "90%",
    maxWidth: 460,
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)"
  },

  forensicBox: {
    background: "#fef2f2",
    border: "1px solid #ef4444",
    borderRadius: 10,
    padding: 14,
    color: "#7f1d1d",
    fontSize: 14,
    marginBottom: 16
  },

  resetBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 22px",   // 👈 hugs text
    borderRadius: 10,
    border: "2px solid #166534",
    background: "#ffffff",
    color: "#166534",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.25s ease"
  }
};
