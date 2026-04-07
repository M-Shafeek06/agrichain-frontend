import { useEffect, useState } from "react";
import api from "../api/axios";
import RetailerLayout from "../layouts/RetailerLayout";
import PageWrapper from "../components/PageWrapper";

export default function RetailerMarketplace() {

    const roleId = localStorage.getItem("roleId");
    const [items, setItems] = useState([]);

    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("latest");

    useEffect(() => {
        api.get("/marketplace")
            .then(res => setItems(res.data || []))
            .catch(() => setItems([]));
    }, []);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const requestStock = async (item) => {

        const qty = prompt(`Enter quantity (Available: ${item.qty} kg)`);

        if (!qty) {
            alert("Please enter a quantity");
            return;
        }

        const numericQty = Number(qty);

        if (numericQty <= 0) {
            alert("Quantity must be greater than 0");
            return;
        }

        // ✅ Smart validation (matches backend)

        const MIN_ORDER = 50;

        if (item.qty >= MIN_ORDER) {
            // Normal case → enforce minimum 50 kg
            if (numericQty < MIN_ORDER) {
                alert(`Minimum order quantity is ${MIN_ORDER} kg`);
                return;
            }
        } else {
            // Low stock case → must take full stock
            if (numericQty !== item.qty) {
                alert(`Only full remaining stock (${item.qty} kg) can be purchased`);
                return;
            }
        }

        // Extra safety check (can keep or remove, but safe to keep)
        if (item.qty < MIN_ORDER && numericQty !== item.qty) {
            alert(`Only full remaining stock (${item.qty} kg) can be purchased`);
            return;
        }

        if (numericQty > item.qty) {
            alert(`Cannot request more than available stock (${item.qty} kg)`);
            return;
        }

        try {
            await api.post("/retailer/request", {
                distributorId: item.distributorId,
                batchId: item.batchId,
                quantity: numericQty
            }, {
                headers: { "x-role-id": roleId }
            });

            alert("Request sent!");
        } catch (err) {

            const msg =
                err?.response?.data?.message ||
                "Failed to send request";

            alert(msg);

        }
    };

    const filteredItems = items
        .filter(item =>
            (item.batchId || "").toLowerCase().includes(search.toLowerCase()) ||
            (item.crop || "").toLowerCase().includes(search.toLowerCase()) ||
            (item.distributorName || "").toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (!a.harvestDate || !b.harvestDate) return 0;

            const diff = sortOrder === "latest"
                ? new Date(b.harvestDate) - new Date(a.harvestDate)
                : new Date(a.harvestDate) - new Date(b.harvestDate);

            // 🔥 If same harvest date → fallback sorting
            if (diff === 0) {
                return b.qty - a.qty; // higher stock first
            }

            return diff;
        });

    return (
        <RetailerLayout activeTab="marketplace">
            <PageWrapper style={{ height: "100%", overflow: "hidden" }}>
                <div style={styles.pageContainer}>

                    {/* HEADER */}
                    <div style={styles.headerContainer}>

                        <div style={styles.titleContainer}>
                            <h2 style={styles.title}>Marketplace</h2>
                        </div>

                        <div style={styles.searchContainer}>
                            <input
                                placeholder="Search Batch / Crop / Distributor..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={styles.search}
                            />
                        </div>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            style={{
                                marginLeft: 10,
                                padding: 8,
                                borderRadius: 6,
                                border: "1px solid #ccc"
                            }}
                        >
                            <option value="latest">Freshest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>

                    </div>

                    {/* TABLE SCROLL AREA */}
                    <div style={styles.tableScroll}>
                        <div style={styles.tableContainer}>

                            <table className="retailer-table">

                                <thead>
                                    <tr>
                                        <th>Distributor</th>
                                        <th>Batch</th>
                                        <th>Crop</th>
                                        <th>Harvest Date</th>
                                        <th>Available</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {!filteredItems.length && (
                                        <tr>
                                            <td colSpan="6" className="empty-row">
                                                No stock available
                                            </td>
                                        </tr>
                                    )}

                                    {filteredItems.length > 0 && filteredItems.map(item => {

                                        const daysOld = item.harvestDate
                                            ? (new Date() - new Date(item.harvestDate)) / (1000 * 60 * 60 * 24)
                                            : null;

                                        let freshnessLabel = "N/A";
                                        let freshnessColor = "#6b7280";

                                        if (daysOld !== null) {
                                            if (daysOld <= 3) {
                                                freshnessLabel = "Very Fresh";
                                                freshnessColor = "#16a34a";
                                            } else if (daysOld <= 7) {
                                                freshnessLabel = "Fresh";
                                                freshnessColor = "#22c55e";
                                            } else if (daysOld <= 14) {
                                                freshnessLabel = "Moderate";
                                                freshnessColor = "#f59e0b";
                                            } else {
                                                freshnessLabel = "Old";
                                                freshnessColor = "#dc2626";
                                            }
                                        }

                                        return (
                                            <tr key={item.batchId}>

                                                <td>{item.distributorName}</td>

                                                <td>{item.batchId}</td>

                                                <td>{item.crop}</td>

                                                <td>
                                                    {item.harvestDate ? (
                                                        <div>
                                                            <div>
                                                                {new Date(item.harvestDate).toLocaleDateString()}
                                                            </div>

                                                            <div style={{
                                                                fontSize: 12,
                                                                fontWeight: 600,
                                                                color: freshnessColor
                                                            }}>
                                                                {freshnessLabel}
                                                            </div>
                                                        </div>
                                                    ) : "N/A"}
                                                </td>

                                                <td>{item.qty} kg</td>

                                                <td>
                                                    <button
                                                        className="primary-btn"
                                                        onClick={() => requestStock(item)}
                                                    >
                                                        Request
                                                    </button>
                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>

                            </table>

                        </div>
                    </div>

                </div>

            </PageWrapper>
        </RetailerLayout>
    );
}



const styles = {

    pageContainer: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden"
    },

    headerContainer: {
        maxWidth: 1180,
        margin: "0px auto 8px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },

    title: {
        fontSize: 28,
        fontWeight: 700,
        margin: 0
    },

    tableScroll: {
        flex: 1,
        overflowY: "auto",
        maxHeight: "60vh",
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        marginTop: 10
    },

    titleContainer: {
        display: "flex",
        alignItems: "center"
    },

    searchContainer: {
        display: "flex",
        alignItems: "center"
    },

    search: {
        padding: 10,
        width: 260,
        borderRadius: 8,
        border: "1px solid #d1d5db"
    },

    tableContainer: {
        maxWidth: 1180,
        margin: "0 auto",
        width: "100%"
    }

};