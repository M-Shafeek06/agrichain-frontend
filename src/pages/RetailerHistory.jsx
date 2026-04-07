import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import RetailerLayout from "../layouts/RetailerLayout";
import PageWrapper from "../components/PageWrapper";

export default function RetailerHistory() {

    const navigate = useNavigate();
    const roleId = localStorage.getItem("roleId");

    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!roleId) {
            navigate("/auth");
            return;
        }

        const fetchHistory = async () => {
            try {
                const res = await api.get(`/shipments/history/retailer/${roleId}`);
                setHistory(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("History fetch failed:", err);
                setHistory([]);
            }
        };

        fetchHistory();
    }, [navigate, roleId]);

    const filtered = history.filter(h =>
        (h.batchId || "").toLowerCase().includes(search.toLowerCase()) ||
        (h.cropName || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <RetailerLayout activeTab="history">
            <PageWrapper style={{ paddingTop: 6 }}>

                <div style={styles.pageContainer}>

                    {/* ===== HEADER SECTION ===== */}
                    <div style={styles.headerContainer}>

                        <div style={styles.titleContainer}>
                            <h2 style={styles.title}>Retailer Produce History</h2>
                        </div>

                        <div style={styles.searchContainer}>
                            <input
                                placeholder="Search Batch ID / Crop..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={styles.search}
                            />
                        </div>

                    </div>


                    {/* ===== TABLE SECTION ===== */}
                    <div style={styles.tableSection}>
                        <div style={styles.tableContainer}>

                            <table className="retailer-table">

                                <thead>
                                    <tr>
                                        <th>Batch ID</th>
                                        <th>Crop Name</th>
                                        <th>Quantity (kg)</th>
                                        <th>Received Date</th>
                                        <th>Status</th>
                                        <th>Location</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {!filtered.length && (
                                        <tr>
                                            <td colSpan="6" className="empty-row">
                                                No produce history found
                                            </td>
                                        </tr>
                                    )}

                                    {filtered.map((p) => {

                                        const latest = p.latest || p;
                                        const status = latest.status || "-";

                                        return (
                                            <tr key={p._id}>

                                                <td className="col-batch">{p.batchId}</td>

                                                <td>{p.cropName || "-"}</td>

                                                <td>{p.quantity ?? "-"}</td>

                                                <td>
                                                    {latest.updatedAt
                                                        ? new Date(latest.updatedAt).toLocaleDateString()
                                                        : "-"
                                                    }
                                                </td>

                                                <td>
                                                    <span className={`pill ${status.toLowerCase()}`}>
                                                        {status.replaceAll("_", " ")}
                                                    </span>
                                                </td>

                                                <td>{latest.location || "-"}</td>

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
        overflow: "hidden",
        marginTop: -70
    },


    /* HEADER */

    headerContainer: {
        maxWidth: 1180,
        margin: "4px auto 6px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    },

    titleContainer: {
        display: "flex",
        alignItems: "center"
    },

    title: {
        fontSize: 28,
        fontWeight: 700,
        margin: 0
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


    /* TABLE */

    tableSection: {
        maxHeight: "520px",
        overflowY: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: 10
    },

    tableContainer: {
        maxWidth: 1180,
        margin: "0 auto",
        width: "100%"
    }

};