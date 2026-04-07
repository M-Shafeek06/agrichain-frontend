import { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import DistributorSidebar from "../../components/DistributorSidebar";
import DistributorGuard from "../../guards/DistributorGuard";

export default function WarehouseInventory() {
    const [open, setOpen] = useState(false);

    const name = localStorage.getItem("roleName");
    const id = localStorage.getItem("roleId");

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

                <InventoryHome setOpen={setOpen} />
            </>

        </DistributorGuard>
    );
}

/* ================= PAGE CONTENT ================= */
function InventoryHome({ setOpen }) {
    const [inventory, setInventory] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchInventory() {
            try {
                const roleId = localStorage.getItem("roleId");

                const res = await api.get("/distributor/inventory", {
                    headers: { "x-role-id": roleId }
                });

                setInventory(res.data);

            } catch (err) {
                console.error("Inventory fetch failed:", err);
            }
        }

        fetchInventory();
    }, []);
    /* ---------- FILTER ---------- */

    const filtered = inventory.filter(item =>
        item.cropName?.toLowerCase().includes(search.toLowerCase()) ||
        item.batchId?.toLowerCase().includes(search.toLowerCase())
    );
    /* ---------- SUMMARY ---------- */

    const totalBatches = inventory.length;

    const totalQuantity = inventory.reduce(
        (sum, item) => sum + (item.remainingQuantity || 0),
        0
    );

    const cropTypes = new Set(
        inventory.map(i => i.cropName)
    ).size;

    return (
        <div style={styles.wrapper}>

            {/* Header */}
            <div style={styles.headerRow}>
                <div
                    style={styles.hamburger}
                    onMouseEnter={() => setOpen(true)}
                >
                    ☰
                </div>

                <h2 style={{ margin: 0 }}>Warehouse Inventory</h2>

                <input
                    placeholder="Search batch or crop..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={styles.search}
                />
            </div>

            {/* KPI Cards */}
            <div style={styles.summaryGrid}>

                <div style={styles.summaryCard}>
                    <div style={styles.summaryLabel}>Total Batches</div>
                    <div style={styles.summaryValue}>{totalBatches}</div>
                </div>

                <div style={styles.summaryCard}>
                    <div style={styles.summaryLabel}>Available Quantity</div>
                    <div style={styles.summaryValue}>{totalQuantity} kg</div>
                </div>

                <div style={styles.summaryCard}>
                    <div style={styles.summaryLabel}>Crop Types</div>
                    <div style={styles.summaryValue}>{cropTypes}</div>
                </div>

            </div>

            {/* Table */}
            <div style={styles.tableCard}>

                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Batch ID</th>
                            <th style={styles.th}>Crop</th>
                            <th style={styles.th}>Total Qty</th>
                            <th style={styles.th}>Sold</th>
                            <th style={styles.th}>Remaining</th>
                            <th style={styles.th}>Grade</th>
                        </tr>
                    </thead>

                    <tbody>

                        {filtered.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="6"
                                    style={{
                                        textAlign: "center",
                                        padding: 30,
                                        color: "#94a3b8",
                                        fontStyle: "italic"
                                    }}
                                >
                                    No inventory data available
                                </td>
                            </tr>

                        ) : (

                            filtered.map((item) => (
                                <tr key={item.batchId}>
                                    <td style={styles.td}>{item.batchId}</td>
                                    <td style={styles.td}>{item.cropName}</td>
                                    <td style={styles.td}>{item.totalQuantity} kg</td>
                                    <td>
                                        {(item.totalQuantity - item.remainingQuantity)} kg
                                    </td>
                                    <td style={{ ...styles.td, fontWeight: 600, color: "#166534" }}>
                                        {item.remainingQuantity} kg
                                    </td>
                                    <td style={styles.td}>{item.qualityGrade}</td>
                                </tr>
                            )))}


                    </tbody>
                </table>

            </div>

        </div>
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

    /* -------- KPI CARDS -------- */

    summaryGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 20,
        marginBottom: 30
    },

    summaryCard: {
        background: "#ecfdf5",   // light green
        padding: "22px",
        borderRadius: 16,
        border: "1px solid #bbf7d0",
        boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
        textAlign: "center"
    },

    summaryLabel: {
        fontSize: 13,
        color: "#065f46",
        marginBottom: 6
    },

    summaryValue: {
        fontSize: 26,
        fontWeight: 700,
        color: "#064e3b"
    },

    /* -------- TABLE -------- */

    tableCard: {
        background: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
        maxHeight: "420px",
        overflowY: "auto"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: 14
    },

    th: {
        background: "#f1f5f9",
        padding: "14px",
        textAlign: "left",
        fontWeight: 600,
        color: "#334155",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 1
    },

    td: {
        padding: "14px",
        borderBottom: "1px solid #f1f5f9",
        color: "#475569"
    }
};