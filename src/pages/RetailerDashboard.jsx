import { useEffect, useState } from "react";
import api from "../api/axios";
import RetailerLayout from "../layouts/RetailerLayout";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    RadialBarChart,
    RadialBar
} from "recharts";

export default function RetailerDashboard() {

    const roleId = localStorage.getItem("roleId");

    const [stats, setStats] = useState({
        totalReceived: 0,
        verified: 0,
        tampered: 0,
        dailySales: []
    });

    const [soldCount, setSoldCount] = useState(0);
    const [onStockCount, setOnStockCount] = useState(0);
    const [trustScore, setTrustScore] = useState(0);

    useEffect(() => {
        if (!roleId) return;

        const fetchData = async () => {
            let data;

            try {
                const res = await api.get(`/retailer/advanced-stats/${roleId}`);
                data = res.data;
            } catch (error) {
                console.log("Retailer stats fetch failed:", error);
                return;
            }

            if (!data) return;

            const total = data.totalReceived || 0;
            const verified = data.verified || 0;
            const tampered = data.tampered || 0;

            // Sold & Stock logic (safe fallback)
            const sold = data.sold || 0;
            const onStock = data.onStock || Math.max(total - sold, 0);

            setStats({
                totalReceived: total,
                verified,
                tampered,
                tamperedQuantity: data.tamperedQuantity || 0,
                dailySales: data.dailySales || []
            });

            setSoldCount(sold);
            setOnStockCount(onStock);

            // -----------------------------
            // Trust Score Fallback Logic
            // -----------------------------
            let calculatedTrust = 0;

            if (total > 0 && verified > 0) {
                const validProducts = Math.max(verified - tampered, 0);
                calculatedTrust = Math.round((validProducts / total) * 100);
            }

            setTrustScore(data.trustScore ?? calculatedTrust);
        };

        fetchData();
    }, [roleId]);

    // Safe Pie Data (avoid zero-render issue)
    const pieData =
        stats.verified + stats.tampered > 0
            ? [
                { name: "Valid", value: stats.verified },
                { name: "Tampered", value: stats.tampered }
            ]
            : [{ name: "No Data", value: 1 }];

    return (
        <RetailerLayout activeTab="overview">
            <section style={styles.page}>
                <h2 style={styles.title}>Retailer Dashboard Overview</h2>

                {/* KPI ROW */}
                <div style={styles.statsGrid}>
                    <StatCard title="Products Received" value={stats.totalReceived} integer />
                    <StatCard title="Verified Products" value={stats.verified} integer />
                    <StatCard title="Sold Products kg" value={soldCount} />
                    <StatCard title="On-Stock Products kg" value={onStockCount} />
                    <StatCard title="Tampered Products" value={stats.tampered} danger integer />
                </div>

                <div style={styles.mainRow}>
                    {/* LEFT SECTION */}
                    <div style={styles.leftSection}>
                        <div style={styles.chartCard}>
                            <h4>Sales Trend (Last 7 Days)</h4>

                            {stats.dailySales.length > 0 ? (
                                <ResponsiveContainer width="100%" height={330}>
                                    <LineChart data={stats.dailySales}>
                                        <XAxis dataKey="date" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#15803d"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={styles.noData}>
                                    No sales data available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SECTION */}
                    <div style={styles.rightSection}>
                        <div style={styles.smallRow}>

                            {/* TRUST METER */}
                            <div style={styles.centerCard}>
                                <h4 style={styles.cardTitle}>Trust Meter</h4>

                                <RadialBarChart
                                    width={180}
                                    height={150}
                                    innerRadius="70%"
                                    outerRadius="95%"
                                    startAngle={180}
                                    endAngle={0}
                                    data={[{ value: trustScore }]}
                                >
                                    <RadialBar
                                        background
                                        dataKey="value"
                                        cornerRadius={12}
                                        fill="#16a34a"
                                    />
                                    <text
                                        x="50%"
                                        y="58%"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        style={{ fontSize: 22, fontWeight: 800 }}
                                    >
                                        {trustScore}%
                                    </text>
                                </RadialBarChart>
                            </div>

                            {/* VERIFICATION OVERVIEW */}
                            <div style={styles.centerCard}>
                                <h4 style={styles.cardTitle}>Verification Overview</h4>

                                <ResponsiveContainer width="100%" height={150}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            outerRadius={65}
                                        >
                                            <Cell fill="#16a34a" />
                                            <Cell fill="#dc2626" />
                                        </Pie>
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* INVENTORY STATUS SUMMARY */}
                        <div style={styles.verifyCard}>
                            <h4>Inventory Status Summary (kg)</h4>

                            <StatusBar
                                label="Sold"
                                value={soldCount}
                                total={stats.totalReceived}
                                color="#16a34a"
                            />
                            <StatusBar
                                label="On-Stock"
                                value={onStockCount}
                                total={stats.totalReceived}
                                color="#facc15"
                            />
                            <StatusBar
                                label="Tampered Quantity"
                                value={stats.tamperedQuantity}
                                total={soldCount + onStockCount + (stats.tamperedQuantity || 0)}
                                color="#dc2626"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </RetailerLayout>
    );
}

/* KPI CARD */
function StatCard({ title, value, danger, integer }) {
    return (
        <div
            style={{
                ...styles.statCard,
                border: danger ? "2px solid #dc2626" : "2px solid #16a34a"
            }}
        >
            <span>{title}</span>
            <span style={{ fontSize: 26, fontWeight: 800 }}>
                {typeof value === "number"
                    ? integer
                        ? Math.round(value)
                        : value.toFixed(2)
                    : value}
            </span>
        </div>
    );
}

/* INVENTORY BAR */
function StatusBar({ label, value, total, color }) {
    const percent = total ? (value / total) * 100 : 0;

    return (
        <div style={{ marginTop: 12 }}>
            <div style={styles.barLabel}>
                <span>{label}</span>
                <span>{typeof value === "number" ? value.toFixed(2) : value}</span>
            </div>
            <div style={styles.barBg}>
                <div
                    style={{
                        ...styles.barFill,
                        width: `${percent}%`,
                        background: color
                    }}
                />
            </div>
        </div>
    );
}

/* STYLES */
const styles = {
    page: { padding: 14 },
    title: { marginBottom: 10, marginTop: -50, marginLeft: 20 },

    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 14,
        marginBottom: 16
    },

    statCard: {
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },

    mainRow: {
        display: "grid",
        gridTemplateColumns: "2fr 2fr",
        gap: 14
    },

    leftSection: { display: "flex", flexDirection: "column", gap: 14 },

    chartCard: {
        background: "#fff",
        borderRadius: 12,
        padding: 14,
        height: 420,
        border: "2px solid #16a34a"
    },

    rightSection: { display: "flex", flexDirection: "column", gap: 14 },

    smallRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12
    },

    centerCard: {
        background: "#fff",
        borderRadius: 12,
        height: 230,
        border: "2px solid #16a34a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },

    cardTitle: { marginBottom: 15 },

    verifyCard: {
        background: "#fff",
        borderRadius: 12,
        padding: 14,
        border: "2px solid #16a34a"
    },

    barLabel: {
        display: "flex",
        justifyContent: "space-between",
        fontWeight: 600
    },

    barBg: {
        height: 10,
        background: "#e5e7eb",
        borderRadius: 6,
        overflow: "hidden"
    },

    barFill: { height: "100%", borderRadius: 6 },

    noData: {
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }
};
