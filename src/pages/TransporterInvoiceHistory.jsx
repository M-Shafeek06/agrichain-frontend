import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import TransporterSidebar from "../components/TransporterSidebar";
import "./FarmerDashboard.css";

export default function TransporterInvoiceHistory() {
    const navigate = useNavigate();
    const location = useLocation();

    const roleId = localStorage.getItem("roleId");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [search, setSearch] = useState("");

    /* ================= FETCH ================= */
    useEffect(() => {
        if (!roleId) return;

        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/produce/invoice/transporter/${roleId}`);
                setInvoices(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Failed to fetch invoices:", err);
                setInvoices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [roleId]);

    /* ================= FILTER + SORT ================= */
    const filteredInvoices = [...invoices]
        .filter((inv) => {
            const key = search.toLowerCase();
            const invoice = inv.transporterInvoice || {};

            return (
                (inv.batchId || "").toLowerCase().includes(key) ||
                (inv.cropName || "").toLowerCase().includes(key) ||
                (inv.farmerName || "").toLowerCase().includes(key) ||
                (invoice.distributorName || "").toLowerCase().includes(key)
            );
        })
        .sort((a, b) => {
            const dateA = new Date(a.transporterInvoice?.transportDate || 0);
            const dateB = new Date(b.transporterInvoice?.transportDate || 0);
            return dateB - dateA; // latest first
        });

    /* ================= DOWNLOAD ================= */
    const handleDownload = async (invoiceId) => {
        try {
            const res = await api.get(
                `/produce/invoice/download/${invoiceId}`,
                { responseType: "blob" }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `invoice-${invoiceId}.pdf`;

            document.body.appendChild(link);
            link.click();

            window.URL.revokeObjectURL(url);
            link.remove();
        } catch (err) {
            console.error("Download error:", err);
            alert("Download failed");
        }
    };

    return (
        <>
            <Navbar />

            <div style={{ display: "flex" }}>
                <TransporterSidebar
                    drawerOpen={drawerOpen}
                    setDrawerOpen={setDrawerOpen}
                />

                <main style={{ flex: 1, padding: "20px 40px 30px" }}>
                    <div style={{ marginBottom: 8 }}>
                        <span
                            style={{ fontSize: 22, cursor: "pointer" }}
                            onMouseEnter={() => setDrawerOpen(true)}
                        >
                            ☰
                        </span>
                    </div>

                    <div style={cardStyle}>
                        {/* HEADER */}
                        <div style={headerRow}>
                            <h2 style={titleStyle}>Uploaded Invoice History</h2>

                            <div style={subtitleStyle}>
                                All transporter invoices available for download
                            </div>

                            <input
                                type="text"
                                placeholder="Search batch / crop / farmer / distributor..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={searchInput}
                            />
                        </div>

                        {/* CONTENT */}
                        {loading ? (
                            <div style={stateBox}>Loading invoices...</div>
                        ) : filteredInvoices.length === 0 ? (
                            <div style={stateBox}>No matching invoices found.</div>
                        ) : (
                            <div style={invoiceList}>
                                {filteredInvoices.map((inv) => {
                                    const invoice = inv.transporterInvoice || {};

                                    return (
                                        <div key={inv.invoiceId} style={invoiceRow}>
                                            {/* LEFT */}
                                            <div style={{ flex: 1 }}>
                                                <div style={invoiceTitle}>
                                                    {inv.batchId}
                                                </div>

                                                <div style={invoiceMeta}>
                                                    Farmer: {inv.farmerName || "Unknown"}
                                                </div>

                                                <div style={invoiceMeta}>
                                                    Crop: {inv.cropName || "—"} | Qty: {inv.quantity || "—"} kg
                                                </div>

                                                <div style={invoiceMeta}>
                                                    Distributor: {invoice.distributorName || "—"}
                                                </div>

                                                <div style={invoiceMeta}>
                                                    Date: {invoice.transportDate
                                                        ? new Date(invoice.transportDate).toLocaleDateString()
                                                        : "Unavailable"}
                                                </div>
                                            </div>

                                            {/* RIGHT */}
                                            <div style={invoiceRight}>
                                                <div style={amountTag}>
                                                    ₹ {invoice.charge ?? "—"}
                                                </div>

                                                <div style={statusBadge}>
                                                    Approved
                                                </div>

                                                <button
                                                    onClick={() => handleDownload(inv.invoiceId)}
                                                    style={downloadBtn}
                                                >
                                                    Download
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

/* ================= STYLES ================= */

const searchInput = {
    marginTop: 10,
    padding: "8px 12px",
    width: 300,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 13
};

const cardStyle = {
    maxWidth: 1100,
    margin: "0 auto",
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 12px 35px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    height: "78vh",
    overflow: "hidden"
};

const headerRow = {
    textAlign: "center",
    padding: "30px 40px 20px",
    borderBottom: "1px solid #f1f5f9",
    background: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 2
};

const titleStyle = {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 6
};

const subtitleStyle = {
    fontSize: 13,
    color: "#6b7280"
};

const invoiceList = {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: "20px 40px 30px",
    overflowY: "auto",
    flex: 1
};

const invoiceRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    background: "#f9fafb"
};

const invoiceTitle = {
    fontWeight: 700,
    fontSize: 15,
    marginBottom: 4
};

const invoiceMeta = {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2
};

const invoiceRight = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8
};

const amountTag = {
    fontSize: 16,
    fontWeight: 700,
    color: "#065f46"
};

const statusBadge = {
    fontSize: 11,
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 8px",
    borderRadius: 999,
    fontWeight: 600
};

const downloadBtn = {
    padding: "9px 18px",
    borderRadius: 9,
    border: "1px solid #065f46",
    background: "transparent",
    color: "#065f46",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13
};

const stateBox = {
    padding: "40px 0",
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14
};