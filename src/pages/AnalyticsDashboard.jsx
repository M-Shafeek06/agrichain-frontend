import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import api from "../api/axios";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LabelList
} from "recharts";

export default function AnalyticsDashboard({ embedded = false }) {
    const location = useLocation();
    const navigate = useNavigate();
    const isEmbedded = embedded === true;

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalBatches: 0,
        verifiedBatches: 0,
        tamperedBatches: 0,
        rejectedBatches: 0,
        averageIntegrityScore: 0,
        monthlyStats: [],
        recentActivities: [],
        roleDistribution: []
    });

    const [trustBoard, setTrustBoard] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);

    /* ================= LOAD DASHBOARD ================= */
    useEffect(() => {
        let mounted = true;

        const loadDashboard = async () => {
            try {
                const statsRes = await api.get("/dashboard/stats");
                const trustRes = await api.get("/admin/trust-leaderboard");
                const integrityRes = await api.get("/average-integrity");

                if (!mounted) return;

                const d = statsRes.data || {};

                const avgIntegrity =
                    Number(integrityRes?.data?.averageIntegrityScore) || 0;

                setPendingCount(Number(d.pendingBatches) || 0);

                setStats({
                    totalBatches: Number(d.totalBatches) || 0,
                    verifiedBatches: Number(d.verifiedBatches) || 0,
                    tamperedBatches: Number(d.tamperedBatches) || 0,
                    rejectedBatches: Number(d.rejectedBatches) || 0,

                    // ✅ IMPORTANT FIX
                    averageIntegrityScore: avgIntegrity,

                    monthlyStats: Array.isArray(d.monthlyStats)
                        ? d.monthlyStats
                        : [],
                    roleDistribution: Array.isArray(d.roleDistribution)
                        ? d.roleDistribution
                        : [],
                    recentActivities: Array.isArray(d.recentActivities)
                        ? d.recentActivities.slice(0, 3)
                        : []
                });

                setTrustBoard(
                    Array.isArray(trustRes.data) ? trustRes.data : []
                );

            } catch (err) {
                console.error("Dashboard load failed", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadDashboard();

        return () => {
            mounted = false;
        };
    }, [location.pathname]);


    /* ================= HELPERS ================= */

    const COLORS = [
        "#16a34a", // green
        "#2563eb", // blue
        "#f59e0b", // amber
        "#dc2626", // red
        "#7c3aed", // purple
        "#0891b2", // cyan
        "#ea580c", // orange
        "#db2777"  // pink
    ];

    const formatStatus = (s) => {
        if (!s) return "NA";
        const v = s.toLowerCase();
        if (v.includes("delivered")) return "Sold";
        if (v.includes("received")) return "Available";
        return v.charAt(0).toUpperCase() + v.slice(1);
    };

    /* ================= TRUST LEADERBOARD ================= */

    const mergedTrustBoard = useMemo(() => {
        return Object.values(
            trustBoard.reduce((acc, item) => {
                if (!item?.roleId) return acc;

                if (!acc[item.roleId]) {
                    acc[item.roleId] = item;
                }

                return acc;
            }, {})
        );
    }, [trustBoard]);

    const topTrustBoard = useMemo(() => {
        return [...mergedTrustBoard]
            .sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0))
            .slice(0, 5);
    }, [mergedTrustBoard]);

    const normalizedMonthlyStats = useMemo(() => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        const currentMonthIndex = new Date().getMonth();

        const visibleMonths = [
            months[currentMonthIndex],
            months[(currentMonthIndex + 1) % 12],
            months[(currentMonthIndex + 2) % 12],
            months[(currentMonthIndex + 3) % 12]
        ];

        const statsMap = {};
        stats.monthlyStats.forEach(m => {
            statsMap[m.month] = m.count;
        });

        return visibleMonths.map(month => ({
            month,
            count: statsMap[month] || 0
        }));
    }, [stats.monthlyStats]);

    /* ================= DASHBOARD CONTENT ================= */

    const DashboardContent = () => (
        <main style={styles.container}>
            {!isEmbedded && (
                <div style={styles.header}>
                    <div
                        style={styles.hamburger}
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        onMouseEnter={() => setDrawerOpen(true)}
                    >
                        <div style={styles.hamLine} />
                        <div style={styles.hamLine} />
                        <div style={styles.hamLine} />
                    </div>
                    <h2>Admin Dashboard</h2>
                </div>
            )}

            {!loading && (
                <>
                    {/* KPI ROW */}
                    <div style={styles.kpiRow}>
                        <Kpi title="Total Batches" value={stats.totalBatches} variant="total" />
                        <Kpi title="Verified" value={stats.verifiedBatches} variant="verified" />
                        <Kpi title="Tampered" value={stats.tamperedBatches} variant="tampered" />
                        <Kpi title="Rejected" value={stats.rejectedBatches} variant="rejected" />
                        <Kpi
                            title="Avg Integrity"
                            value={`${stats.averageIntegrityScore}%`}
                            variant="integrity"
                        />

                        <div style={styles.alertCard}>
                            <h3 style={{ fontSize: 14, marginBottom: 6 }}>
                                System Alerts
                            </h3>

                            {stats.tamperedBatches === 0 && stats.rejectedBatches === 0 && pendingCount === 0 ? (
                                <p>No Critical Alerts</p>
                            ) : (
                                <>
                                    {stats.tamperedBatches > 0 && (
                                        <p style={{ color: "#b91c1c", fontWeight: 600, fontSize: 13, margin: "2px 0" }}>
                                            {stats.tamperedBatches} tampered batches detected
                                        </p>
                                    )}

                                    {stats.rejectedBatches > 0 && (
                                        <p style={{ color: "#b45309", fontWeight: 500, fontSize: 13, margin: "2px 0" }}>
                                            {stats.rejectedBatches} rejected batches present
                                        </p>
                                    )}

                                    {pendingCount > 0 && (
                                        <p style={{ color: "#92400e", fontWeight: 500, fontSize: 13, margin: "2px 0" }}>
                                            {pendingCount} produce yet to verify
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div style={styles.mainGrid}>
                        {/* RECENT ACTIVITY */}
                        <div style={{ ...styles.card, gridColumn: "span 3" }}>
                            <h4>Recent Activity Timeline</h4>

                            <div style={styles.tableHeader}>
                                <span>Batch ID</span>
                                <span>Handler</span>
                                <span>Status</span>
                            </div>

                            {stats.recentActivities.length === 0 && (
                                <p style={{ padding: 8, color: "#6b7280" }}>
                                    No recent activity
                                </p>
                            )}

                            {stats.recentActivities.map((a, i) => (
                                <div key={i} style={styles.tableRow}>
                                    <span>{a.batchId}</span>
                                    <span>{a.handlerName || "—"}</span>
                                    <span>{formatStatus(a.status)}</span>
                                </div>
                            ))}

                            <p
                                style={{ cursor: "pointer", color: "#2563eb", fontSize: 13 }}
                                onClick={() => navigate("/admin/activity")}
                            >
                                See full activity →
                            </p>
                        </div>

                        {/* MONTHLY BATCHES */}
                        <div style={{ ...styles.card, gridColumn: "span 3" }}>
                            <h4>Batches Created Per Month</h4>

                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart
                                    data={normalizedMonthlyStats}
                                    barCategoryGap="30%"
                                    margin={{ top: 10, right: 10, left: 0, bottom: -10 }} // 🔥 THIS LINE
                                >
                                    <XAxis dataKey="month" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#3b82f6">
                                        <LabelList
                                            dataKey="count"
                                            position="top"
                                            style={{ fontSize: 12, fontWeight: 600 }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* USER ROLES */}
                        <div style={{ ...styles.card, gridColumn: "span 3" }}>
                            <h4>User Roles</h4>

                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={stats.roleDistribution}
                                        dataKey="count"
                                        nameKey="role"
                                        outerRadius={70}
                                        label={({ percent, count }) =>
                                            `${Math.round(percent * 100)}% (${count})`
                                        }
                                    >
                                        {stats.roleDistribution.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend formatter={(v) => v.charAt(0)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* TRUST LEADERBOARD */}
                        <div style={{ ...styles.card, gridColumn: "span 3" }}>
                            <h4>Trust Leaderboard (Top 5)</h4>

                            {topTrustBoard.map((item, index) => (
                                <div key={item.roleId} style={styles.trustRow}>
                                    <span>{index + 1}</span>
                                    <span>
                                        {(item.name || item.entityName)} ({item.role.charAt(0)})
                                    </span>
                                    <span style={{ fontWeight: index === 0 ? 700 : 500 }}>
                                        {item.trustScore}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </main>
    );

    if (isEmbedded) return <DashboardContent />;

    return (
        <>
            <Navbar />
            <AdminSidebar open={drawerOpen} setOpen={setDrawerOpen} />
            <DashboardContent />
        </>
    );
}

/* ================= KPI ================= */

function Kpi({ title, value, variant = "default" }) {

    const variantStyles = {
        total: {
            background: "linear-gradient(135deg, #e0f2fe, #f0f9ff)",
            border: "1px solid #bae6fd"
        },
        verified: {
            background: "linear-gradient(135deg, #dcfce7, #f0fdf4)",
            border: "1px solid #86efac"
        },
        tampered: {
            background: "linear-gradient(135deg, #fee2e2, #fff1f2)",
            border: "1px solid #fca5a5"
        },
        rejected: {
            background: "linear-gradient(135deg, #fef3c7, #fff7ed)",
            border: "1px solid #fcd34d"
        },
        integrity: {
            background: "linear-gradient(135deg, #e0e7ff, #eef2ff)",
            border: "1px solid #c7d2fe"
        },
        default: {
            background: "#ffffff",
            border: "1px solid #e5e7eb"
        }
    };

    const selected = variantStyles[variant] || variantStyles.default;

    return (
        <div
            style={{
                ...styles.kpiCard,
                background: selected.background,
                border: selected.border
            }}
        >
            <h3 style={{ fontWeight: 500, fontSize: 13, color: "#64748b" }}>
                {title}
            </h3>
            <h2 style={{ fontWeight: 700, fontSize: 22 }}>
                {value}
            </h2>
        </div>
    );
}

/* ================= STYLES ================= */

const styles = {
    container: {
        padding: 20,
        background: "linear-gradient(to bottom, #f8fafc, #eef2f7)",
        minHeight: "100vh"
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: 10
    },
    hamburger: {
        display: "flex",
        flexDirection: "column",
        gap: 5,
        cursor: "pointer",
        padding: 6
    },
    hamLine: {
        width: 20,
        height: 3,
        background: "#374151"
    },
    kpiRow: {
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 10
    },
    kpiCard: {
        background: "#fff",
        borderRadius: 12,
        padding: 12,
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)" // 🔥 add this
    },
    alertCard: {
        background: "linear-gradient(135deg, #fef3c7, #fff7ed)",
        border: "1px solid #fcd34d",
        borderRadius: 10,
        padding: "10px 12px",   // 🔽 reduced
        textAlign: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        lineHeight: 1.4        // 🔽 tighter spacing
    },
    mainGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 10,
        marginTop: 12
    },
    card: {
        background: "#ffffff",
        padding: 14,                 // ⬅️ reduced from 16 (height reduced)
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        transition: "all 0.2s ease"
    },
    tableHeader: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        fontWeight: 600,
        padding: "10px 0",
        color: "#475569",
        borderBottom: "2px solid #e2e8f0"
    },
    tableRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        padding: "10px 0",
        borderBottom: "1px solid #f1f5f9",
        fontSize: 14
    },
    trustRow: {
        display: "grid",
        gridTemplateColumns: "30px 1fr 60px",
        padding: "10px 0",
        borderBottom: "1px solid #f1f5f9",
        alignItems: "center",
        fontSize: 14
    }
};
