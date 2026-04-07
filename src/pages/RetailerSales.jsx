import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import RetailerLayout from "../layouts/RetailerLayout";
import PageWrapper from "../components/PageWrapper";

export default function RetailerSales() {

    const navigate = useNavigate();
    const roleId = localStorage.getItem("roleId");

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ================= FETCH SALES ================= */

    useEffect(() => {
        if (!roleId) {
            navigate("/auth");
            return;
        }

        const fetchSales = async () => {
            try {
                const res = await api.get(
                    "/inventory/sales/history",
                    {
                        headers: {
                            "x-retailer-id": roleId
                        }
                    }
                );

                setSales(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Sales fetch failed:", err);
                setSales([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
    }, [navigate, roleId]);

    /* ================= CALCULATIONS ================= */

    const totalSold = sales.reduce(
        (sum, s) => sum + (Number(s.quantitySold) || 0),
        0
    );

    const totalTransactions = sales.length;

    const today = new Date().toDateString();

    const todaySales = sales.filter(
        s => new Date(s.createdAt).toDateString() === today
    );

    const todaySoldQty = todaySales.reduce(
        (sum, s) => sum + (Number(s.quantitySold) || 0),
        0
    );

    const totalRevenue = sales.reduce(
        (sum, s) => sum + (Number(s.totalSaleValue) || 0),
        0
    );

    const totalProfit = sales.reduce(
        (sum, s) => sum + (Number(s.profitEarned) || 0),
        0
    );

    /* ================= CROP GROUPING ================= */

    const batchCropMap = {};
    const cropMap = {};

    // Step 1: fix crop per batch
    sales.forEach(s => {
        if (!batchCropMap[s.batchId]) {
            batchCropMap[s.batchId] = s.cropName || "Unknown";
        }
    });

    // Step 2: aggregate qty + profit
    sales.forEach(s => {
        const crop = batchCropMap[s.batchId] || s.cropName || "Unknown";

        if (!cropMap[crop]) {
            cropMap[crop] = {
                qty: 0,
                profit: 0
            };
        }

        cropMap[crop].qty += Number(s.quantitySold) || 0;
        cropMap[crop].profit += Number(s.profitEarned) || 0;
    });

    /* ================= UI ================= */

    return (
        <RetailerLayout activeTab="sales">
            <PageWrapper>

                <div style={{
                    maxWidth: 1180,
                    margin: "0 auto",
                    paddingBottom: 10,
                }}>
                    <h2 style={styles.title}>Retail Sales Dashboard</h2>

                    {/* ================= SUMMARY CARDS ================= */}

                    <div style={styles.cardGrid}>

                        <div style={{ ...styles.statCard, ...styles.kpiGreen }}>
                            <h4>Total Sold (kg)</h4>
                            <p style={styles.statValue}>{totalSold.toFixed(2)}</p>
                        </div>

                        <div style={{ ...styles.statCard, ...styles.kpiBlue }}>
                            <h4>Total Transactions</h4>
                            <p style={styles.statValue}>{totalTransactions}</p>
                        </div>

                        <div style={{ ...styles.statCard, ...styles.kpiOrange }}>
                            <h4>Today's Sold (kg)</h4>
                            <p style={styles.statValue}>{todaySoldQty.toFixed(2)}</p>
                        </div>

                        <div style={{ ...styles.statCard, ...styles.kpiPurple }}>
                            <h4>Total Revenue (₹)</h4>
                            <p style={styles.statValue}>
                                ₹ {totalRevenue.toFixed(2)}
                            </p>
                        </div>

                        <div style={{ ...styles.statCard, ...styles.kpiGreen }}>
                            <h4>Total Profit (₹)</h4>
                            <p style={styles.statValue}>
                                ₹ {totalProfit.toFixed(2)}
                            </p>
                        </div>

                    </div>
                    <div style={styles.salesRow}>

                        {/* RECENT SALES */}
                        <div style={styles.recentSales}>

                            <h3 style={{ marginBottom: 10 }}>Recent Sales</h3>

                            <div style={styles.recentTableWrap}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Crop</th>
                                            <th style={styles.th}>Batch</th>
                                            <th style={styles.th}>Quantity</th>
                                            <th style={styles.th}>Date</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {!sales.length && (
                                            <tr>
                                                <td colSpan="4" style={styles.emptyRow}>
                                                    No sales found
                                                </td>
                                            </tr>
                                        )}

                                        {sales.slice(0, 20).map(s => (
                                            <tr key={s._id}>
                                                <td style={styles.td}>{s.cropName}</td>
                                                <td style={styles.td}>{s.batchId}</td>
                                                <td style={styles.td}>{s.quantitySold} kg</td>
                                                <td style={styles.td}>
                                                    {new Date(s.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>


                        {/* CROP SALES TABLE */}

                        <div style={styles.cropTable}>

                            <h3 style={{ marginBottom: 10 }}>Crop-wise Sales</h3>
                            <div style={styles.cropTableWrap}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Crop</th>
                                            <th style={styles.th}>Total Sold</th>
                                            <th style={styles.th}>Profit / kg (₹)</th>
                                            <th style={styles.th}>Total Profit (₹)</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {!Object.keys(cropMap).length && (
                                            <tr>
                                                <td colSpan="2" style={styles.emptyRow}>
                                                    No sales
                                                </td>
                                            </tr>
                                        )}

                                        {Object.entries(cropMap).map(([crop, data]) => (
                                            <tr key={crop}>
                                                <td style={styles.td}>{crop}</td>

                                                <td style={styles.td}>
                                                    {data.qty.toFixed(2)} kg
                                                </td>

                                                <td style={styles.td}>
                                                    ₹ {(data.qty > 0 ? (data.profit / data.qty).toFixed(2) : "0.00")}
                                                </td>

                                                <td style={{ ...styles.td, color: "#16a34a", fontWeight: 600 }}>
                                                    ₹ {data.profit.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                </div>

            </PageWrapper>
        </RetailerLayout>
    );
}

/* ================= STYLES ================= */

const styles = {

    title: {
        textAlign: "center",
        fontSize: 24,
        fontWeight: 700,
        marginTop: -80,
        marginBottom: 18
    },

    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 16,            // reduced from 20
        marginBottom: 28
    },

    statCard: {
        padding: "8px 10px",
        borderRadius: 14,
        textAlign: "center",
        fontWeight: 600,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 2,
        minHeight: 70
    },

    recentTableWrap: {
        maxHeight: 280,
        overflowY: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: 10
    },

    cropTableWrap: {
        maxHeight: 280,
        overflowY: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: 10
    },

    salesRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",   // ✅ equal width
        gap: 18,
        alignItems: "stretch",            // ✅ same height alignment
        marginTop: 10
    },

    recentSales: {
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        padding: 12,
        minWidth: 0,
        height: "100%"     // ✅ add this
    },

    cropTable: {
        background: "#ffffff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        height: "100%"     // ✅ add this
    },

    /* ===== KPI COLORS ===== */

    kpiGreen: {
        background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
        border: "1px solid #86efac",
        color: "#14532d"
    },

    kpiBlue: {
        background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
        border: "1px solid #7dd3fc",
        color: "#0c4a6e"
    },

    kpiOrange: {
        background: "linear-gradient(135deg, #fef3c7, #fde68a)",
        border: "1px solid #facc15",
        color: "#78350f"
    },

    kpiPurple: {
        background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
        border: "1px solid #c4b5fd",
        color: "#4c1d95"
    },

    kpiProfit: {
        background: "linear-gradient(135deg, #ecfdf5, #bbf7d0)",
        border: "1px solid #4ade80",
        color: "#065f46"
    },

    statValue: {
        fontSize: 18,
        fontWeight: 700
    },

    tableWrap: {
        marginTop: 10,
        maxHeight: 320,
        overflowY: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: 12
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed"
    },

    th: {
        position: "sticky",
        top: 0,
        background: "#f1f5f9",
        padding: "12px",
        textAlign: "left",
        fontWeight: 600,
        fontSize: 14,
        borderBottom: "1px solid #e5e7eb",
        zIndex: 1
    },

    td: {
        padding: "12px",
        borderBottom: "1px solid #e5e7eb",
        fontSize: 14,
        wordBreak: "break-word"
    },

    tr: {
        background: "#ffffff"
    },

    emptyRow: {
        textAlign: "center",
        padding: "20px",
        color: "#94a3b8"
    },

    section: {
        marginTop: 30
    },

    cropGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 16,
        marginTop: 15
    },

    cropCard: {
        background: "#f8fafc",
        padding: 18,
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between"
    },

    empty: {
        color: "#94a3b8",
        marginTop: 10
    }
};
