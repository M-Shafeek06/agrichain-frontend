import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import DistributorSidebar from "../components/DistributorSidebar";

export default function DistributorRequests() {
    const [open, setOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchRequests() {
            try {
                const roleId = localStorage.getItem("roleId");

                // 🔹 Future backend endpoint
                const res = await api.get("/distributor/requests", {
                    headers: { "x-role-id": roleId }
                });

                setRequests(res.data);

            } catch (err) {
                console.error("Request fetch failed:", err);

                // 🔹 Fallback mock data (for now)
                setRequests([
                    {
                        requestId: "REQ-101",
                        retailerName: "Fresh Mart",
                        batchId: "BATCH-001",
                        crop: "Tomato",
                        requestedQty: 50,
                        status: "REQUESTED"
                    },
                    {
                        requestId: "REQ-102",
                        retailerName: "Green Shop",
                        batchId: "BATCH-002",
                        crop: "Carrot",
                        requestedQty: 30,
                        status: "REQUESTED"
                    }
                ]);
            }
        }

        fetchRequests();
    }, []);

    /* ================= ACTION HANDLERS ================= */

    const handleApprove = (id) => {
        setRequests(prev =>
            prev.map(r =>
                r.requestId === id
                    ? { ...r, status: "APPROVED" }
                    : r
            )
        );
    };

    const handleReject = (id) => {
        setRequests(prev =>
            prev.map(r =>
                r.requestId === id
                    ? { ...r, status: "REJECTED" }
                    : r
            )
        );
    };

    /* ================= SEARCH FILTER ================= */

    const filtered = requests.filter(r =>
        r.batchId.toLowerCase().includes(search.toLowerCase()) ||
        r.crop.toLowerCase().includes(search.toLowerCase()) ||
        r.retailerName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Navbar />

            <DistributorSidebar
                open={open}
                setOpen={setOpen}
            />

            <div style={styles.wrapper}>

                {/* Header */}
                <div style={styles.headerRow}>
                    <div
                        style={styles.hamburger}
                        onMouseEnter={() => setOpen(true)}
                    >
                        ☰
                    </div>

                    <h2>Retailer Requests</h2>

                    <input
                        placeholder="Search batch / crop / retailer..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={styles.search}
                    />
                </div>

                {/* Table */}
                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Retailer</th>
                                <th>Batch</th>
                                <th>Crop</th>
                                <th>Qty</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map(r => (
                                <tr key={r.requestId}>
                                    <td>{r.requestId}</td>
                                    <td>{r.retailerName}</td>
                                    <td>{r.batchId}</td>
                                    <td>{r.crop}</td>
                                    <td>{r.requestedQty} kg</td>

                                    <td>
                                        <span
                                            style={{
                                                ...styles.status,
                                                background:
                                                    r.status === "APPROVED"
                                                        ? "#16a34a"
                                                        : r.status === "REJECTED"
                                                            ? "#dc2626"
                                                            : "#2563eb"
                                            }}
                                        >
                                            {r.status}
                                        </span>
                                    </td>

                                    <td>
                                        {r.status === "REQUESTED" && (
                                            <>
                                                <button
                                                    style={styles.approve}
                                                    onClick={() =>
                                                        handleApprove(r.requestId)
                                                    }
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    style={styles.reject}
                                                    onClick={() =>
                                                        handleReject(r.requestId)
                                                    }
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    );
}

/* ================= STYLES ================= */

const styles = {
    wrapper: {
        padding: "18px 36px",
        background: "#f9fafb",
        minHeight: "100vh"
    },

    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 18
    },

    hamburger: {
        fontSize: 22,
        cursor: "pointer"
    },

    search: {
        marginLeft: "auto",
        padding: 8,
        width: 280,
        borderRadius: 8,
        border: "1px solid #d1d5db"
    },

    card: {
        background: "#fff",
        borderRadius: 14,
        padding: 18,
        boxShadow: "0 6px 14px rgba(0,0,0,0.06)"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "center"
    },

    status: {
        padding: "4px 10px",
        borderRadius: 20,
        color: "#fff",
        fontSize: 12
    },

    approve: {
        marginRight: 6,
        padding: "6px 12px",
        background: "#16a34a",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: "pointer"
    },

    reject: {
        padding: "6px 12px",
        background: "#dc2626",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: "pointer"
    }
};