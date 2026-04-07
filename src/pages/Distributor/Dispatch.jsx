import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import DistributorSidebar from "../../components/DistributorSidebar";
import DistributorGuard from "../../guards/DistributorGuard";

export default function Dispatch() {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [shipments, setShipments] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchDispatch();
    }, []);

    const fetchDispatch = async () => {
        try {
            const roleId = localStorage.getItem("roleId");

            const res = await api.get("/distributor/dispatch", {
                headers: { "x-role-id": roleId }
            });

            setShipments(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const filtered = shipments.filter(item => {
        const batch = item?.batchId || "";
        const crop = item?.cropName || "";

        return (
            batch.toLowerCase().includes(search.toLowerCase()) ||
            crop.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <DistributorGuard>

            <>
                <Navbar />
                <DistributorSidebar open={open} setOpen={setOpen} />

                <div style={styles.wrapper}>
                    <div style={styles.headerRow}>
                        <div style={styles.hamburger} onMouseEnter={() => setOpen(true)}>☰</div>
                        <h2 style={styles.title}>Dispatch to Retailer</h2>

                        <input
                            type="text"
                            placeholder="Search by batch or crop..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.search}
                        />
                    </div>

                    <div style={styles.card}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Batch</th>
                                    <th style={styles.th}>Crop</th>
                                    <th style={styles.th}>Requested Qty (KG)</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={styles.emptyCell}>
                                            {shipments.length === 0
                                                ? "No dispatch activity available"
                                                : "No matching results found"}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((item, index) => (
                                        <tr
                                            key={item._id}
                                            style={{
                                                background: index % 2 === 0 ? "#ffffff" : "#f8fafc"
                                            }}
                                        >
                                            <td style={styles.td}>{item.batchId}</td>
                                            <td style={styles.td}>{item.cropName}</td>
                                            <td style={styles.td}>
                                                <strong>{item.requestedQty}</strong> kg
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.status}>
                                                    {item.status}
                                                </span>
                                            </td>

                                            <td style={styles.td}>
                                                <button
                                                    onClick={() =>
                                                        navigate(`/distributor/invoice/${item.requestId}`)
                                                    }
                                                    style={styles.btn}
                                                >
                                                    Dispatch
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </>

        </DistributorGuard>
    );
}
const styles = {

    wrapper: {
        padding: "30px 40px",
        background: "#f3f6f4",
        minHeight: "100vh"
    },

    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 28
    },

    hamburger: {
        fontSize: 22,
        cursor: "pointer"
    },

    title: {
        fontSize: 22,
        fontWeight: 700,
        margin: 0,
        color: "#1f2937"
    },

    /* ===== Search Box ===== */

    search: {
        marginLeft: "auto",
        padding: "10px 14px",
        width: 260,
        borderRadius: 10,
        border: "1px solid #d1d5db",
        outline: "none",
        fontSize: 14,
        transition: "all 0.2s ease"
    },

    /* ===== Card ===== */

    card: {
        background: "#ffffff",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb"
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
        borderBottom: "1px solid #e5e7eb"
    },

    td: {
        padding: "14px",
        borderBottom: "1px solid #f1f5f9",
        color: "#475569"
    },

    emptyCell: {
        textAlign: "center",
        padding: "40px 20px",
        color: "#64748b",
        fontSize: 15,
        fontWeight: 500
    },

    /* ===== Status Badge ===== */

    status: {
        background: "#dcfce7",
        color: "#166534",
        padding: "6px 12px",
        borderRadius: 20,
        fontWeight: 600,
        fontSize: 13
    },

    /* ===== Button ===== */

    btn: {
        padding: "7px 16px",
        background: "#16a34a",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease"
    }
};