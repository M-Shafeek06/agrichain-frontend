import { useEffect, useState } from "react";
import api from "../api/axios";
import RetailerLayout from "../layouts/RetailerLayout";

export default function Marketplace() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* ================= FETCH MARKETPLACE ================= */

    const fetchMarketplace = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/marketplace");

            if (Array.isArray(res.data)) {
                setListings(res.data);
            } else {
                setListings([]);
            }

        } catch (err) {
            console.error("Marketplace fetch failed:", err);
            setError("Failed to load marketplace");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketplace();
    }, []);

    /* ================= REQUEST STOCK ================= */

    const requestStock = async (item) => {
        const input = prompt(
            `Enter quantity (Available: ${item.qty} kg)`
        );

        if (!input) return;

        const qty = Number(input);

        if (isNaN(qty) || qty <= 0) {
            alert("Enter a valid quantity");
            return;
        }

        if (qty > item.qty) {
            alert("Quantity exceeds available stock");
            return;
        }

        try {
            const roleId = localStorage.getItem("roleId");

            if (!roleId) {
                alert("Retailer identity missing. Please login again.");
                return;
            }

            await api.post(
                "/retailer/request",
                {
                    distributorId: item.distributorId,
                    batchId: item.batchId,
                    quantity: qty
                },
                {
                    headers: { "x-role-id": roleId }
                }
            );

            alert("Request sent successfully");

            // Refresh marketplace
            fetchMarketplace();

        } catch (err) {
            console.error("Request failed:", err);
            alert("Request failed");
        }
    };

    /* ================= RENDER ================= */

    return (
        <RetailerLayout title="Marketplace">
            <div style={styles.wrapper}>
                <h2 style={{ marginTop: "-40px" }}>Market Place</h2>

                {loading && <p>Loading marketplace...</p>}

                {error && (
                    <p style={styles.error}>{error}</p>
                )}

                {!loading && listings.length === 0 && (
                    <p style={styles.empty}>
                        No stock available
                    </p>
                )}

                {!loading && listings.length > 0 && (
                    <div style={styles.card}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th>Distributor</th>
                                    <th>Batch</th>
                                    <th>Crop</th>
                                    <th>Available Qty</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {listings.map((item) => (
                                    <tr key={item.batchId}>
                                        <td>
                                            {item.distributorName || "-"}
                                        </td>
                                        <td>{item.batchId}</td>
                                        <td>{item.crop}</td>
                                        <td>{item.qty} kg</td>
                                        <td>
                                            <button
                                                style={styles.button}
                                                onClick={() =>
                                                    requestStock(item)
                                                }
                                            >
                                                Request
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </RetailerLayout>
    );
}

/* ================= STYLES ================= */

const styles = {
    wrapper: {
        padding: "0 30px 30px",
        marginTop: "-50px",   // ← force move upward
        minHeight: "100vh"
    },

    heading: {
        marginTop: 0,
        marginBottom: 16,
        fontSize: 26,
        fontWeight: 700
    },

    card: {
        background: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "center"
    },

    button: {
        padding: "6px 12px",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
    },

    error: {
        color: "red",
        marginBottom: "10px"
    },

    empty: {
        color: "#666",
        textAlign: "center",
        marginTop: "20px"
    }
};
