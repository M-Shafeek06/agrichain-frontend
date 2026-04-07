import { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import DistributorSidebar from "../../components/DistributorSidebar";
import DistributorGuard from "../../guards/DistributorGuard";

export default function DistributorInvoiceHistory() {
    const [open, setOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const roleId = localStorage.getItem("roleId");

            const res = await api.get("/distributor/invoices", {
                headers: { "x-role-id": roleId }
            });

            setHistory(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Invoice fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = history.filter(item => {
        const batch = item?.batchId || "";
        const crop = item?.cropName || "";

        return (
            batch.toLowerCase().includes(search.toLowerCase()) ||
            crop.toLowerCase().includes(search.toLowerCase())
        );
    });

    const handleDownload = async (invoiceId) => {
        try {
            const roleId = localStorage.getItem("roleId");

            const res = await api.get(
                `/distributor/invoice/${invoiceId}`,
                {
                    headers: { "x-role-id": roleId },
                    responseType: "blob" // VERY IMPORTANT
                }
            );

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute("download", `${invoiceId}.pdf`);
            document.body.appendChild(link);
            link.click();

            link.remove();

        } catch (err) {
            console.error("Download error:", err);
            alert("Invoice download failed");
        }
    };

    return (
        <DistributorGuard>

            <>
                <Navbar />
                <DistributorSidebar open={open} setOpen={setOpen} />

                <div style={styles.wrapper}>

                    {/* ===== HEADER ROW (same as Dispatch page) ===== */}
                    <div style={styles.headerRow}>
                        <div
                            style={styles.hamburger}
                            onMouseEnter={() => setOpen(true)}
                        >
                            ☰
                        </div>

                        <h2>Distributor Invoice History</h2>

                        <input
                            placeholder="Search..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={styles.search}
                        />
                    </div>

                    {/* ===== INVOICE LIST ===== */}
                    <div style={styles.card}>
                        {loading ? (
                            <p>Loading invoices...</p>
                        ) : filtered.length === 0 ? (
                            <p>No invoices available</p>
                        ) : (
                            filtered.map(item => (
                                <div key={item._id} style={styles.row}>
                                    <div>
                                        <b>{item.batchId}</b>
                                        <p>{item.cropName}</p>
                                        <p style={styles.meta}>
                                            Transport Charge: ₹{item.charge}
                                        </p>
                                        <p style={styles.meta}>
                                            Transport Date: {item.transportDate}
                                        </p>
                                    </div>

                                    <button
                                        style={styles.download}
                                        onClick={() =>
                                            handleDownload(item.invoiceId)
                                        }
                                    >
                                        Download Invoice
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                </div>

            </>

        </DistributorGuard>
    );
}

/* ===== STYLES (matched with Dispatch page) ===== */
const styles = {

    wrapper: {
        padding: "20px 28px",
        background: "#f3f6f4",
        flex: 1,
        display: "flex",
        flexDirection: "column"
    },

    /* ===== HEADER ===== */

    headerRow: {
        display: "flex",
        alignItems: "center",
        marginBottom: 25
    },

    hamburger: {
        fontSize: 20,
        cursor: "pointer",
        marginRight: 12
    },

    title: {
        fontSize: 22,
        fontWeight: 700,
        color: "#1f2937"
    },

    search: {
        marginLeft: "auto",
        height: 38,
        width: 240,
        padding: "0 14px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        fontSize: 13,
        background: "#ffffff",
        outline: "none"
    },

    /* ===== CARD CONTAINER ===== */

    card: {
        background: "#ffffff",
        padding: 18,
        borderRadius: 14,
        boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb",
        height: "480px",          // controls card size
        overflowY: "auto"         // enables scroll
    },

    /* ===== INVOICE ROW ===== */

    row: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: 10,
        background: "#fafafa",
        marginBottom: 10,
        border: "1px solid #f0f0f0"
    },

    batch: {
        fontWeight: 600,
        fontSize: 13
    },

    crop: {
        fontSize: 12.5,
        color: "#374151"
    },

    meta: {
        fontSize: 12,
        color: "#6b7280"
    },

    download: {
        padding: "7px 14px",
        background: "#1f2937",
        color: "#fff",
        border: "none",
        borderRadius: 7,
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer"
    }
};