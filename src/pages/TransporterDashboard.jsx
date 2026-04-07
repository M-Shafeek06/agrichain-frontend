import { useState, useEffect } from "react";
import "./FarmerDashboard.css";

import Navbar from "../components/Navbar";
import transporterAvatar from "../assets/transporter.png";
import api from "../api/axios";
import TransporterUpdate from "./TransporterUpdate";

import { useNavigate, useLocation } from "react-router-dom";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    LineChart,
    Line,
    ResponsiveContainer
} from "recharts";

export default function TransporterDashboard() {

    const navigate = useNavigate();
    const location = useLocation();

    const transporterName = localStorage.getItem("roleName");
    const transporterId = localStorage.getItem("roleId");

    const [drawerOpen, setDrawerOpen] = useState(false);

    const [activeTab, setActiveTab] = useState(
        location.state?.tab || "overview"
    );

    const [stats, setStats] = useState({
        active: 0,
        verified: 0,
        tampered: 0,
        distance: 0
    });

    const [analytics, setAnalytics] = useState({
        stageCount: {},
        deliveryTrend: [],
        topRoutes: []
    });

    const [recentShipments, setRecentShipments] = useState([]);

    const isActive = (path) => location.pathname === path;

    /* ================= DASHBOARD DATA ================= */

    useEffect(() => {

        if (!transporterId) return;

        const fetchAll = async () => {
            try {

                const statsRes = await api.get(`/shipments/transporter/stats/${transporterId}`);
                setStats(statsRes.data);

                const analyticsRes = await api.get(`/shipments/transporter/analytics/${transporterId}`);
                setAnalytics(analyticsRes.data);

                const liveRes = await api.get(`/shipments/transporter-live/${transporterId}`);
                setRecentShipments(liveRes.data || []);

            } catch (err) {
                console.log("Dashboard fetch error", err);
            }
        };

        fetchAll();

        const interval = setInterval(fetchAll, 5000);
        return () => clearInterval(interval);

    }, [transporterId]);

    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab);
        }
    }, [location.state]);

    const activeRoutes = recentShipments || [];

    return (
        <>
            <Navbar />

            <aside
                className={`drawer-panel ${drawerOpen ? "open" : ""}`}
                onMouseLeave={() => setDrawerOpen(false)}
            >
                <div className="drawer-profile">
                    <div className="avatar-wrap">
                        <img src={transporterAvatar} alt="transporter" />
                    </div>
                    <div>
                        <div>{transporterName}</div>
                        <div className="drawer-id">ID: {transporterId}</div>
                    </div>
                </div>

                <ul className="drawer-nav">
                    <li
                        className={activeTab === "overview" ? "nav-item active" : "nav-item"}
                        onClick={() => {
                            setActiveTab("overview");
                            setDrawerOpen(false);
                        }}
                    >
                        Dashboard Overview
                    </li>

                    <li
                        className={
                            isActive("/transporter/shipments")
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() => {
                            navigate("/transporter/shipments");
                            setDrawerOpen(false);
                        }}
                    >
                        Assigned Shipments
                    </li>


                    <li
                        className={activeTab === "update" ? "nav-item active" : "nav-item"}
                        onClick={() => {
                            setActiveTab("update");
                            setDrawerOpen(false);
                        }}
                    >
                        Update Shipment Status
                    </li>

                    <li
                        className={
                            location.pathname === "/transporter/history"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() => {
                            setDrawerOpen(false);
                            navigate("/transporter/history");
                        }}
                    >
                        My Transport History
                    </li>

                    <li
                        className={
                            location.pathname === "/transporter/upload-invoice"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() => {
                            setDrawerOpen(false);
                            navigate("/transporter/upload-invoice");
                        }}
                    >
                        Upload Invoice
                    </li>

                    <li
                        className={
                            location.pathname === "/transporter/invoice-history"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() => {
                            setDrawerOpen(false);
                            navigate("/transporter/invoice-history");
                        }}
                    >
                        Invoice History
                    </li>

                    {/* 🔥 NEW — TRANSPORTER PROFILE SETTINGS */}
                    <li
                        className="nav-item"
                        onClick={() => {
                            setDrawerOpen(false);
                            navigate("/transporter/profile");
                        }}
                    >
                        Profile Settings
                    </li>

                    {/* 🔥 NEW — TRANSPORTER SUPPORT */}
                    <li
                        className="nav-item"
                        onClick={() => {
                            setDrawerOpen(false);
                            navigate("/transporter/support");
                        }}
                    >
                        Support
                    </li>

                    <li
                        className="logout-item logout-btn"
                        style={{ marginTop: "200px" }}   // adjust value as needed
                        onClick={() => {
                            if (!window.confirm("Do you want to logout?")) return;
                            localStorage.clear();
                            navigate("/auth");
                        }}
                    >
                        LOG OUT
                    </li>
                </ul>
            </aside>

            <main className="dashboard-layout">
                <div className="dashboard-main">
                    <div className="dashboard-topbar">
                        <span className="menu-btn" onMouseEnter={() => setDrawerOpen(true)}>☰</span>
                    </div>

                    <section className="dashboard-content">
                        <div className={`tab-page ${activeTab === "overview" ? "show" : "hide"}`}>
                            <h2 style={{ marginBottom: 20, transform: "translateY(-60px)" }}>
                                Transporter Dashboard Overview
                            </h2>

                            <div style={styles.statGrid}>
                                <StatCard title="Active Shipments" value={stats.active} />
                                <StatCard title="Verified Loads" value={stats.verified} />
                                <StatCard title="Tampered Loads" value={stats.tampered} danger />

                                <div style={styles.mapColumn}>
                                    <div style={styles.mapCard}>
                                        <h4 style={styles.mapTitle}>Live Routes In Progress</h4>

                                        <div style={styles.mapBody}>
                                            <div style={{ flex: 1, overflowY: "auto", marginTop: 8 }}>

                                                {activeRoutes.length === 0 && (
                                                    <p style={{ fontSize: 13, color: "#6b7280" }}>
                                                        No active routes currently
                                                    </p>
                                                )}

                                                {activeRoutes.map((shipment) => {

                                                    return (
                                                        <div
                                                            key={`${shipment.batchId}-${shipment.createdAt}`}
                                                            style={styles.routeRow}
                                                        >
                                                            <div>
                                                                <div style={styles.routeName}>
                                                                    {shipment.cropName || "Unknown Crop"}
                                                                </div>

                                                                <div style={styles.routeMeta}>
                                                                    📍 {shipment.location || "Unknown Location"}
                                                                </div>

                                                                <div style={styles.routeMeta}>
                                                                    Batch: {shipment.batchId || "N/A"}
                                                                </div>

                                                                <div style={styles.routeMeta}>
                                                                    Session: {shipment.shipmentSessionId || "N/A"}
                                                                </div>

                                                                <div style={styles.routeMeta}>
                                                                    Weight: {shipment.shipmentQuantity || 0} kg
                                                                </div>
                                                            </div>

                                                            <span
                                                                style={{
                                                                    ...styles.statusBadge,
                                                                    background:
                                                                        shipment.status === "IN_TRANSIT"
                                                                            ? "#fef9c3"
                                                                            : shipment.status === "PICKED_UP"
                                                                                ? "#dcfce7"
                                                                                : "#e5e7eb",
                                                                    color:
                                                                        shipment.status === "IN_TRANSIT"
                                                                            ? "#854d0e"
                                                                            : shipment.status === "PICKED_UP"
                                                                                ? "#065f46"
                                                                                : "#374151"
                                                                }}
                                                            >
                                                                {shipment.status
                                                                    ? shipment.status.replace("_", " ")
                                                                    : "UNKNOWN"}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ ...styles.statLikeCard, gridColumn: "2", gridRow: "2" }}>
                                    <span style={styles.cardTitle}>Distance Covered (km)</span>
                                    <h1 style={styles.cardMainValue}>{stats.distance}</h1>
                                </div>

                                {analytics && (
                                    <div style={styles.statLikeCard}>
                                        <span style={styles.cardTitle}>Avg Delivery Time</span>
                                        <h1 style={styles.cardMainValue}>{analytics.avgDelivery} hrs</h1>
                                    </div>
                                )}

                                {/* PIE */}
                                {analytics && (
                                    <div style={{ ...styles.analyticCard, gridColumn: "2", gridRow: 3 }}>
                                        <h4 style={styles.mapTitle}>Stage Distribution</h4>

                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: "Picked", value: analytics?.stageCount?.PICKED_UP ?? 0 },
                                                        { name: "Transit", value: analytics?.stageCount?.IN_TRANSIT ?? 0 },
                                                        { name: "At Distributor", value: analytics?.stageCount?.AT_DISTRIBUTOR ?? 0 },
                                                        { name: "Delivered", value: analytics?.stageCount?.DELIVERED ?? 0 } // 🔥 added
                                                    ]}
                                                    dataKey="value"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={80}
                                                    paddingAngle={3}
                                                    labelLine={false}
                                                    label={({ value }) => value}
                                                >
                                                    <Cell fill="#10b981" />
                                                    <Cell fill="#facc15" />
                                                    <Cell fill="#22c55e" />
                                                    <Cell fill="#3b82f6" />
                                                </Pie>

                                                {/* CENTER TOTAL */}
                                                {/* CENTER TOTAL */}
                                                <text
                                                    x="50%"
                                                    y="50%"
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 800,
                                                        fill: "#065f46"
                                                    }}
                                                >
                                                    {
                                                        (
                                                            (analytics?.stageCount?.PICKED_UP ?? 0) +
                                                            (analytics?.stageCount?.IN_TRANSIT ?? 0) +
                                                            (analytics?.stageCount?.AT_DISTRIBUTOR ?? 0) +
                                                            (analytics?.stageCount?.DELIVERED ?? 0)
                                                        ) + " Loads"
                                                    }
                                                </text>

                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                                {/* VERIFIED vs TAMPERED */}
                                {analytics && (
                                    <div style={{ ...styles.analyticCard, gridColumn: "1", gridRow: 3 }}>
                                        <h4 style={styles.mapTitle}>Load Verification</h4>

                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={[
                                                    { name: "Verified", value: stats.verified, fill: "#10b981" },
                                                    { name: "Tampered", value: stats.tampered, fill: "#dc2626" }
                                                ]}
                                                barCategoryGap={32}
                                            >
                                                <XAxis dataKey="name" tick={{ fill: "#374151", fontSize: 12 }} />
                                                <YAxis hide />
                                                <Tooltip />

                                                <Bar dataKey="value">
                                                    {[
                                                        { name: "Verified", fill: "#10b981" },
                                                        { name: "Tampered", fill: "#dc2626" }
                                                    ].map((entry, index) => (
                                                        <Cell key={index} fill={entry.fill} />
                                                    ))}
                                                </Bar>

                                                {/* Numbers inside bars */}
                                                <text
                                                    x="25%"
                                                    y="50%"
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fill="#ffffff"
                                                    fontSize={14}
                                                    fontWeight={700}
                                                >
                                                    {stats.verified}
                                                </text>
                                                <text
                                                    x="75%"
                                                    y="50%"
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fill="#ffffff"
                                                    fontSize={14}
                                                    fontWeight={700}
                                                >
                                                    {stats.tampered}
                                                </text>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* DELIVERY TREND */}
                                {analytics?.deliveryTrend && (
                                    <div style={{ ...styles.analyticCard, gridColumn: "3", gridRow: 3 }}>
                                        <h4 style={styles.mapTitle}>Delivery Trend</h4>
                                        <ResponsiveContainer width="100%" height={150}>
                                            <LineChart data={analytics.deliveryTrend}>
                                                <XAxis dataKey="week" />
                                                <YAxis />
                                                <Tooltip />
                                                <Line dataKey="avgHours" stroke="#10b981" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {analytics && (
                                    <div style={{ ...styles.analyticCard, gridColumn: "3", gridRow: "2 / span 2" }}>
                                        <h4 style={styles.mapTitle}>Top Routes Ranking</h4>

                                        <div style={{ flex: 1, overflowY: "auto", marginTop: 8 }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                                <thead>
                                                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                                        <th align="left">Route</th>
                                                        <th align="right">Trips</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {analytics?.topRoutes?.map((r, i) => (
                                                        <tr key={i}>
                                                            <td>
                                                                <span style={{
                                                                    background: "#ecfdf5",
                                                                    color: "#047857",
                                                                    fontSize: 11,
                                                                    fontWeight: 700,
                                                                    padding: "2px 6px",
                                                                    borderRadius: 6,
                                                                    marginRight: 6
                                                                }}>
                                                                    #{i + 1}
                                                                </span>
                                                                {r[0]}
                                                            </td>
                                                            <td align="right" style={{ fontWeight: 700 }}>{r[1]}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={`tab-page ${activeTab === "update" ? "show" : "hide"}`}>
                            <TransporterUpdate embed />
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

function StatCard({ title, value, danger, trend }) {
    return (
        <div style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: "12px 20px",
            minHeight: 75,
            boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
            borderLeft: danger ? "5px solid #dc2626" : "5px solid #10b981",
            borderRight: danger ? "5px solid #dc2626" : "5px solid #10b981",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center"
        }}>
            <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: 0.6
            }}>
                {title}
            </span>

            <span style={{
                fontSize: 30,
                fontWeight: 800,
                color: danger ? "#dc2626" : "#047857"
            }}>
                {value}
            </span>

            {trend && (
                <span style={{
                    fontSize: 11,
                    marginTop: 2,
                    color: trend > 0 ? "#059669" : "#dc2626",
                    fontWeight: 600
                }}>
                    {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% this week
                </span>
            )}
        </div>
    );
}


const styles = {
    statGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",   // was 4
        gridTemplateRows: "repeat(3, minmax(125px, auto))",
        gap: 20,
        alignItems: "stretch",
        marginTop: -50
    },

    routeRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 8px",
        borderBottom: "1px solid #f1f5f9"
    },

    routeName: {
        fontSize: 13,
        fontWeight: 700,
        color: "#111827"
    },

    routeMeta: {
        fontSize: 11,
        color: "#6b7280",
        marginTop: 2
    },

    statusBadge: {
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 8px",
        borderRadius: 20,
        textTransform: "capitalize"
    },

    mapColumn: {
        gridColumn: "4 / span 2",   // was "5"
        gridRow: "1 / span 3",
        height: "100%",
        maxHeight: 520,
        alignSelf: "stretch"
    },

    mapBody: {
        flex: 1,
        height: "100%",          // 🔑 ensures Leaflet gets a real height
        minHeight: 320,          // 🔑 prevents 0 / -1 height issue
        borderRadius: 8,
        overflow: "hidden",
        marginTop: 4
    },

    mapCard: {
        background: "#fff",
        borderRadius: 16,
        padding: "8px 8px 10px 8px",
        height: "100%",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start"
    },

    mapTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: "#065f46",
        margin: "0"
    },

    stageCard: {
        background: "#ffffff",
        borderRadius: 16,
        padding: 18,
        boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start"
    },

    stageGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 10,
        textAlign: "center",
        fontSize: 12,
        fontWeight: 700,
        color: "#374151"
    },

    analyticCard: {
        background: "#ffffff",
        padding: "4px 10px",
        borderRadius: 18,
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 240
    },

    statLikeCard: {
        background: "#ffffff",
        borderRadius: 16,
        padding: "12px 18px",
        minHeight: 90,
        boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
        borderLeft: "5px solid #10b981",
        borderRight: "5px solid #10b981",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center"
    },

    cardTitle: {
        fontSize: 12,
        fontWeight: 600,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginBottom: 8
    },

    cardMainValue: {
        fontSize: 28,
        fontWeight: 800,
        color: "#047857",
        margin: 0
    },

    stageRow: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 14,
        marginTop: 12,
        width: "100%"
    },

    stageLabel: {
        fontSize: 11,
        color: "#6b7280"
    },

    stageValue: {
        fontSize: 20,
        fontWeight: 700,
        color: "#047857"
    },

    routesTable: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 13,
        marginTop: 8,
        tableLayout: "fixed",
        overflow: "hidden"
    },

};
