import { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import DistributorSidebar from "../../components/DistributorSidebar";
import DistributorGuard from "../../guards/DistributorGuard";

export default function DistributorRequests() {
    const [open, setOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmAction, setConfirmAction] = useState(null);

    /* ================= FETCH ================= */

    const fetchRequests = async () => {
        try {
            setLoading(true);

            const roleId = localStorage.getItem("roleId");

            const res = await api.get(
                "/distributor/requests",
                { headers: { "x-role-id": roleId } }
            );

            setRequests(res.data || []);

        } catch (err) {
            console.error("Request fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    /* ================= ACTIONS ================= */

    const handleApprove = async (id) => {
        try {
            const roleId = localStorage.getItem("roleId");

            await api.post(
                `/distributor/request/${id}/approve`,   // ✅ FIXED
                {},
                { headers: { "x-role-id": roleId } }
            );

            fetchRequests();

        } catch (err) {
            console.error("Approve Error:", err?.response?.data || err.message);

            alert(
                err?.response?.data?.message ||
                "Approval failed"
            );
        }
    };

    const handleReject = async (id) => {
        try {
            const roleId = localStorage.getItem("roleId");

            await api.post(
                `/distributor/request/${id}/reject`,   // ✅ FIXED
                {},
                { headers: { "x-role-id": roleId } }
            );

            fetchRequests();

        } catch (err) {
            console.error("Reject Error:", err?.response?.data || err.message);

            alert(
                err?.response?.data?.message ||
                "Reject failed"
            );
        }
    };

    /* ================= STATUS BADGE ================= */

    const renderStatus = (status) => {
        switch (status) {

            case "REQUESTED":
                return <span style={styles.pending}>Pending</span>;

            case "APPROVED":
                return <span style={styles.approved}>Approved</span>;

            case "REJECTED":
                return <span style={styles.rejected}>Rejected</span>;

            case "DISPATCHED":
                return <span style={styles.dispatch}>Dispatched</span>;

            case "DELIVERED":
                return <span style={styles.delivered}>Delivered</span>;

            default:
                return <span style={styles.pending}>{status}</span>;
        }
    };

    /* ================= UI ================= */

    return (
        <DistributorGuard>

            <>
                <Navbar />
                <DistributorSidebar open={open} setOpen={setOpen} />

                <div style={styles.wrapper}>

                    <div style={styles.headerRow}>
                        <div
                            style={styles.hamburger}
                            onMouseEnter={() => setOpen(true)}
                        >
                            ☰
                        </div>

                        <h2>Retailer Request History</h2>
                    </div>

                    <div style={styles.card}>

                        {loading ? (
                            <p>Loading requests...</p>

                        ) : requests.length === 0 ? (
                            <p>No requests available</p>

                        ) : (

                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>

                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Request ID</th>
                                            <th style={styles.th}>Retailer</th>
                                            <th style={styles.th}>Batch</th>
                                            <th style={styles.th}>Crop</th>
                                            <th style={styles.th}>Qty</th>
                                            <th style={styles.th}>Status</th>
                                            <th style={styles.th}>Decision</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {requests.map((r, index) => (
                                            <tr
                                                key={r._id}
                                                style={{
                                                    background: index % 2 === 0 ? "#ffffff" : "#f8fafc"
                                                }}
                                            >
                                                <td style={styles.td}>{r.requestId}</td>
                                                <td style={styles.td}>{r.retailerName}</td>
                                                <td style={styles.td}>{r.batchId}</td>
                                                <td style={styles.td}>{r.cropName}</td>
                                                <td style={styles.td}>{r.requestedQty} kg</td>

                                                <td style={styles.td}>
                                                    {renderStatus(r.status)}
                                                </td>

                                                <td style={styles.td}>
                                                    {r.status === "REQUESTED" ? (
                                                        <>
                                                            <button
                                                                style={styles.approveBtn}
                                                                onClick={() =>
                                                                    setConfirmAction({
                                                                        id: r._id,
                                                                        type: "approve",
                                                                        request: r
                                                                    })
                                                                }
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                style={styles.rejectBtn}
                                                                onClick={() =>
                                                                    setConfirmAction({
                                                                        id: r._id,
                                                                        type: "reject",
                                                                        request: r
                                                                    })
                                                                }
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span style={styles.historyTag}>
                                                            Recorded
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    {confirmAction && (
                                        <div style={modalStyles.overlay}>
                                            <div style={modalStyles.box}>
                                                <h3>
                                                    {confirmAction.type === "approve"
                                                        ? "Approve Request"
                                                        : "Reject Request"}
                                                </h3>

                                                <p><strong>Request ID:</strong> {confirmAction.request.requestId}</p>
                                                <p><strong>Retailer:</strong> {confirmAction.request.retailerName}</p>
                                                <p><strong>Batch:</strong> {confirmAction.request.batchId}</p>
                                                <p><strong>Quantity:</strong> {confirmAction.request.requestedQty} kg</p>

                                                <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                                                    <button
                                                        style={
                                                            confirmAction.type === "approve"
                                                                ? modalStyles.approveBtn
                                                                : modalStyles.rejectBtn
                                                        }
                                                        onClick={async () => {
                                                            try {
                                                                if (confirmAction.type === "approve") {
                                                                    await handleApprove(confirmAction.id);
                                                                } else {
                                                                    await handleReject(confirmAction.id);
                                                                }
                                                                setConfirmAction(null);
                                                            } catch {
                                                                alert("Action failed");
                                                            }
                                                        }}
                                                    >
                                                        Confirm
                                                    </button>

                                                    <button
                                                        style={modalStyles.cancelBtn}
                                                        onClick={() => setConfirmAction(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </table>
                            </div>
                        )}

                    </div>

                </div>

            </>

        </DistributorGuard>
    );
}

/* ================= STYLES ================= */
const modalStyles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
    },

    box: {
        background: "#fff",
        padding: 24,
        borderRadius: 14,
        width: 360,
        boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
    },

    approveBtn: {
        padding: "7px 16px",
        background: "#16a34a",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600
    },

    rejectBtn: {
        padding: "7px 16px",
        background: "#dc2626",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600
    },

    cancelBtn: {
        padding: "7px 16px",
        background: "#6b7280",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer"
    }
};

const styles = {

    wrapper: {
        padding: "30px 40px",
        background: "#f3f6f4",
        minHeight: "100vh"
    },

    tableWrapper: {
        maxHeight: "460px",     // adjust height as needed
        overflowY: "auto",
        borderRadius: 12
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

    pageTitle: {
        fontSize: 22,
        fontWeight: 700,
        color: "#1f2937",
        margin: 0
    },

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
        borderBottom: "1px solid #e5e7eb",

        position: "sticky",   // ✅ key
        top: 0,               // ✅ stick to top
        zIndex: 2             // ✅ stay above rows
    },

    td: {
        padding: "14px",
        borderBottom: "1px solid #f1f5f9",
        color: "#475569"
    },

    row: {
        transition: "all 0.2s ease"
    },

    /* ===== Buttons ===== */

    approveBtn: {
        padding: "7px 14px",
        marginRight: 8,
        background: "#16a34a",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.2s ease"
    },

    rejectBtn: {
        padding: "7px 14px",
        background: "#dc2626",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.2s ease"
    },

    historyTag: {
        fontSize: 13,
        color: "#64748b",
        fontWeight: 500
    },

    /* ===== Status Badges ===== */

    approved: {
        background: "#dcfce7",
        color: "#166534",
        padding: "6px 12px",
        borderRadius: 20,
        fontWeight: 600,
        fontSize: 13
    },

    rejected: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "6px 12px",
        borderRadius: 20,
        fontWeight: 600,
        fontSize: 13
    },

    pending: {
        background: "#fef9c3",
        color: "#854d0e",
        padding: "6px 12px",
        borderRadius: 20,
        fontWeight: 600,
        fontSize: 13
    },

    dispatch: {
        background: "#e0f2fe",
        color: "#075985",
        padding: "6px 12px",
        borderRadius: 20,
        fontWeight: 600,
        fontSize: 13
    },

    delivered: {
        background: "#d1fae5",
        color: "#065f46",
        padding: "6px 12px",
        borderRadius: 20,
        fontWeight: 600,
        fontSize: 13
    }
};