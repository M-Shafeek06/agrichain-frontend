import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TransporterSidebar from "../components/TransporterSidebar";

export default function MyTransportHistory() {
    const transporterId = localStorage.getItem("roleId");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // ✅ NEW — date filters
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    /* ================= FETCH ================= */
    useEffect(() => {
        if (!transporterId) return;

        api
            .get(`/shipments/history/${transporterId}`)
            .then((res) => setHistory(res.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [transporterId]);

    /* ================= FILTER ================= */
    const filtered = [...history]
        .reverse()
        .filter((s) => {
            const key = search.toLowerCase();

            const matchesSearch =
                (s.batchId || "").toLowerCase().includes(key) ||
                (s.cropName || "").toLowerCase().includes(key) ||
                (s.fromLocation || "").toLowerCase().includes(key) ||
                (s.toLocation || "").toLowerCase().includes(key);

            const eventDate = s.date ? new Date(s.date) : null;

            const from = fromDate
                ? new Date(fromDate + "T00:00:00")
                : null;
            const to = toDate
                ? new Date(toDate + "T23:59:59")
                : null;

            const matchesFrom = !from || (eventDate && eventDate >= from);
            const matchesTo = !to || (eventDate && eventDate <= to);

            return matchesSearch && matchesFrom && matchesTo;
        });

    /* ================= BATCH COLORS ================= */
    const batchColorMap = {};
    let colorIndex = 0;
    const batchColors = ["#b7e9cc", "#eef2ff"];

    filtered.forEach((row) => {
        if (!batchColorMap[row.batchId]) {
            batchColorMap[row.batchId] =
                batchColors[colorIndex % batchColors.length];
            colorIndex++;
        }
    });

    /* ================= GROUP BY BATCH ================= */
    const grouped = filtered.reduce((acc, item) => {
        if (!acc[item.batchId]) acc[item.batchId] = [];
        acc[item.batchId].push(item);
        return acc;
    }, {});

    const getStatusStyle = (status) => {
        if (!status) return styles.default;
        if (status.includes("DELIVERED")) return styles.delivered;
        if (status.includes("IN_TRANSIT")) return styles.transit;
        if (status.includes("PICKED")) return styles.picked;
        if (status.includes("DISTRIBUTOR")) return styles.distributor;
        return styles.default;
    };

    /* ================= CSV DOWNLOAD ================= */
    const downloadCSV = (rows) => {
        if (!rows.length) return;

        const headers = [
            "Batch ID",
            "Crop",
            "From",
            "To",
            "Event Date",
            "Distance (km)",
            "Status",
            "Integrity"
        ];

        const csv = [
            headers.join(","),
            ...rows.map((r) =>
                [
                    r.batchId,
                    r.cropName,
                    r.fromLocation,
                    r.toLocation,
                    r.date
                        ? new Date(r.date).toLocaleDateString()
                        : "",
                    r.distanceKm,
                    r.shipmentStatus,
                    r.integrityStatus
                ].join(",")
            )
        ].join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "transport-history.csv";
        a.click();

        URL.revokeObjectURL(url);
    };

    /* ================= UI ================= */

    return (
        <>
            <Navbar />

            <TransporterSidebar
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen}
            />

            <main className="dashboard-layout">
                <div className="dashboard-main">
                    <div className="dashboard-topbar">
                        <span
                            className="menu-btn"
                            onMouseEnter={() => setDrawerOpen(true)}
                        >
                            ☰
                        </span>
                    </div>

                    <section className="dashboard-content">
                        <div style={styles.page}>
                            {/* ===== HEADER ===== */}
                            <div style={styles.topRow}>
                                <h2 style={styles.title}>
                                    My Transport History
                                </h2>

                                <div style={styles.filterRow}>
                                    <div style={styles.dateGroup}>
                                        <label style={styles.label}>
                                            From
                                        </label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) =>
                                                setFromDate(e.target.value)
                                            }
                                            style={styles.date}
                                        />
                                    </div>

                                    <div style={styles.dateGroup}>
                                        <label style={styles.label}>
                                            To
                                        </label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) =>
                                                setToDate(e.target.value)
                                            }
                                            style={styles.date}
                                        />
                                    </div>

                                    <input
                                        placeholder="Search batch / crop / location"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        style={styles.search}
                                    />

                                    <button
                                        style={styles.csvBtn}
                                        onClick={() =>
                                            downloadCSV(filtered)
                                        }
                                    >
                                        Download CSV
                                    </button>
                                </div>
                            </div>

                            {/* ===== TABLE ===== */}
                            {/* ===== TIMELINE VIEW ===== */}
                            <div style={styles.card}>
                                <div style={styles.timelineContainer}>

                                    {!loading && Object.keys(grouped).length === 0 && (
                                        <div style={styles.emptyState}>
                                            No transport activity found.
                                        </div>
                                    )}

                                    {Object.entries(grouped).map(([batchId, events]) => {

                                        const sorted = [...events].sort(
                                            (a, b) => new Date(a.date) - new Date(b.date)
                                        );

                                        const latestIndex = sorted.length - 1;

                                        return (
                                            <div key={batchId} style={styles.batchCard}>

                                                {/* ===== BATCH HEADER ===== */}
                                                <div style={styles.batchHeader}>
                                                    📦 {batchId}
                                                </div>

                                                {/* ===== TIMELINE ===== */}
                                                <div style={styles.timeline}>

                                                    {sorted.map((e, i) => {

                                                        const isLatest = i === latestIndex;

                                                        return (
                                                            <div key={i} style={styles.timelineItem}>

                                                                {/* LEFT SIDE (DOT + LINE) */}
                                                                <div style={styles.timelineLeft}>
                                                                    <div
                                                                        style={{
                                                                            ...styles.dot,
                                                                            ...(isLatest && styles.activeDot)
                                                                        }}
                                                                    />
                                                                    {i !== latestIndex && (
                                                                        <div style={styles.line}></div>
                                                                    )}
                                                                </div>

                                                                {/* RIGHT CONTENT */}
                                                                <div
                                                                    style={{
                                                                        ...styles.timelineContent,
                                                                        ...(isLatest && styles.activeCard)
                                                                    }}
                                                                >

                                                                    {/* STATUS + INTEGRITY */}
                                                                    <div style={styles.statusRow}>
                                                                        <span
                                                                            style={{
                                                                                ...styles.badge,
                                                                                ...getStatusStyle(e.shipmentStatus)
                                                                            }}
                                                                        >
                                                                            {e.shipmentStatus?.replace("_", " ")}
                                                                        </span>

                                                                        <span style={styles.role}>
                                                                            {e.integrityStatus === "TAMPERED"
                                                                                ? "⚠️ Tampered"
                                                                                : "Safe"}
                                                                        </span>
                                                                    </div>

                                                                    {/* MAIN INFO */}
                                                                    <div style={styles.meta}>
                                                                        {e.cropName || "—"} • Qty: {e.quantity || 0}
                                                                    </div>

                                                                    {/* ROUTE */}
                                                                    <div style={styles.subMeta}>
                                                                        {e.fromLocation || "—"} → {e.toLocation || "—"}
                                                                    </div>

                                                                    {/* DISTANCE */}
                                                                    <div style={styles.subMeta}>
                                                                        Distance:{" "}
                                                                        {typeof e.distanceKm === "number"
                                                                            ? e.distanceKm.toFixed(2)
                                                                            : "—"} km
                                                                    </div>

                                                                    {/* TIME */}
                                                                    <div style={styles.time}>
                                                                        {e.date
                                                                            ? new Date(e.date).toLocaleString()
                                                                            : "—"}
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                </div>
                                            </div>
                                        );
                                    })}

                                    {loading && <p style={{ padding: 10 }}>Loading…</p>}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

/* ================= STYLES ================= */
const styles = {
    /* ===== PAGE LAYOUT ===== */
    page: {
        padding: "12px 40px",
        marginTop: "-70px"
    },

    topRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
    },

    title: {
        margin: 0,
        fontSize: 20,
        fontWeight: 700
    },

    /* ===== FILTER BAR ===== */
    filterRow: {
        display: "flex",
        gap: 10,
        alignItems: "flex-end"
    },

    dateGroup: {
        display: "flex",
        flexDirection: "column",
        gap: 2
    },

    label: {
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

    search: {
        width: 220,
        padding: "6px 10px",
        border: "1px solid #d1d5db",
        borderRadius: 6,
        fontSize: 13
    },

    csvBtn: {
        padding: "6px 12px",
        borderRadius: 6,
        border: "1px solid #16a34a",
        background: "#ecfdf5",
        color: "#166534",
        fontSize: 12,
        cursor: "pointer",
        fontWeight: 600
    },

    /* ===== CARD CONTAINER ===== */
    card: {
        background: "#ffffff",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        padding: 10,
        height: 520,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    },

    timelineContainer: {
        maxHeight: "470px",
        overflowY: "auto",
        padding: 6
    },

    emptyState: {
        textAlign: "center",
        padding: "60px",
        color: "#64748b"
    },

    /* ===== BATCH CARD ===== */
    batchCard: {
        background: "#ffffff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 14,
        border: "1px solid #e5e7eb"
    },

    batchHeader: {
        fontWeight: 600,
        marginBottom: 12,
        color: "#0f172a"
    },

    /* ===== TIMELINE ===== */
    timeline: {
        marginTop: 4
    },

    timelineItem: {
        display: "flex",
        marginBottom: 18
    },

    timelineLeft: {
        width: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },

    dot: {
        width: 10,
        height: 10,
        background: "#94a3b8",
        borderRadius: "50%"
    },

    activeDot: {
        background: "#16a34a",
        transform: "scale(1.2)"
    },

    line: {
        width: 2,
        flex: 1,
        background: "#e2e8f0",
        marginTop: 2
    },

    /* ===== TIMELINE CONTENT ===== */
    timelineContent: {
        flex: 1,
        background: "#f8fafc",
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid #e2e8f0"
    },

    activeCard: {
        border: "1px solid #16a34a",
        background: "#ecfdf5"
    },

    statusRow: {
        display: "flex",
        justifyContent: "space-between"
    },

    meta: {
        fontSize: 12,
        marginTop: 4,
        color: "#475569",
        fontWeight: 500
    },

    subMeta: {
        fontSize: 11,
        color: "#64748b",
        marginTop: 2
    },

    time: {
        fontSize: 11,
        marginTop: 4,
        color: "#94a3b8"
    },

    role: {
        fontSize: 11,
        color: "#64748b",
        fontWeight: 500
    },

    /* ===== BADGES ===== */
    badge: {
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600
    },

    delivered: { background: "#dcfce7", color: "#166534" },
    transit: { background: "#e0f2fe", color: "#0369a1" },
    picked: { background: "#fef3c7", color: "#92400e" },
    distributor: { background: "#ede9fe", color: "#5b21b6" },
    default: { background: "#e5e7eb", color: "#374151" }
};