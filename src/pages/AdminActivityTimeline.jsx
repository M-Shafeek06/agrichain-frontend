import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api/axios";

export default function AdminActivityTimeline() {

    const [activities, setActivities] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            const res = await api.get("/admin/activity-timeline");
            setActivities(res.data || []);
        } catch (err) {
            console.error("Failed loading activities", err);
        }
    };

    /* ================= FILTER ================= */
    const filteredActivities = activities.filter(a =>
        a.batchId?.toLowerCase().includes(search.toLowerCase()) ||
        a.roleId?.toLowerCase().includes(search.toLowerCase()) ||
        a.roleName?.toLowerCase().includes(search.toLowerCase()) ||
        a.location?.toLowerCase().includes(search.toLowerCase())
    );

    /* ================= GROUP BY BATCH ================= */
    const grouped = filteredActivities.reduce((acc, item) => {
        if (!acc[item.batchId]) acc[item.batchId] = [];
        acc[item.batchId].push(item);
        return acc;
    }, {});

    /* ================= STATUS COLORS ================= */
    const getStatusStyle = (status) => {
        if (!status) return styles.default;
        if (status.includes("SOLD")) return styles.sold;
        if (status.includes("DELIVERED")) return styles.delivered;
        if (status.includes("IN_TRANSIT")) return styles.transit;
        if (status.includes("PICKED")) return styles.picked;
        if (status.includes("CREATED")) return styles.created;
        return styles.default;
    };

    const downloadCSV = () => {

        if (filteredActivities.length === 0) {
            alert("No data to download");
            return;
        }

        const headers = [
            "Batch ID",
            "Name",
            "Role",
            "Role ID",
            "Status",
            "Location",
            "Contact",
            "Time"
        ];

        const rows = filteredActivities.map(a => [
            a.batchId,
            a.name || "",
            a.roleName || "",
            a.roleId || "",
            a.status || "",
            a.location || "",
            a.contact || "",
            new Date(a.time).toLocaleString()
        ]);

        const csvContent =
            [headers, ...rows]
                .map(row => row.join(","))
                .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "activity_timeline.csv";
        link.click();

        window.URL.revokeObjectURL(url);
    };

    return (
        <AdminLayout>

            <main style={styles.container}>

                <h2 style={styles.title}>System Activity Timeline</h2>

                <div style={styles.topBar}>
                    <input
                        type="text"
                        placeholder="Search batch, role ID, role, location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={styles.searchInput}
                    />

                    <button onClick={downloadCSV} style={styles.downloadBtn}>
                        ⬇ Download
                    </button>
                </div>

                <div style={styles.card}>

                    <div style={styles.timelineContainer}>

                        {Object.keys(grouped).length === 0 ? (
                            <div style={styles.emptyState}>
                                No recent system activity available.
                            </div>
                        ) : (

                            Object.entries(grouped).map(([batchId, events]) => {

                                const sorted = events.sort(
                                    (a, b) => new Date(a.time) - new Date(b.time)
                                );

                                const latestIndex = sorted.length - 1;

                                return (
                                    <div key={batchId} style={styles.batchCard}>

                                        {/* Batch Header */}
                                        <div style={styles.batchHeader}>
                                            📦 {batchId}
                                        </div>

                                        {/* Timeline */}
                                        <div style={styles.timeline}>

                                            {sorted.map((e, i) => {

                                                const isLatest = i === latestIndex;

                                                return (
                                                    <div key={i} style={styles.timelineItem}>

                                                        {/* LEFT LINE */}
                                                        <div style={styles.timelineLeft}>
                                                            <div style={{
                                                                ...styles.dot,
                                                                ...(isLatest && styles.activeDot)
                                                            }} />
                                                            {i !== latestIndex && (
                                                                <div style={styles.line}></div>
                                                            )}
                                                        </div>

                                                        {/* CONTENT */}
                                                        <div style={{
                                                            ...styles.timelineContent,
                                                            ...(isLatest && styles.activeCard)
                                                        }}>

                                                            <div style={styles.statusRow}>

                                                                <span style={{
                                                                    ...styles.badge,
                                                                    ...getStatusStyle(e.status)
                                                                }}>
                                                                    {e.status}
                                                                </span>

                                                                <span style={styles.role}>
                                                                    {e.roleName}
                                                                </span>

                                                            </div>

                                                            <div style={styles.meta}>
                                                                {e.name} ({e.roleId})
                                                            </div>

                                                            <div style={styles.subMeta}>
                                                                {e.location} • {e.contact}
                                                            </div>

                                                            <div style={styles.time}>
                                                                {new Date(e.time).toLocaleString()}
                                                            </div>

                                                        </div>

                                                    </div>
                                                );
                                            })}

                                        </div>

                                    </div>
                                );
                            })
                        )}

                    </div>

                </div>

            </main>

        </AdminLayout>
    );
}

/* ================= STYLES ================= */

const styles = {

    container: {
        padding: "0px 18px 18px",
        marginTop: -38,
        background: "linear-gradient(to bottom,#f8fafc,#eef2f7)",
        minHeight: "100vh"
    },

    title: {
        marginBottom: 10,
        fontWeight: 700,
        fontSize: 20,
        color: "#1e293b"
    },

    card: {
        background: "#ffffff",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        padding: 10,
        height: 520,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
    },

    searchBox: {
        marginBottom: 10
    },

    searchInput: {
        width: 300,
        padding: "7px 10px",
        borderRadius: 6,
        border: "1px solid #cbd5e1",
        fontSize: 13
    },

    emptyState: {
        textAlign: "center",
        padding: "60px",
        color: "#64748b"
    },

    timelineContainer: {
        maxHeight: "470px",
        overflowY: "auto",
        padding: 6
    },

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

    subMeta: {
        fontSize: 11,
        color: "#64748b",
        marginTop: 2
    },

    line: {
        width: 2,
        flex: 1,
        background: "#e2e8f0",
        marginTop: 2
    },

    topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
    },

    downloadBtn: {
        padding: "7px 14px",
        background: "#16a34a",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600
    },

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

    role: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: 500
    },

    meta: {
        fontSize: 12,
        marginTop: 4,
        color: "#475569"
    },

    time: {
        fontSize: 11,
        marginTop: 4,
        color: "#94a3b8"
    },

    badge: {
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600
    },

    created: { background: "#dbeafe", color: "#1d4ed8" },
    picked: { background: "#fef3c7", color: "#92400e" },
    transit: { background: "#e0f2fe", color: "#0369a1" },
    delivered: { background: "#dcfce7", color: "#166534" },
    sold: { background: "#ede9fe", color: "#5b21b6" },
    default: { background: "#e5e7eb", color: "#374151" }
};