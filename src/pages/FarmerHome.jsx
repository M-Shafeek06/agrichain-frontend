import { useEffect, useState } from "react";
import api from "../api/axios";

export default function FarmerHome() {
    const farmerId = localStorage.getItem("roleId");

    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        pending: 0,
        rejected: 0
    });

    const [kpiExtra, setKpiExtra] = useState({
        authenticQty: 0,
        totalValue: 0
    });


    const [recent, setRecent] = useState([]);
    const [cropQty, setCropQty] = useState({});
    const [qualityMap, setQualityMap] = useState({});

    useEffect(() => {
        let intervalId;

        async function loadDashboard() {
            try {
                const res = await api.get(`/produce/history/${farmerId}`);
                const data = Array.isArray(res.data) ? res.data : [];

                /* 🔒 FIX: INVALIDATED is NOT pending */
                setStats({
                    total: data.length,
                    verified: data.filter(p => p.verificationStatus === "APPROVED").length,
                    pending: data.filter(p => p.verificationStatus === "PENDING").length,
                    rejected: data.filter(p =>
                        p.verificationStatus === "REJECTED" ||
                        p.verificationStatus === "INVALIDATED"
                    ).length
                });

                setRecent(data.slice(0, 7));

                const cropMap = {};
                const qMap = {};

                let authenticQty = 0;
                let totalValue = 0;

                data.forEach(p => {
                    cropMap[p.cropName] = (cropMap[p.cropName] || 0) + p.quantity;
                    qMap[p.qualityGrade] = (qMap[p.qualityGrade] || 0) + p.quantity;

                    // ✅ NEW KPI LOGIC
                    if (p.integrityStatus === "AUTHENTIC") {
                        authenticQty += p.quantity;
                        totalValue += p.quantity * (p.basePrice || 0);
                    }
                });

                setKpiExtra({
                    authenticQty,
                    totalValue
                });

                setCropQty(cropMap);
                setQualityMap(qMap);
            } catch (err) {
                console.error("Dashboard load failed", err);
            }
        }

        if (farmerId) {
            loadDashboard();
            intervalId = setInterval(loadDashboard, 10000);
        }

        return () => clearInterval(intervalId);
    }, [farmerId]);

    const maxCrop = Math.max(...Object.values(cropQty), 1);
    const maxQuality = Math.max(...Object.values(qualityMap), 1);

    /* 🔒 FIX: INVALIDATED treated as TAMPERED */
    const statusStyle = status => {
        if (status === "APPROVED") return styles.approved;
        if (status === "PENDING") return styles.pending;
        if (status === "REJECTED" || status === "INVALIDATED") return styles.rejected;
        return {};
    };

    const displayStatus = status =>
        status === "INVALIDATED" ? "TAMPERED" : status;

    return (
        <div style={styles.wrapper}>
            <h2 style={styles.heading}>Farmer Dashboard</h2>

            {/* KPI ROW */}
            <div style={styles.kpiRow}>
                <Stat title="TOTAL" value={stats.total} bg="#111827" color="#ffffff" />
                <Stat title="VERIFIED" value={stats.verified} bg="#065f46" color="#ffffff" />
                <Stat title="PENDING" value={stats.pending} bg="#92400e" color="#ffffff" />
                <Stat title="REJECTED" value={stats.rejected} bg="#7f1d1d" color="#ffffff" />
                <Stat
                    title="AUTHENTIC QTY"
                    value={`${kpiExtra.authenticQty} kg`}
                    bg="#1e3a8a"
                    color="#ffffff"
                />

                <Stat
                    title="TOTAL VALUE"
                    value={`₹ ${kpiExtra.totalValue}`}
                    bg="#065f46"
                    color="#ffffff"
                />
            </div>

            {/* MAIN GRID */}
            <div style={styles.mainGrid}>
                {/* QUALITY */}
                <div style={styles.panelCompact}>
                    <h4>Quality Grade Distribution</h4>
                    {Object.keys(qualityMap).length === 0 ? (
                        <p style={styles.emptyText}>No activity exists</p>
                    ) : (
                        Object.entries(qualityMap).map(([q, v]) => (
                            <Bar key={q} label={`Grade ${q}`} value={v} max={maxQuality} />
                        ))
                    )}
                </div>

                {/* RECENT SUBMISSIONS */}
                <div
                    style={{
                        ...styles.panelCompact,
                        gridRow: "1 / span 2",
                        gridColumn: "2 / 3",
                        minHeight: 430
                    }}
                >
                    <h4>Recent Submissions</h4>
                    <div style={styles.tableScroll}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Batch</th>
                                    <th style={styles.th}>Harvest Date</th>
                                    <th style={styles.th}>Crop</th>
                                    <th style={styles.th}>Qty</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={styles.emptyCell}>
                                            No activity exists
                                        </td>
                                    </tr>
                                ) : (
                                    recent.map((r, index) => (
                                        <tr
                                            key={r.batchId}
                                            style={{
                                                background: index % 2 === 0
                                                    ? "rgba(255,255,255,0.6)"
                                                    : "rgba(243,244,246,0.6)",
                                                transition: "0.2s"
                                            }}
                                        >
                                            <td style={styles.td}>{r.batchId}</td>
                                            <td style={styles.td}>
                                                {r.harvestDate
                                                    ? new Date(r.harvestDate).toLocaleDateString("en-IN")
                                                    : "—"}
                                            </td>
                                            <td style={styles.td}>{r.cropName}</td>
                                            <td style={styles.td}>{r.quantity} kg</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    ...statusStyle(r.verificationStatus)
                                                }}>
                                                    {displayStatus(r.verificationStatus)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CROP QTY */}
                <div style={styles.cropScroll}>
                    <h4>Crop-wise Quantity</h4>
                    {Object.keys(cropQty).length === 0 ? (
                        <p style={styles.emptyText}>No activity exists</p>
                    ) : (
                        Object.entries(cropQty).map(([c, q]) => (
                            <Bar key={c} label={c} value={q} max={maxCrop} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

/* COMPONENTS (UNCHANGED) */

function Stat({ title, value, color = "#fff", bg = "#111" }) {

    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    return (
        <div style={{
            ...styles.kpiCard,
            background: hexToRgba(bg, 0.72),   // ↑ Increased contrast
            boxShadow: "0 6px 18px rgba(0,0,0,0.10)"  // slightly stronger
        }}>
            <div style={styles.kpiCenter}>
                <div style={{
                    ...styles.kpiTitle,
                    color: "rgba(255,255,255,0.85)"  // brighter title
                }}>
                    {title}
                </div>

                <div style={{
                    ...styles.kpiValue,
                    color,
                    textShadow: "0 1px 2px rgba(0,0,0,0.15)" // subtle depth
                }}>
                    {value}
                </div>
            </div>
        </div>
    );
}

function Bar({ label, value, max }) {
    return (
        <div style={{ marginBottom: 8 }}>
            <small>{label} — {value} kg</small>
            <div style={styles.track}>
                <div style={{ ...styles.fill, width: `${(value / max) * 100}%` }} />
            </div>
        </div>
    );
}

/* STYLES (UNCHANGED) */

const styles = {
    wrapper: {
        padding: "14px 28px",
        background: "#eef2f5",
        height: "100vh",
        overflow: "hidden",
        transform: "translateY(-100px)"
    },

    heading: {
        marginBottom: 14
    },

    emptyText: {
        color: "#6b7280",
        fontSize: 13,
        marginTop: 10
    },

    emptyCell: {
        textAlign: "center",
        padding: "30px",
        color: "#6b7280",
        fontSize: 13
    },

    kpiRow: {
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 10,
        marginBottom: 12
    },

    mainGrid: {
        display: "grid",
        gridTemplateColumns: "1.3fr 2.2fr",
        gridTemplateRows: "auto auto",
        gap: 16,
        alignItems: "start"
    },

    kpiCard: {
        height: 85,
        borderRadius: 12,
        display: "flex",
        justifyContent: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
    },

    kpiCenter: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },

    kpiTitle: {
        fontSize: 11,
        letterSpacing: 0.6,
        marginBottom: 4
    },

    kpiValue: {
        fontSize: 24,
        fontWeight: 700
    },

    tableScroll: {
        maxHeight: 330,   // height for ~9 rows
        overflowY: "auto",
        marginTop: 12
    },

    panelCompact: {
        background: "rgba(255,255,255,0.7)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.05)",
        padding: "18px",
        borderRadius: 12,
    },

    cropScroll: {
        padding: "18px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.7)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.05)",
        maxHeight: 190,
        overflowY: "auto"
    },

    track: {
        height: 10,
        background: "#d1d5db",
        borderRadius: 8,
        marginTop: 6
    },

    fill: {
        height: "100%",
        background: "#1d4ed8",
        borderRadius: 8
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: 12,
        fontSize: 13
    },

    th: {
        textAlign: "left",
        padding: "12px",
        background: "rgba(31,41,55,0.75)",
        color: "#f3f4f6",
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: 0.6
    },

    td: {
        padding: "12px",
        borderBottom: "1px solid #e5e7eb",
        fontSize: 13
    },

    badge: {
        padding: "5px 12px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5
    },

    approved: {
        background: "rgba(22,163,74,0.7)",
        color: "#ffffff"
    },
    pending: {
        background: "rgba(245,158,11,0.7)",
        color: "#ffffff"
    },
    rejected: {
        background: "rgba(220,38,38,0.7)",
        color: "#ffffff"
    },

};
