import { useEffect, useState } from "react";
import api from "../api/axios";
import RetailerLayout from "../layouts/RetailerLayout";
import { useNavigate } from "react-router-dom";

export default function RetailWarehousePage() {

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    const retailerId = localStorage.getItem("roleId");
    const navigate = useNavigate();

    const [search, setSearch] = useState("");

    /* ================= FETCH INVENTORY ================= */

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const res = await api.get("/inventory", {
                    headers: { "x-retailer-id": retailerId }
                });

                if (isMounted) {
                    setInventory(res.data || []);
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();

        const interval = setInterval(async () => {
            try {
                const res = await api.get("/inventory", {
                    headers: { "x-retailer-id": retailerId }
                });

                const newData = res.data || [];

                setInventory(prev =>
                    JSON.stringify(prev) === JSON.stringify(newData)
                        ? prev
                        : newData
                );
            } catch (err) {
                console.error(err);
            }
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };

    }, []);

    /* ================= FILTER ================= */

    const filteredInventory = inventory.filter(item => {
        const searchText = search.toLowerCase();

        return (
            item.inventoryId?.toLowerCase().includes(searchText) ||
            item.batchId?.toLowerCase().includes(searchText) ||
            item.cropName?.toLowerCase().includes(searchText) // ✅ ADDED
        );
    });
    const availableInventory = filteredInventory.filter(
        item => item.remainingQuantity > 0
    );

    const soldOutInventory = filteredInventory.filter(
        item => item.remainingQuantity === 0
    );

    /* ================= CARD ================= */

    const renderCard = (item) => {

        const isSoldOut = item.remainingQuantity === 0;

        const stockPercent = item.quantity
            ? Math.min((item.remainingQuantity / item.quantity) * 100, 100)
            : 0;

        const retailPrice = item.retailerPerKgPrice || 0;

        const costPerKg =
            (item.dispatchCost + item.transportCharge) / item.quantity;

        const profitPerKg = retailPrice - costPerKg;
        const earnedProfit = profitPerKg * item.soldQuantity;

        return (
            <div
                key={item.inventoryId}
                style={{
                    ...styles.card,
                    border:
                        item.integrityStatus === "TAMPERED"
                            ? "2px solid #ef4444"
                            : isSoldOut
                                ? "2px solid #f59e0b"
                                : "1px solid #e5e7eb",

                    background:
                        item.integrityStatus === "TAMPERED"
                            ? "#fff7f7"
                            : isSoldOut
                                ? "linear-gradient(135deg, #fff7ed, #ffedd5)"
                                : "#ffffff",

                    opacity: isSoldOut ? 0.9 : 1
                }}
            >

                {/* LEFT */}
                <div style={styles.cardContent}>

                    <div style={styles.topRow}>
                        <span style={styles.inventoryId}>
                            {item.inventoryId}
                        </span>

                        <span style={{
                            ...styles.statusBadge,
                            background:
                                item.integrityStatus === "TAMPERED"
                                    ? "#fee2e2"
                                    : isSoldOut
                                        ? "#fed7aa"
                                        : "#bbf7d0",

                            color:
                                item.integrityStatus === "TAMPERED"
                                    ? "#7f1d1d"
                                    : isSoldOut
                                        ? "#9a3412"
                                        : "#14532d",
                            fontSize: 11,
                            letterSpacing: "0.5px"
                        }}>
                            {item.integrityStatus === "TAMPERED"
                                ? "TAMPERED"
                                : isSoldOut
                                    ? "SOLD OUT"
                                    : "AVAILABLE"}
                        </span>
                    </div>

                    <div style={styles.batch}>
                        Batch: {item.batchId}
                    </div>

                    <div style={{ fontSize: 12, color: "#64748b" }}>
                        Invoice: {item.invoiceId}
                    </div>

                    <div style={styles.cropName}>
                        {item.cropName || "Unknown Crop"}
                    </div>

                    <div style={styles.statsRow}>
                        <div>
                            <div style={styles.statLabel}>Total</div>
                            <div style={styles.statValue}>{item.quantity} kg</div>
                        </div>

                        <div>
                            <div style={styles.statLabel}>Remaining</div>
                            <div style={styles.statValue}>{item.remainingQuantity} kg</div>
                        </div>

                        <div>
                            <div style={styles.statLabel}>Sold</div>
                            <div style={styles.statValue}>{item.soldQuantity} kg</div>
                        </div>
                    </div>

                    {/* 🔥 PRICING BOX */}
                    <div style={styles.priceBox}>

                        <div style={styles.priceHeader}>PRICING SUMMARY</div>

                        <div style={styles.priceRow}>
                            <span>Distributor Cost</span>
                            <strong>₹ {item.dispatchCost?.toFixed(2)}</strong>
                        </div>

                        <div style={styles.priceRow}>
                            <span>Transport Charge</span>
                            <strong>₹ {item.transportCharge?.toFixed(2)}</strong>
                        </div>

                        <div style={styles.priceDivider} />

                        <div style={styles.finalPriceRow}>
                            <span>Retail Price (Per Kg)</span>
                            <strong>
                                ₹ {retailPrice.toFixed(2)}
                            </strong>
                        </div>

                        {/* 🔥 NEW */}
                        <div style={styles.profitPerKg}>
                            Profit per Kg: ₹ {profitPerKg.toFixed(2)}
                        </div>

                        <div style={styles.inventoryValue}>
                            Inventory Value: ₹ {
                                (item.remainingQuantity *
                                    item.retailerPerKgPrice).toFixed(2)
                            }
                        </div>

                        {/* 🔥 NEW: EARNED PROFIT */}
                        <div style={styles.earnedProfit}>
                            Profit Earned: ₹ {earnedProfit.toFixed(2)}
                        </div>

                        {/* 🔥 EXISTING: FUTURE PROFIT */}
                        <div style={styles.totalProfit}>
                            Total Possible Profit: ₹ {
                                (profitPerKg * item.remainingQuantity).toFixed(2)
                            }
                        </div>

                    </div>

                    {/* 🔥 SMART PROGRESS BAR */}
                    <div style={styles.progressBar}>
                        <div
                            style={{
                                ...styles.progressFill,
                                width: `${stockPercent}%`,
                                background:
                                    isSoldOut
                                        ? "#f59e0b"
                                        : stockPercent < 30
                                            ? "#f59e0b"
                                            : "#16a34a"
                            }}
                        />
                    </div>

                </div>

                {/* QR */}
                <div
                    style={styles.qrSection}
                    onClick={() => navigate(`/verify/${item.inventoryId}`)}
                >
                    {(() => {
                        const viewUrl = `${window.location.origin}/verify/${item.inventoryId}`;

                        return (
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(viewUrl)}`}
                                alt="QR"
                                style={styles.qrImage}
                            />
                        );
                    })()}
                </div>
            </div>
        );
    };

    /* ================= UI ================= */

    return (
        <RetailerLayout activeTab="warehouse">
            <div style={styles.wrapper}>

                <div style={styles.headerRow}>
                    <h2 style={styles.heading}>Retail Warehouse Inventory</h2>

                    <input
                        type="text"
                        placeholder="Search by Inventory / Batch / Crop..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={styles.search}
                    />
                </div>

                {loading ? (
                    <p>Loading inventory...</p>
                ) : filteredInventory.length === 0 ? (
                    <p>No stock available</p>
                ) : (
                    <>
                        {availableInventory.length > 0 && (
                            <>
                                <h3 style={styles.sectionTitle}>Available Stock</h3>
                                <div style={styles.grid}>
                                    {availableInventory.map(renderCard)}
                                </div>
                            </>
                        )}

                        {soldOutInventory.length > 0 && (
                            <>
                                <h3 style={styles.sectionTitle}>Sold Out</h3>
                                <div style={styles.grid}>
                                    {soldOutInventory.map(renderCard)}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </RetailerLayout>
    );
}

/* ================= STYLES ================= */

const styles = {

    wrapper: {
        maxWidth: 1400,
        margin: "-15px auto 0 auto",
        padding: "0px 20px 50px 20px",
        minHeight: "100%",
    },

    headerRow: {
        position: "sticky",
        top: -15,
        background: "#f3f6f4",
        zIndex: 25,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        marginBottom: 20
    },

    search: {
        width: 260,
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid #d1d5db",
        fontSize: 13,
        outline: "none",
        background: "#ffffff"
    },

    heading: {
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "0.3px",
        marginLeft: 10
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 10,
        marginTop: 10,
        color: "#1f2937"
    },

    cropName: {
        fontSize: 15,
        fontWeight: 700,
        color: "#065f46",
        marginTop: 4
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 20
    },

    card: {
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16, // 🔥 reduced from 20
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        transition: "all 0.25s ease",
        cursor: "default",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
    },

    cardContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 12
    },

    qrSection: {
        minWidth: 110,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderLeft: "1px solid #f1f5f9",
        paddingLeft: 16,
        cursor: "pointer"
    },

    qrImage: {
        width: 70,
        height: 70,
        objectFit: "contain"
    },

    topRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },

    inventoryId: {
        fontWeight: 700,
        fontSize: 14
    },

    batch: {
        fontSize: 13,
        color: "#64748b"
    },

    statsRow: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: 10
    },

    statLabel: {
        fontSize: 12,
        color: "#64748b"
    },

    earnedProfit: {
        marginTop: 6,
        fontSize: 13,
        color: "#2563eb",
        textAlign: "right",
        fontWeight: 700,
        background: "#dbeafe",
        padding: "6px 10px",
        borderRadius: 8
    },

    statValue: {
        fontSize: 13,
        fontWeight: 600
    },

    /* 🔥 STATUS BADGE */
    statusBadge: {
        fontSize: 11,
        fontWeight: 700,
        padding: "5px 12px",
        borderRadius: 20,
        letterSpacing: "0.5px"
    },

    priceBox: {
        marginTop: 10,
        padding: 12, // 🔥 reduced
        background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
        borderRadius: 12,
        border: "1px solid #bbf7d0",
        display: "flex",
        flexDirection: "column",
        gap: 6 // 🔥 reduced spacing
    },

    priceHeader: {
        fontSize: 11,
        fontWeight: 700,
        color: "#6b7280",
        letterSpacing: "0.5px"
    },

    priceRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13
    },

    priceDivider: {
        height: 1,
        background: "#d1fae5",
        margin: "4px 0"
    },

    /* 🔥 MAIN PRICE HIGHLIGHT */
    finalPriceRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 18,
        fontWeight: 800,
        color: "#065f46",
        background: "#d1fae5",
        padding: "6px 10px",
        borderRadius: 8
    },

    /* 🔥 PROFIT PER KG */
    profitPerKg: {
        fontSize: 13,
        fontWeight: 600,
        color: "#047857"
    },

    inventoryValue: {
        marginTop: 4,
        fontSize: 12,
        color: "#64748b",
        textAlign: "right"
    },

    /* 🔥 TOTAL PROFIT BOX */
    totalProfit: {
        marginTop: 6,
        fontSize: 14,
        color: "#16a34a",
        textAlign: "right",
        fontWeight: 700,
        background: "#dcfce7",
        padding: "6px 10px",
        borderRadius: 8
    },

    /* 🔥 PROGRESS BAR */
    progressBar: {
        height: 6,
        background: "#e5e7eb",
        borderRadius: 6,
        overflow: "hidden",
        marginTop: 8
    },

    progressFill: {
        height: "100%",
        background: "#16a34a",
        transition: "width 0.4s ease"
    }
};