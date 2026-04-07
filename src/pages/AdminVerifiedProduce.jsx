import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import AdminLayout from "../layouts/AdminLayout";

export default function AdminVerifiedProduce() {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDebug, setShowDebug] = useState(true);


    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    /* ================= LOAD VERIFIED ================= */

    const loadVerifiedBatches = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/produce/history/ALL");

            const history = (res.data || [])
                .filter(
                    b =>
                        b.verificationStatus === "APPROVED" ||
                        b.verificationStatus === "REJECTED"
                )
                .sort(
                    (a, b) =>
                        new Date(b.verifiedAt || 0) -
                        new Date(a.verifiedAt || 0)
                );

            setBatches(history);

        } catch (err) {
            console.error("Failed to load verified batches", err);
            setBatches([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadVerifiedBatches();
    }, [loadVerifiedBatches]);

    const formatDate = (date) =>
        date ? new Date(date).toLocaleDateString() : "—";

    const filteredBatches = batches.filter(b => {
        if (!fromDate && !toDate) return true;

        const verified = new Date(b.verifiedAt);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        if (from && verified < from) return false;
        if (to) {
            const endOfDay = new Date(to);
            endOfDay.setHours(23, 59, 59, 999);
            if (verified > endOfDay) return false;
        }

        return true;
    });
    const handleDownload = () => {
        if (!filteredBatches.length) return;

        const headers = [
            "Batch ID",
            "Farmer",
            "Crop",
            "Quantity",
            "Harvest Date",
            "Integrity",
            "Status",
            "Verified By",
            "Verified On"
        ];

        const rows = filteredBatches.map(b => [
            b.batchId,
            b.farmerName,
            b.cropName,
            `${b.quantity} kg`,
            formatDate(b.harvestDate),
            b.integrityStatus,
            b.verificationStatus,
            b.verifiedBy || "—",
            formatDate(b.verifiedAt)
        ]);

        const csvContent =
            [headers, ...rows]
                .map(row => row.join(","))
                .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "verified_produce_history.csv";
        link.click();
    };

    return (
        <AdminLayout>
            <h2 style={pageTitle}>
                Admin – Verified Produce History
            </h2>

            {loading ? (
                <p style={{ fontStyle: "italic" }}>
                    Loading verified batches…
                </p>
            ) : batches.length === 0 ? (
                <p style={{ fontStyle: "italic" }}>
                    No verified batches found
                </p>
            ) : (
                <>
                    {/* ================= FILTER BAR ================= */}
                    <div style={topBar}>
                        <div>
                            <strong>Total Records: </strong>
                            {filteredBatches.length}
                        </div>

                        <div style={rightFilter}>
                            <span style={filterTitle}>Filter By Date</span>

                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                style={dateInput}
                            />

                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                style={dateInput}
                            />

                            <button onClick={handleDownload} style={downloadBtn}>
                                Download CSV
                            </button>
                        </div>
                    </div>

                    {/* ================= TABLE ================= */}
                    <div style={scrollTableWrapper}>
                        <table style={tableStyle}>
                            <thead style={stickyHeader}>
                                <tr>
                                    <th style={th}>Batch ID</th>
                                    <th style={th}>Farmer</th>
                                    <th style={th}>Crop</th>
                                    <th style={th}>Quantity</th>
                                    <th style={th}>Harvest Date</th>
                                    <th style={th}>Integrity</th>
                                    <th style={th}>Status</th>
                                    <th style={th}>Verified By</th>
                                    <th style={th}>Verified On</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBatches.map(b => (
                                    <tr key={b.batchId}>
                                        <td style={td}>{b.batchId}</td>
                                        <td style={td}>{b.farmerName}</td>
                                        <td style={td}>{b.cropName}</td>
                                        <td style={td}>{b.quantity} kg</td>
                                        <td style={td}>{formatDate(b.harvestDate)}</td>

                                        <td
                                            style={{
                                                ...td,
                                                fontWeight: 600,
                                                color:
                                                    b.integrityStatus === "TAMPERED"
                                                        ? "#dc2626"
                                                        : "#16a34a"
                                            }}
                                        >
                                            {b.integrityStatus}
                                        </td>

                                        <td
                                            style={{
                                                ...td,
                                                fontWeight: 700,
                                                color:
                                                    b.verificationStatus === "APPROVED"
                                                        ? "#16a34a"
                                                        : "#dc2626"
                                            }}
                                        >
                                            {b.verificationStatus}
                                        </td>

                                        <td style={td}>{b.verifiedBy || "—"}</td>
                                        <td style={td}>{formatDate(b.verifiedAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {showDebug && (
                <div style={debugBox}>
                    <div style={debugHeader}>
                        <span>ADMIN DEBUG</span>
                        <span
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowDebug(false)}
                        >
                            ✕
                        </span>
                    </div>

                    Total verified batches: <b>{batches.length}</b>
                </div>
            )}
        </AdminLayout>
    );
}

/* ================= STYLES ================= */
const tableStyle = {
    width: "100%",
    borderCollapse: "collapse"
};

const pageTitle = {
    marginTop: -35,      // move upward
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 700
};


const th = {
    border: "1px solid #ddd",
    padding: 10,
    textAlign: "center"
};

const td = {
    border: "1px solid #ddd",
    padding: 10,
    textAlign: "center"
};

const debugBox = {
    position: "fixed",
    right: 20,
    bottom: 20,
    width: 260,
    background: "#111827",
    color: "#e5e7eb",
    padding: 12,
    borderRadius: 10,
    fontSize: 12,
    zIndex: 999
};

const debugHeader = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
    fontWeight: 700
};

const topBar = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
};

const rightFilter = {
    display: "flex",
    alignItems: "center",
    gap: 12
};

const filterTitle = {
    fontWeight: 600,
    marginRight: 8
};

const scrollTableWrapper = {
    maxHeight: "60vh",
    overflowY: "auto",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    background: "#fff"
};

const stickyHeader = {
    position: "sticky",
    top: 0,
    background: "#f3f4f6",
    zIndex: 2
};

const dateInput = {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #d1d5db"
};

const downloadBtn = {
    background: "#14532d",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontWeight: 600
};