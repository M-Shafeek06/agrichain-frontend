import { useEffect, useState } from "react";
import api from "../api/axios";

export default function RecentSubmissions({ refresh }) {
  const farmerId = localStorage.getItem("roleId");
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/produce/recent/${farmerId}`);
        setItems(res.data || []);
      } catch (err) {
        console.error("RECENT LOAD ERROR:", err);
      }
    };
    load();
  }, [farmerId, refresh]);

  if (!items.length) {
    return (
      <>
        <h3>Recent Submissions</h3>
        <p style={{ color: "#64748b" }}>
          No produce batches submitted yet.
        </p>
      </>
    );
  }

  return (
    <>
      <h3 style={{ marginBottom: 16 }}>Recent Submissions</h3>

      {items.slice(0, 2).map((item) => {
        const viewUrl = `https://agrichain-frontend-alpha.vercel.app/produce/view/${item.batchId}`;

        let statusLabel = "AUTHENTIC";

        if (item.verificationStatus === "REJECTED") {
          statusLabel = "REJECTED";
        } else if (item.verificationStatus === "INVALIDATED") {
          statusLabel = "TAMPERED";
        } else if (item.integrityStatus === "TAMPERED") {
          statusLabel = "TAMPERED";
        }

        const isAuthentic = statusLabel === "AUTHENTIC";

        return (
          <div
            key={item.batchId}
            style={{
              ...card,
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 12px 28px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 6px 14px rgba(0,0,0,0.05)";
            }}
          >
            {/* LEFT CONTENT */}
            <div>
              <strong style={{ color: "#14532d", fontSize: 15 }}>
                {item.batchId}
              </strong>

              <p style={{ margin: "6px 0" }}>
                Crop : {item.cropName || "—"}
              </p>

              <p style={{ margin: "4px 0" }}>
                Quantity : {item.quantity || item.qty || 0} kg
              </p>

              <p style={{ margin: "4px 0" }}>
                Harvest :{" "}
                {item.harvestDate
                  ? new Date(item.harvestDate).toLocaleDateString()
                  : "—"}
              </p>

              {/* STATUS BADGE */}
              <div
                style={{
                  marginTop: 8,
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "inline-block",
                  color: isAuthentic ? "#166534" : "#991b1b",
                  background: isAuthentic
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(239,68,68,0.15)"
                }}
              >
                {statusLabel === "REJECTED"
                  ? "REJECTED"
                  : `${statusLabel} (${item.integrityScore}%)`}
              </div>
            </div>

            {/* RIGHT QR SECTION */}
            <div
              style={{
                textAlign: "center",
                background: "#f9fafb",
                padding: 10,
                borderRadius: 12
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                  viewUrl
                )}`}
                width="90"
                alt="QR"
                title="View product details"
                style={{ cursor: "pointer" }}
                onClick={() => (window.location.href = viewUrl)}
              />

              <div
                style={{
                  fontSize: 11,
                  marginTop: 6,
                  color: "#6b7280"
                }}
              >
                Scan to Verify
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

const card = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",

  background: "linear-gradient(145deg, #ffffff, #f0fdf4)",
  border: "1px solid #e5e7eb",
  borderTop: "4px solid #22c55e",

  borderRadius: 12,
  padding: 16,
  marginBottom: 14,

  boxShadow: "0 6px 14px rgba(0,0,0,0.05)"
};
