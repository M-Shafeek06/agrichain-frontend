import { useEffect, useState, useMemo } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api/axios";

export default function AdminUsers() {

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.get("/admin/all-users");
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed loading users", err);
        }
    };

    /* ---------- SEARCH FILTER ---------- */

    const filteredUsers = useMemo(() => {
        return users.filter((u) =>
            (u.name || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (u.roleId || "")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
            (u.location || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [users, search]);

    /* ---------- USER STATS ---------- */

    const stats = useMemo(() => {

        const farmer = users.filter(u => u.role === "FARMER").length;
        const retailer = users.filter(u => u.role === "RETAILER").length;
        const distributor = users.filter(u => u.role === "DISTRIBUTOR").length;
        const transporter = users.filter(u => u.role === "TRANSPORTER").length;

        return {
            total: users.length,
            farmer,
            retailer,
            distributor,
            transporter
        };

    }, [users]);

    /* ---------- ROLE BADGE ---------- */

    const roleBadge = (role) => {

        const colors = {
            FARMER: "#22c55e",
            RETAILER: "#3b82f6",
            DISTRIBUTOR: "#a855f7",
            TRANSPORTER: "#f97316"
        };

        return (
            <span
                style={{
                    background: colors[role],
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.3px"
                }}
            >
                {role}
            </span>
        );
    };

    const renderTrustScore = (score = 50) => {

        let color = "#64748b";

        if (score >= 80) color = "#16a34a";        // green
        else if (score >= 50) color = "#eab308";   // yellow
        else color = "#dc2626";                    // red

        return (
            <span
                style={{
                    background: `${color}15`,
                    color,
                    padding: "4px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600
                }}
            >
                {score}%
            </span>
        );
    };

    return (
        <AdminLayout>

            <main style={styles.container}>

                {/* HEADER */}

                <div style={styles.headerRow}>
                    <h2 style={{ margin: 0 }}>
                        System Users
                    </h2>

                    <input
                        placeholder="Search name / role ID / location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={styles.search}
                    />
                </div>


                {/* ---------- USER STATISTICS ---------- */}

                <div style={styles.statsRow}>

                    <div style={{ ...styles.statCard, background: "#f0fdf4" }}>
                        <span style={{ ...styles.statValue, color: "#16a34a" }}>{stats.farmer}</span>
                        <span style={styles.statLabel}>Farmers</span>
                    </div>

                    <div style={{ ...styles.statCard, background: "#eff6ff" }}>
                        <span style={{ ...styles.statValue, color: "#2563eb" }}>{stats.retailer}</span>
                        <span style={styles.statLabel}>Retailers</span>
                    </div>

                    <div style={{ ...styles.statCard, background: "#faf5ff" }}>
                        <span style={{ ...styles.statValue, color: "#9333ea" }}>{stats.distributor}</span>
                        <span style={styles.statLabel}>Distributors</span>
                    </div>

                    <div style={{ ...styles.statCard, background: "#fff7ed" }}>
                        <span style={{ ...styles.statValue, color: "#ea580c" }}>{stats.transporter}</span>
                        <span style={styles.statLabel}>Transporters</span>
                    </div>

                    <div style={{ ...styles.statCardLast, background: "#f1f5f9" }}>
                        <span style={styles.statValue}>{stats.total}</span>
                        <span style={styles.statLabel}>Total Users</span>
                    </div>

                </div>


                {/* CARD */}

                <div style={styles.card}>

                    {/* TABLE HEADER */}

                    <div style={styles.tableHeader}>
                        <span style={styles.cell}>Name</span>
                        <span style={styles.cell}>Role</span>
                        <span style={styles.cell}>Role ID</span>
                        <span style={styles.cell}>Trust Score</span>
                        <span style={styles.cell}>Location</span>
                        <span>Contact</span>
                    </div>

                    {/* SCROLLABLE TABLE */}

                    <div style={styles.tableBody}>

                        {filteredUsers.map((u, i) => (
                            <div key={i} style={styles.tableRow}>
                                <span style={styles.cell}>{u.name}</span>
                                <span style={styles.cell}>{roleBadge(u.role)}</span>
                                <span style={styles.cell}>{u.roleId}</span>
                                <span style={styles.cell}>
                                    {renderTrustScore(u.trustScore)}
                                </span>
                                <span style={styles.cell}>{u.location || "—"}</span>
                                <span>{u.emergencyContact || "—"}</span>
                            </div>
                        ))}

                        {filteredUsers.length === 0 && (
                            <p style={styles.empty}>
                                No users found
                            </p>
                        )}

                    </div>

                </div>

            </main>

        </AdminLayout>
    );
}

const styles = {

    container: {
        padding: "0px 12px 20px 12px",
        marginTop: -40,
        background: "linear-gradient(to bottom,#f8fafc,#eef2f7)",
        minHeight: "100vh"
    },

    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
    },

    search: {
        padding: "8px 12px",
        borderRadius: 8,
        border: "1px solid #cbd5f5",
        outline: "none",
        width: 260
    },

    card: {
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        padding: 24,
        marginTop: 10,
        boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
        maxWidth: "1350px",
        marginLeft: "auto",
        marginRight: "auto"
    },

    cell: {
        borderRight: "1px solid #f1f5f9",
        paddingRight: 14
    },

    statsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(5,1fr)",
        marginBottom: 18,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        maxWidth: "950px",
        marginLeft: "auto",
        marginRight: "auto"
    },

    statCard: {
        borderRight: "1px solid #e5e7eb",
        padding: "14px 12px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },

    statValue: {
        display: "block",
        fontSize: 20,
        fontWeight: 700,
        color: "#1e293b"
    },

    statCardLast: {
        padding: "10px 8px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },

    statLabel: {
        fontSize: 12,
        color: "#64748b"
    },

    tableHeader: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr 2fr 1fr 2fr 2fr",
        fontWeight: 600,
        fontSize: 14,
        color: "#334155",
        padding: "14px 12px",
        borderBottom: "1px solid #e5e7eb",
        background: "#f1f5f9",
        position: "sticky",
        top: 0,
        zIndex: 1
    },

    tableBody: {
        maxHeight: "360px",
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "thin",
        paddingRight: "4px"
    },

    tableRow: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr 2fr 1fr 2fr 2fr",
        padding: "14px 12px",
        borderBottom: "1px solid #f1f5f9",
        fontSize: 14,
        color: "#475569",
        alignItems: "center",
        transition: "background 0.15s"
    },

    empty: {
        padding: 16,
        textAlign: "center",
        color: "#64748b"
    }

};