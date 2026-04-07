import { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import DistributorSidebar from "../../components/DistributorSidebar";
import DistributorGuard from "../../guards/DistributorGuard";

export default function WarehouseHistory() {

    const [open, setOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const name = localStorage.getItem("roleName");
    const id = localStorage.getItem("roleId");

    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        async function fetchInventory() {
            try {
                const roleId = localStorage.getItem("roleId");

                const res = await api.get("/distributor/inventory", {
                    headers: { "x-role-id": roleId }
                });

                setInventory(res.data || []);
            } catch (err) {
                console.error("Inventory fetch failed:", err);
            }
        }

        fetchInventory();
    }, []);

    useEffect(() => {
        fetchHistory();
    }, []);

    async function fetchHistory() {
        try {
            const roleId = localStorage.getItem("roleId");

            if (!roleId) return;

            const res = await api.get("/distributor/warehouse-history", {
                headers: { "x-role-id": roleId }
            });

            setHistory(res.data?.history || []);

        } catch (err) {
            console.error("Warehouse history fetch failed:", err);
        } finally {
            setLoading(false);
        }
    }

    /* ================= FILTER ================= */

    const filtered = history.filter(item =>
        item.batchId?.toLowerCase().includes(search.toLowerCase()) ||
        item.cropName?.toLowerCase().includes(search.toLowerCase())
    );

    /* ================= KPI ================= */

    const totalEvents = history.length;

    const soldQty = inventory.reduce(
        (sum, item) => sum + (item.soldQuantity || 0),
        0
    );

    const receivedQty = history
        .filter(h => h.event.startsWith("RECEIVED"))
        .reduce((sum, h) => sum + (h.quantity || 0), 0);

    return (

        <DistributorGuard>

            <>
                <Navbar />

                <DistributorSidebar
                    open={open}
                    setOpen={setOpen}
                    distributorName={name}
                    distributorId={id}
                />

                <div style={styles.wrapper}>

                    {/* HEADER */}

                    <div style={styles.headerRow}>

                        <div
                            style={styles.hamburger}
                            onMouseEnter={() => setOpen(true)}
                        >
                            ☰
                        </div>

                        <h2 style={{ margin: 0 }}>Warehouse History</h2>

                        <input
                            placeholder="Search batch or crop..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={styles.search}
                        />

                    </div>


                    {/* KPI CARDS */}

                    <div style={styles.summaryGrid}>

                        <div style={styles.summaryCard}>
                            <div style={styles.summaryLabel}>Total Events</div>
                            <div style={styles.summaryValue}>{totalEvents}</div>
                        </div>

                        <div style={styles.summaryCard}>
                            <div style={styles.summaryLabel}>Received Quantity</div>
                            <div style={styles.summaryValue}>{receivedQty} kg</div>
                        </div>

                        <div style={styles.summaryCard}>
                            <div style={styles.summaryLabel}>Sold Quantity</div>
                            <div style={styles.summaryValue}>{soldQty} kg</div>
                        </div>

                    </div>


                    {/* TABLE */}

                    <div style={styles.tableCard}>

                        {loading ? (
                            <p style={{ padding: 20 }}>Loading history...</p>
                        ) : filtered.length === 0 ? (
                            <p style={{ padding: 20 }}>No warehouse events found</p>
                        ) : (

                            <table style={styles.table}>

                                <thead>
                                    <tr>
                                        <th style={styles.th}>Batch</th>
                                        <th style={styles.th}>Crop</th>
                                        <th style={styles.th}>Event</th>
                                        <th style={styles.th}>Quantity</th>
                                        <th style={styles.th}>Time</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {filtered.map((h, index) => (

                                        <tr key={`${h.batchId}-${h.time}-${h.event}-${index}`}>

                                            <td style={styles.td}>{h.batchId}</td>

                                            <td style={styles.td}>{h.cropName}</td>

                                            <td style={styles.td}>
                                                <span
                                                    style={{
                                                        ...styles.eventBadge,
                                                        background:
                                                            h.event === "SOLD"
                                                                ? "#ffedd5"   // light orange
                                                                : "#dcfce7",
                                                        color:
                                                            h.event === "SOLD"
                                                                ? "#c2410c"   // strong orange text
                                                                : "#166534"
                                                    }}
                                                >
                                                    {h.event}
                                                </span>
                                            </td>

                                            <td style={styles.td}>
                                                {h.quantity} kg
                                            </td>

                                            <td style={styles.td}>
                                                {new Date(h.time).toLocaleString()}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        )}

                    </div>

                </div>

            </>

        </DistributorGuard>
    );
}


/* ================= STYLES ================= */

const styles = {

    wrapper: {
        padding: "30px 40px",
        background: "#f3f6f4",
        minHeight: "100vh"
    },

    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 28
    },

    hamburger: {
        fontSize: 22,
        cursor: "pointer"
    },

    search: {
        marginLeft: "auto",
        padding: "10px 14px",
        width: 260,
        borderRadius: 8,
        border: "1px solid #d1d5db",
        outline: "none"
    },


    /* KPI */

    summaryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 20,
        marginBottom: 30
    },

    summaryCard: {
        background: "#ecfdf5",
        padding: 22,
        borderRadius: 16,
        border: "1px solid #bbf7d0",
        textAlign: "center"
    },

    summaryLabel: {
        fontSize: 13,
        color: "#065f46"
    },

    summaryValue: {
        fontSize: 26,
        fontWeight: 700,
        color: "#064e3b"
    },


    /* TABLE */

    tableCard: {
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
        maxHeight: "420px",
        overflowY: "auto",
        overflowX: "auto"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 14,
        minWidth: "800px"
    },

    th: {
        background: "#f1f5f9",
        padding: 14,
        textAlign: "left",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 2,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
    },

    td: {
        padding: 14,
        borderBottom: "1px solid #f1f5f9"
    },

    eventBadge: {
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600
    }

};