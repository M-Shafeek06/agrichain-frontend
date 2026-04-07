import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import api from "../api/axios";
import "../pages/FarmerDashboard.css";

export default function GasDashboard() {

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGasStats = async () => {
      try {
        const res = await api.get("/gas/stats");
        setStats(res.data);
      } catch (err) {
        setError("Failed to load gas analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchGasStats();
  }, []);

  return (
    <>
      <Navbar />

      <AdminSidebar open={drawerOpen} setOpen={setDrawerOpen} />

      <main className="dashboard-layout">
        <div className="dashboard-main">

          {/* Top bar with hamburger */}
          <div className="dashboard-topbar">
            <span
              className="menu-btn"
              onMouseEnter={() => setDrawerOpen(true)}
            >
              ☰
            </span>
          </div>

          <section
            className="dashboard-content"
            style={{ marginTop: "-50px" }}
          >
            <h2 style={styles.title}>
              Blockchain Gas Cost Analyzer
            </h2>

            {loading && <p>Loading gas analytics...</p>}

            {error && (
              <p style={{ color: "red" }}>
                {error}
              </p>
            )}

            {!loading && !error && stats && (
              <>
                <div style={styles.cardRow}>

                  <GasStatCard
                    title="Average Gas"
                    value={stats.averageGas}
                  />

                  <GasStatCard
                    title="Maximum Gas"
                    value={stats.maxGas}
                  />

                  <GasStatCard
                    title="Minimum Gas"
                    value={stats.minGas}
                  />

                  <GasStatCard
                    title="Total Transactions"
                    value={stats.totalTransactions}
                  />

                </div>

                <div style={styles.tableCard}>

                  <h3 style={{ marginBottom: 10 }}>
                    Recent Blockchain Transactions
                  </h3>

                  <div style={styles.tableScroll}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th} align="left">Batch ID</th>
                          <th style={styles.th} align="left">Transaction Hash</th>
                          <th style={styles.th} align="center">Gas Used</th>
                          <th style={styles.th} align="left">Operation</th>
                        </tr>
                      </thead>

                      <tbody>
                        {stats.recent && stats.recent.length > 0 ? (
                          stats.recent.map(tx => (
                            <tr key={tx._id}>
                              <td style={styles.td}>{tx.batchId}</td>
                              <td style={{ ...styles.td, fontSize: 12 }}>
                                {tx.txHash.slice(0, 24)}...
                              </td>
                              <td style={styles.td} align="center">
                                {tx.gasUsed}
                              </td>
                              <td style={styles.td}>{tx.operation}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" align="center" style={styles.td}>
                              No recent transactions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </section>
        </div>
      </main>
    </>
  );
}

// Reusable statistics card
function GasStatCard({ title, value }) {
  return (
    <div style={styles.card}>
      <span style={styles.cardTitle}>{title}</span>
      <b style={styles.cardValue}>{value}</b>
    </div>
  );
}

const styles = {

  title: {
    marginBottom: 20
  },

  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 20
  },

  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    borderLeft: "5px solid #10b981",
    borderRight: "5px solid #10b981",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  },

  tableScroll: {
    maxHeight: "350px",
    overflowY: "auto",
    borderTop: "1px solid #e5e7eb"
  },

  cardTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.6
  },

  cardValue: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: 800,
    color: "#065f46"
  },

  tableCard: {
    background: "#ffffff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 10,
    fontSize: 14
  },

  th: {
    borderBottom: "2px solid #e5e7eb",
    padding: "10px 12px",
    fontWeight: 600,
    background: "#f9fafb",
    color: "#374151",
    position: "sticky",
    top: 0,
    zIndex: 2
  },

  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    borderRight: "1px solid #f3f4f6"
  },
};
