import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import RetailerLayout from "../layouts/RetailerLayout";
import PageWrapper from "../components/PageWrapper";

export default function RetailerRequests() {

    const navigate = useNavigate();
    const roleId = localStorage.getItem("roleId");

    const [requests, setRequests] = useState([]);
    const [search, setSearch] = useState("");

    const downloadInvoice = async (invoiceId) => {
        try {
            const roleId = localStorage.getItem("roleId");

            const response = await api.get(
                `/distributor/invoice/${invoiceId}`,
                {
                    headers: { "x-role-id": roleId },
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute("download", `invoice-${invoiceId}.pdf`);

            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (err) {
            alert("Invoice not available");
        }
    };

    /* Fetch retailer requests */
    useEffect(() => {

        if (!roleId) {
            navigate("/auth");
            return;
        }

        api.get("/retailer/my-requests", {
            headers: { "x-role-id": roleId }
        })
            .then(res => {

                const data = Array.isArray(res.data) ? res.data : [];

                setRequests(data);

            })
            .catch(() => { });

    }, [navigate, roleId]);


    /* Disable page scroll */
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);


    const filteredRequests = requests.filter(r =>
        (r.requestId || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.batchId || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.status || "").toLowerCase().includes(search.toLowerCase())
    );


    return (
        <RetailerLayout activeTab="requests">

            <PageWrapper style={{ height: "100%", overflow: "hidden" }}>

                <div style={styles.pageContainer}>

                    <div style={styles.headerContainer}>

                        <div style={styles.titleContainer}>
                            <h2 style={styles.title}>My Stock Requests</h2>
                        </div>

                        <div style={styles.searchContainer}>
                            <input
                                placeholder="Search Request ID / Batch / Status..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={styles.search}
                            />
                        </div>

                    </div>


                    <div style={styles.tableScroll}>
                        <div style={styles.tableContainer}>

                            <table className="retailer-table">

                                <thead>
                                    <tr>
                                        <th>Request ID</th>
                                        <th>Batch</th>
                                        <th>Crop</th>
                                        <th>Quantity</th>
                                        <th>Status</th>
                                        <th>Invoice</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {!filteredRequests.length && (
                                        <tr>
                                            <td colSpan="7" className="empty-row">
                                                No requests found
                                            </td>
                                        </tr>
                                    )}

                                    {filteredRequests.map(r => (

                                        <tr
                                            key={r.requestId}
                                            style={{
                                                backgroundColor:
                                                    r.integrityStatus === "TAMPERED" ? "#fff1f2" : "transparent"
                                            }}
                                        >

                                            <td>{r.requestId}</td>

                                            <td>{r.batchId}</td>

                                            <td>{r.cropName || "-"}</td>

                                            <td>{r.requestedQty} kg</td>

                                            {/* ✅ STATUS COLUMN (FIXED) */}
                                            <td>
                                                {r.integrityStatus === "TAMPERED" ? (
                                                    <span
                                                        style={{
                                                            backgroundColor: "#fee2e2",
                                                            color: "#dc2626",
                                                            padding: "4px 10px",
                                                            borderRadius: 20,
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        TAMPERED
                                                    </span>
                                                ) : (
                                                    <span className={`pill ${r.status?.toLowerCase()}`}>
                                                        {r.status}
                                                    </span>
                                                )}
                                            </td>

                                            {/* ✅ INVOICE */}
                                            <td>
                                                {r.invoiceId ? (
                                                    <span
                                                        onClick={() => downloadInvoice(r.invoiceId)}
                                                        style={{
                                                            color: "#16a34a",
                                                            fontWeight: 600,
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        Invoice
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "#6b7280", fontWeight: 600 }}>-</span>
                                                )}
                                            </td>

                                            {/* ✅ ACTION */}
                                            <td>
                                                {r.integrityStatus === "TAMPERED" ? (

                                                    <span style={{ color: "#dc2626", fontWeight: 700 }}>
                                                        Blocked
                                                    </span>

                                                ) : r.status === "DELIVERED" && !r.recorded ? (

                                                    <button
                                                        style={styles.confirmBtn}
                                                        onClick={async () => {

                                                            const confirmed = window.confirm(
                                                                "Have you physically received the product?\n\nClick OK to confirm."
                                                            );

                                                            if (!confirmed) return;

                                                            try {
                                                                await api.post(
                                                                    `/shipments/retailer/confirm/${r.batchId}`,
                                                                    {},
                                                                    { headers: { "x-role-id": roleId } }
                                                                );

                                                                alert("Delivery confirmed & Inventory created");

                                                                setRequests(prev =>
                                                                    prev.map(req =>
                                                                        req.requestId === r.requestId
                                                                            ? { ...req, recorded: true }
                                                                            : req
                                                                    )
                                                                );

                                                            } catch (err) {
                                                                alert(err.response?.data?.message || "Failed");
                                                            }

                                                        }}
                                                    >
                                                        Confirm
                                                    </button>

                                                ) : r.recorded ? (

                                                    <span style={{ color: "#16a34a", fontWeight: 700 }}>
                                                        Recorded
                                                    </span>

                                                ) : r.status === "REJECTED" ? (
                                                    <span style={{ color: "#dc2626", fontWeight: 700 }}>
                                                        Rejected
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "#6b7280", fontWeight: 600 }}>
                                                        Awaiting
                                                    </span>
                                                )}
                                            </td>

                                        </tr>

                                    ))}

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
        marginTop: -60
    },

    headerContainer: {
        maxWidth: 1180,
        margin: "6px auto 10px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
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
        borderRadius: 10
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

    confirmBtn: {
        padding: "6px 12px",
        borderRadius: 6,
        border: "none",
        backgroundColor: "#16a34a",
        color: "white",
        cursor: "pointer",
        fontWeight: 600
    },

    tableContainer: {
        maxWidth: 1180,
        margin: "0 auto",
        width: "100%"
    }

};