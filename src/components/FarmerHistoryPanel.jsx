import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function FarmerHistoryPanel({ farmerId, refresh }) {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [deliveredMap, setDeliveredMap] = useState(() => {
    const saved = localStorage.getItem("deliveredBatches");
    return saved ? JSON.parse(saved) : {};
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [dateSortOrder, setDateSortOrder] = useState("desc");
  // "desc" = latest first

  /* ================= FETCH HISTORY ================= */
  useEffect(() => {
    const controller = new AbortController();

    async function fetchHistory() {
      if (!farmerId) return;

      try {
        setLoading(true);

        const res = await api.get(`/farmer/history/${farmerId}`, {
          signal: controller.signal
        });

        const data = Array.isArray(res.data) ? res.data : [];

        const normalized = data.map(p => ({
          ...p,
          transporterInvoice: p.transporterInvoice || null
        }));

        /* 🔥 LOCK DELIVERED STATE */
        const updatedDelivered = { ...deliveredMap };

        normalized.forEach(p => {
          if (
            p.state === "OWNED_BY_DISTRIBUTOR" ||
            p.state === "SOLD" ||
            p.arrivedAtDistributor === true
          ) {
            updatedDelivered[p.batchId] = true;
          }
        });

        setDeliveredMap(updatedDelivered);
        localStorage.setItem("deliveredBatches", JSON.stringify(updatedDelivered));

        setHistory(normalized);

      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("History fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
    return () => controller.abort();

  }, [farmerId, refresh]);

  /* ================= FILTER ================= */
  const filtered = history
    .filter((p) => {
      const key = search.toLowerCase();

      const matchesSearch =
        p.cropName?.toLowerCase().includes(key) ||
        String(p.quantity).includes(key) ||
        p.batchId?.toLowerCase().includes(key);

      const harvestDate = new Date(p.harvestDate);

      const from = fromDate ? new Date(fromDate + "T00:00:00") : null;
      const to = toDate ? new Date(toDate + "T23:59:59") : null;

      const matchesFrom = !from || harvestDate >= from;
      const matchesTo = !to || harvestDate <= to;

      return matchesSearch && matchesFrom && matchesTo;
    })
    .sort((a, b) => {
      const dateA = new Date(a.harvestDate);
      const dateB = new Date(b.harvestDate);

      if (dateSortOrder === "asc") {
        return dateA - dateB; // Oldest first
      } else {
        return dateB - dateA; // Latest first
      }
    });

  /* ================= CSV DOWNLOAD ================= */
  const downloadCSV = (rows) => {
    if (!rows.length) return;

    const headers = [
      "S.No",
      "Batch ID",
      "Crop",
      "Quantity",
      "Harvest Date",
      "Status",
      "Grade",
      "Admin Remark"
    ];

    const csv = [
      headers.join(","),
      ...rows.map((r, index) =>
        [
          index + 1,
          r.batchId,
          r.cropName,
          r.quantity,
          new Date(r.harvestDate).toLocaleDateString(),
          r.verificationStatus,
          r.qualityGrade,
          `"${r.adminRemark || ""}"`
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "produce-history.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ ...styles.page, maxWidth: "100%", padding: "0 10px", marginTop: "-15px" }}>

      {/* ================= HEADER ================= */}
      <div style={styles.topRow}>
        <h2 style={{ ...styles.title, textAlign: "center", width: "100%" }}>
          My Produce History
        </h2>

        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={styles.dateGroup}>
            <label style={styles.dateLabel}>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={styles.date}
            />
          </div>

          <div style={styles.dateGroup}>
            <label style={styles.dateLabel}>To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={styles.date}
            />
          </div>

          <input
            style={styles.search}
            placeholder="Search crop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button style={styles.csvBtn} onClick={() => downloadCSV(filtered)}>
            Download CSV
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div style={styles.scrollArea}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, borderLeft: "1px solid #e5e7eb" }}>S.No</th>
              <th style={styles.th}>Batch ID</th>
              <th style={styles.th}>Crop Name</th>
              <th style={styles.th}>Quantity (kg)</th>
              <th style={styles.th}>Base Price (₹/kg)</th>
              <th style={styles.th}>Total Price (₹)</th>
              <th
                style={{ ...styles.th, cursor: "pointer" }}
                onClick={() =>
                  setDateSortOrder(prev => (prev === "asc" ? "desc" : "asc"))
                }
              >
                Harvest Date {dateSortOrder === "asc" ? "▲" : "▼"}
              </th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Admin Remark</th>
              <th style={styles.th}>Grade</th>
              <th style={styles.th}>Blockchain</th>
              <th style={styles.th}>Invoice</th>
              <th style={styles.th}>Transport</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="12" style={{ padding: 20, textAlign: "center" }}>
                  No records found
                </td>
              </tr>
            )}

            {filtered.map((p, index) => {
              const canStartTransport =
                p.verificationStatus === "APPROVED" &&
                p.state === "VERIFIED_BY_ADMIN" &&
                p.currentOwnerRole === "FARMER" &&
                p.transporterInvoice;

              const isInTransport =
                p.state === "IN_TRANSPORT_TO_DISTRIBUTOR";

              const isCompleted = deliveredMap[p.batchId] === true;

              return (
                <tr key={p.batchId} style={styles.tr}>
                  <td style={{ ...styles.td, borderLeft: "1px solid #e5e7eb" }}>
                    {index + 1}
                  </td>

                  <td style={styles.tdLeft}>{p.batchId}</td>
                  <td style={styles.tdLeft}>{p.cropName}</td>
                  <td style={styles.tdRight}>{p.quantity}</td>
                  <td style={styles.tdRight}>
                    {p.verificationStatus === "APPROVED" && p.basePrice ? (
                      <span style={{ fontWeight: 700, color: "#16a34a" }}>
                        ₹{p.basePrice}
                      </span>
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: 12 }}>
                        Pending
                      </span>
                    )}
                  </td>
                  <td style={styles.tdRight}>
                    {p.verificationStatus === "APPROVED" && p.basePrice ? (
                      <span style={{ fontWeight: 700, color: "#2563eb" }}>
                        ₹{(p.quantity * p.basePrice).toLocaleString()}
                      </span>
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: 12 }}>
                        -
                      </span>
                    )}
                  </td>
                  <td style={styles.tdCenter}>
                    {new Date(p.harvestDate).toLocaleDateString()}
                  </td>

                  <td style={styles.tdCenter}>
                    {p.verificationStatus === "APPROVED" && (
                      <span style={styles.verified}>VERIFIED</span>
                    )}
                    {p.verificationStatus === "PENDING" && (
                      <span style={styles.pending}>PENDING</span>
                    )}
                    {p.verificationStatus === "REJECTED" && (
                      <span style={styles.rejected}>REJECTED</span>
                    )}
                    {p.verificationStatus === "INVALIDATED" && (
                      <span style={styles.tampered}>TAMPERED</span>
                    )}
                  </td>

                  <td style={styles.tdLeft}>{p.adminRemark || "-"}</td>
                  <td style={styles.tdCenter}>
                    <b>{p.qualityGrade}</b>
                  </td>

                  {/* Blockchain */}
                  <td style={styles.tdCenter}>
                    {p.verificationStatus === "PENDING" ? (
                      <span style={{ color: "#9ca3af", fontSize: 12 }}>
                        Awaiting Admin
                      </span>
                    ) : (
                      <button
                        style={styles.viewBtn}
                        onClick={() => navigate(`/produce/view/${p.batchId}`)}
                      >
                        View
                      </button>
                    )}
                  </td>

                  {/* ================= INVOICE COLUMN ================= */}
                  <td style={styles.tdCenter}>
                    {p?.transporterInvoice ? (
                      <button
                        style={styles.invoiceBtn}
                        onClick={(e) => {
                          e.stopPropagation();

                          const url = `https://agrichain-backend-hbb9.onrender.com/api/invoice/${encodeURIComponent(p.batchId)}`;

                          window.open(url, "_blank", "noopener,noreferrer");
                        }}
                      >
                        View
                      </button>
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: 12 }}>
                        Not Available
                      </span>
                    )}
                  </td>

                  {/* ================= TRANSPORT COLUMN ================= */}
                  <td style={styles.tdCenter}>
                    {canStartTransport && (
                      <button
                        style={styles.startBtn}
                        onClick={async () => {

                          const confirmStart = window.confirm(
                            "Are you sure you want to start the pickup?\n\nPlease confirm that you have successfully verified the invoice."
                          );

                          if (!confirmStart) return;

                          try {
                            await api.post("/shipments/start-transport", {
                              batchId: p.batchId,
                              farmerId: farmerId
                            });

                            setHistory(prev =>
                              prev.map(item =>
                                item.batchId === p.batchId
                                  ? { ...item, state: "IN_TRANSPORT_TO_DISTRIBUTOR" }
                                  : item
                              )
                            );

                          } catch (err) {
                            console.error(err);
                            alert(
                              err?.response?.data?.message ||
                              "Failed to start transport"
                            );
                          }
                        }}
                      >
                        Start
                      </button>
                    )}
                    {isInTransport && (
                      <span style={styles.inTransportBadge}>
                        IN TRANSPORT
                      </span>
                    )}

                    {isCompleted && (
                      <span style={styles.completedBadge}>
                        DELIVERED
                      </span>
                    )}

                    {!p.transporterInvoice && (
                      <span style={{ color: "#9ca3af", fontSize: 12 }}>
                        Awaiting Invoice
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && <p style={{ padding: 10 }}>Loading...</p>}
      </div>
    </div>
  );
}


/* ================= STYLES ================= */
const styles = {
  page: {
    width: "100%",
    padding: "4px 28px",
    marginTop: "-20px",   // move entire section upward
    display: "flex",
    flexDirection: "column"
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px"
  },

  title: {
    margin: 0,
    fontSize: "20px"
  },

  startBtn: {
    marginLeft: 8,
    padding: "3px 7px",
    borderRadius: 6,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 10,   // reduced
    cursor: "pointer",
    fontWeight: 600
  },

  inTransportBadge: {
    marginLeft: 6,
    padding: "2px 6px",
    borderRadius: 6,
    fontSize: 9,   // reduced
    fontWeight: 700,
    background: "#dbeafe",

  },

  completedBadge: {
    padding: "2px 6px",
    borderRadius: 6,
    fontSize: 10,   // reduced
    fontWeight: 700,
    background: "#dcfce7",
    color: "#166534"
  },

  search: {
    width: "180px",
    padding: "5px 8px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "13px"
  },

  dateGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 2
  },

  dateLabel: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 600
  },

  date: {
    padding: "5px 6px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 12
  },

  csvBtn: {
    padding: "5px 10px",
    borderRadius: 6,
    border: "1px solid #16a34a",
    background: "#ecfdf5",
    color: "#166534",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600
  },

  scrollArea: {
    maxHeight: "470px",
    overflowY: "auto",
    borderTop: "1px solid #e5e7eb"
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    tableLayout: "fixed"   // important for alignment
  },

  th: {
    padding: "6px 8px",
    borderBottom: "2px solid #e5e7eb",
    borderRight: "2px solid #e5e7eb",
    textAlign: "center",
    fontSize: 13,
    background: "#f8fafc",
    position: "sticky",
    top: 0,
    zIndex: 2
  },

  td: {
    padding: "6px 8px",
    borderBottom: "2px solid #e5e7eb",
    borderLeft: "1px solid #e5e7eb",
    borderRight: "2px solid #e5e7eb",
    textAlign: "center",
    fontSize: 12
  },

  tdLeft: {
    padding: "6px 8px",
    borderBottom: "2px solid #e5e7eb",
    borderLeft: "1px solid #e5e7eb",
    borderRight: "2px solid #e5e7eb",
    textAlign: "left",
    fontSize: 12
  },

  tdRight: {
    padding: "6px 8px",
    borderBottom: "2px solid #e5e7eb",
    borderLeft: "1px solid #e5e7eb",
    borderRight: "2px solid #e5e7eb",
    textAlign: "right",
    fontSize: 12
  },

  tdCenter: {
    padding: "6px 8px",
    borderBottom: "2px solid #e5e7eb",
    borderLeft: "1px solid #e5e7eb",
    borderRight: "2px solid #e5e7eb",
    textAlign: "center",
    fontSize: 12
  },

  tr: {
    background: "#ffffff"
  },

  viewBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 12
  },

  invoiceBtn: {
    background: "none",
    border: "none",
    color: "#166534",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px"
  },

  verified: {
    padding: "3px 8px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 600,
    background: "#dcfce7",
    color: "#166534"
  },

  pending: {
    padding: "3px 8px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 600,
    background: "#fef9c3",
    color: "#854d0e"
  },

  rejected: {
    padding: "3px 8px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 600,
    background: "#fee2e2",
    color: "#991b1b"
  },

  tampered: {
    padding: "3px 8px",
    borderRadius: 5,
    fontSize: 11,
    fontWeight: 700,
    background: "#fee2e2",
    color: "#7f1d1d"
  }
};
