import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import DistributorSidebar from "../../components/DistributorSidebar";
import DistributorGuard from "../../guards/DistributorGuard";

export default function DistributorDashboard() {
    const [open, setOpen] = useState(false);

    const name = localStorage.getItem("roleName");
    const id = localStorage.getItem("roleId");

    return (
        <DistributorGuard>

            <Navbar />

            <DistributorSidebar
                open={open}
                setOpen={setOpen}
                distributorName={name}
                distributorId={id}
            />

            <DistributorHome setOpen={setOpen} />

        </DistributorGuard>
    );
}

/* ================= DISTRIBUTOR HOME ================= */

function DistributorHome({ setOpen }) {
    const [stats, setStats] = useState({
        incoming: 0,
        inventory: 0,
        dispatched: 0,
        pending: 0,
        rejected: 0,
        sold: 0
    });

    const [recent, setRecent] = useState([]);
    const [inventoryMap, setInventoryMap] = useState({});
    const [qualityMap, setQualityMap] = useState({});
    const [totalProfit, setTotalProfit] = useState(0);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const roleId = localStorage.getItem("roleId");
                if (!roleId) return;

                const res = await api.get("/distributor/dashboard", {
                    headers: { "x-role-id": roleId }
                });

                const data = res?.data || {};

                setStats({
                    incoming: data.incoming ?? 0,
                    inventory: data.inventory ?? 0,
                    dispatched: data.dispatched ?? 0,
                    pending: data.pending ?? 0,
                    rejected: data.rejected ?? 0,
                    sold: data.sold ?? 0
                });

                setInventoryMap(data.inventoryMap || {});
                setQualityMap(data.qualityMap || {});

                const normalizedRecent = (data.recent || []).map(r => ({
                    _id: r._id,
                    batchId: r.batchId,
                    crop: r.crop || r.cropName || "Unknown",
                    qty: r.qty || r.quantity || 0,
                    status: r.status || "N/A"
                }));

                setRecent(normalizedRecent);

                // ✅ NEW PROFIT (FROM BACKEND DB)
                let profit = 0;

                if (data.produces && Array.isArray(data.produces)) {
                    data.produces.forEach(p => {
                        profit += p.distributorProfit || 0;
                    });
                }

                setTotalProfit(profit);

            } catch (err) {
                console.error("Dashboard fetch failed:", err?.response?.data || err.message);
            }
        }

        fetchDashboard();
    }, []);

    const maxInv = Math.max(1, ...Object.values(inventoryMap));
    const maxQuality = Math.max(1, ...Object.values(qualityMap));

    return (
        <div style={styles.wrapper}>

            {/* HEADER */}
            <div style={styles.headerRow}>
                <div style={styles.hamburger} onMouseEnter={() => setOpen(true)}>
                    ☰
                </div>
                <h2 style={styles.heading}>Distributor Dashboard</h2>
            </div>

            {/* ROW 1 - KPI */}
            <section style={styles.kpiRow}>
                <Stat title="Incoming" value={stats.incoming} />
                <Stat title="Inventory" value={stats.inventory} color="#2563eb" />
                <Stat title="Ready" value={stats.pending} color="#d97706" />
                <Stat title="Dispatched" value={stats.dispatched} color="#16a34a" />
                <Stat title="Sold" value={stats.sold} color="#9333ea" />
                <Stat title="Rejected" value={stats.rejected} color="#dc2626" />
            </section>

            {/* ROW 2 - ANALYTICS */}
            <section style={styles.rowTwo}>

                {/* BY CROP (ONLY THIS SCROLLS) */}
                <div style={styles.compactCard}>
                    <h3 style={styles.cardTitle}>Inventory – By Crop</h3>

                    <div style={styles.cropScrollArea}>
                        {Object.keys(inventoryMap).length === 0 ? (
                            <small style={styles.emptyText}>No inventory data</small>
                        ) : (
                            Object.entries(inventoryMap).map(([crop, qty]) => (
                                <Bar key={crop} label={crop} value={qty} max={maxInv} />
                            ))
                        )}
                    </div>
                </div>

                {/* BY QUALITY (NO SCROLL) */}
                <div style={styles.compactCard}>
                    <h3 style={styles.cardTitle}>Inventory – By Quality</h3>

                    {Object.keys(qualityMap).length === 0 ? (
                        <small style={styles.emptyText}>No quality data</small>
                    ) : (
                        Object.entries(qualityMap).map(([grade, count]) => (
                            <Bar
                                key={grade}
                                label={`Grade ${grade}`}
                                value={count}
                                max={maxQuality}
                            />
                        ))
                    )}
                </div>

                {/* SHIPMENT PIPELINE (NO SCROLL) */}
                <div style={styles.compactCard}>
                    <h3 style={styles.cardTitle}>Shipment Pipeline</h3>

                    <PipelineBar label="Incoming" value={stats.incoming} />
                    <PipelineBar label="Warehouse" value={stats.inventory} />
                    <PipelineBar label="Ready" value={stats.pending} />
                    <PipelineBar label="Dispatched" value={stats.dispatched} />
                </div>

                {/* ===== TOTAL PROFIT CARD ===== */}
                <div style={styles.compactCard}>
                    <h3 style={styles.cardTitle}>Total Profit Earned</h3>

                    <div style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 26,
                        fontWeight: 700,
                        color: "#16a34a"
                    }}>
                        ₹ {totalProfit}
                    </div>

                    <div style={{
                        textAlign: "center",
                        fontSize: 12,
                        color: "#6b7280",
                        marginTop: 6
                    }}>
                        15% margin on sales
                    </div>
                </div>

            </section>

            {/* ROW 3 - RECENT */}
            <section style={styles.recentCard}>
                <h3 style={styles.cardTitle}>Recent Shipments</h3>

                <div style={styles.scrollArea}>
                    {recent.length === 0 ? (
                        <small style={styles.emptyText}>No recent shipments</small>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Batch</th>
                                    <th style={styles.th}>Crop</th>
                                    <th style={styles.th}>Qty</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map(r => (
                                    <tr key={r._id}>
                                        <td style={styles.td}>{r.batchId}</td>
                                        <td style={styles.td}>{r.crop}</td>
                                        <td style={styles.td}>{r.qty}</td>
                                        <td style={styles.td}>{r.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

        </div>
    );
}

/* ================= COMPONENTS ================= */

function Stat({ title, value, color = "#111" }) {
    return (
        <div style={styles.kpiCard}>
            <div style={styles.kpiTitle}>{title}</div>
            <div style={{ ...styles.kpiValue, color }}>{value}</div>
        </div>
    );
}

function Bar({ label, value, max }) {
    const width = max > 0 ? (value / max) * 100 : 0;

    return (
        <div style={{ marginBottom: 10 }}>
            <small>{label} — {value}</small>
            <div style={styles.track}>
                <div style={{ ...styles.fill, width: `${width}%` }} />
            </div>
        </div>
    );
}

function PipelineBar({ label, value }) {
    const max = 10; // adjust if dynamic later
    const percent = Math.min((value / max) * 100, 100);

    return (
        <div style={{ marginBottom: 12 }}>
            <div style={styles.pipelineLabel}>
                <span>{label}</span>
                <strong>{value}</strong>
            </div>

            <div style={styles.track}>
                <div style={{ ...styles.fill, width: `${percent}%` }} />
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const styles = {

    wrapper: {
        height: "calc(100vh - 64px)",
        padding: "16px 24px",
        background: "#f5f7f9",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        overflow: "hidden"
    },

    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: 12
    },

    heading: {
        margin: 0,
        fontSize: 22,
        fontWeight: 600
    },

    hamburger: {
        fontSize: 22,
        cursor: "pointer"
    },

    kpiRow: {
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 16
    },

    kpiCard: {
        background: "#ffffff",
        borderRadius: 12,
        padding: 16,
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    },

    kpiTitle: {
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 4
    },

    kpiValue: {
        fontSize: 24,
        fontWeight: 700
    },

    rowTwo: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: 16,
        height: 220,
        alignItems: "stretch"   // prevents overflow pushing cards
    },

    compactCard: {
        background: "#ffffff",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        minHeight: 0   // FIX
    },

    recentCard: {
        background: "#ffffff",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        height: 220,          // 👈 reduced fixed height
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        overflow: "hidden"
    },

    cropScrollArea: {
        flex: 1,
        overflowY: "auto",
        paddingRight: 6,
        minHeight: 0
    },

    cardTitle: {
        margin: 0,
        marginBottom: 10,
        fontSize: 16,
        fontWeight: 600
    },

    pipelineLabel: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 14,
        marginBottom: 4
    },

    emptyText: {
        color: "#9ca3af",
        fontSize: 13
    },

    track: {
        height: 8,
        background: "#e5e7eb",
        borderRadius: 6,
        marginTop: 4
    },

    fill: {
        height: "100%",
        background: "#2563eb",
        borderRadius: 6
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 14
    },

    th: {
        textAlign: "left",
        padding: "8px",
        borderBottom: "1px solid #e5e7eb"
    },

    td: {
        padding: "8px",
        borderBottom: "1px solid #f3f4f6"
    }
};