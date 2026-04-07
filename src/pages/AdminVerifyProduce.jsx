import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import AdminLayout from "../layouts/AdminLayout";

export default function AdminVerifyProduce() {
    const [batches, setBatches] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [showDebug, setShowDebug] = useState(true);
    const [loading, setLoading] = useState(false);

    /* ================= LOAD PENDING ================= */
    const loadPendingBatches = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/produce/history/ALL");

            const pendingOnly = (res.data || []).filter(
                (b) =>
                    b.verificationStatus === "PENDING" &&
                    b.integrityStatus !== "TAMPERED"
            );

            setBatches(pendingOnly);
        } catch (err) {
            console.error("Failed to load batches", err);
            setBatches([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPendingBatches();
    }, [loadPendingBatches]);

    /* ================= APPROVE ================= */
    const approveBatch = async (batchId) => {
        if (!batchId) return;

        if (!window.confirm(`Approve batch ${batchId}?`)) return;

        const basePrice = prompt("Enter Base Price per kg (₹):");

        // ❌ Cancel pressed
        if (basePrice === null) return;

        // ✅ Allow only numbers with max 2 decimal places
        const priceRegex = /^\d+(\.\d{1,2})?$/;

        if (!priceRegex.test(basePrice.trim())) {
            alert("Enter a valid price (maximum 2 decimal places)");
            return;
        }

        const price = Number(basePrice);

        if (isNaN(price) || price <= 10) {
            alert("Valid base price minimum of ₹10 required");
            return;
        }

        if (price > 250) {
            alert("Base price cannot exceed ₹250 per kg");
            return;
        }

        const remark = prompt(
            "Approval reason:",
            "Quality verified"
        );

        if (!remark) return;

        setLoadingId(batchId);

        try {
            await api.put(`/produce/approve/${batchId}`, {
                adminRemark: remark.trim(),
                basePrice: price
            });

            await loadPendingBatches();

        } catch (err) {
            console.error("Approval failed", err);
            alert(
                err?.response?.data?.message ||
                "Approval failed. Check server logs."
            );
        } finally {
            setLoadingId(null);
        }
    };

    /* ================= REJECT ================= */
    const rejectBatch = async (batchId) => {
        if (!batchId) return;
        if (!window.confirm(`Reject batch ${batchId}?`)) return;

        const remark = prompt(
            "Reason for rejection:",
            "Quality standards not met"
        );

        if (!remark) return;

        setLoadingId(batchId);
        try {
            await api.put(`/produce/reject/${batchId}`, {
                adminRemark: remark
            });
            await loadPendingBatches();
        } catch (err) {
            console.error("Rejection failed", err);
            alert(
                err?.response?.data?.message ||
                "Rejection failed. Check server logs."
            );
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <AdminLayout>
            <h2 style={{ marginBottom: 16 }}>
                Admin – Verify Produce Batches
            </h2>

            {loading ? (
                <p style={{ fontStyle: "italic" }}>Loading batches…</p>
            ) : batches.length === 0 ? (
                <p style={{ fontStyle: "italic" }}>No pending batches</p>
            ) : (
                <div
                    style={{
                        maxHeight: "65vh",
                        overflowY: "auto",
                        overflowX: "hidden",
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                        background: "#fff"
                    }}
                >
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            background: "#fff"
                        }}
                    >
                        <thead>
                            <tr style={{ background: "#f3f4f6" }}>
                                <th style={th}>Batch ID</th>
                                <th style={th}>Farmer</th>
                                <th style={th}>Crop</th>
                                <th style={th}>Quantity</th>
                                <th style={th}>Quality</th>
                                <th style={th}>Harvest Date</th>
                                <th style={th}>Integrity</th>
                                <th style={th}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {batches.map((b) => {
                                const isLoading = loadingId === b.batchId;

                                return (
                                    <tr key={b.batchId}>
                                        <td style={td}>{b.batchId}</td>
                                        <td style={td}>{b.farmerName}</td>
                                        <td style={td}>{b.cropName}</td>
                                        <td style={td}>{b.quantity} kg</td>
                                        <td style={td}>
                                            <span style={{
                                                background: "#ecfdf5",
                                                color: "#059669",
                                                padding: "4px 10px",
                                                borderRadius: 6,
                                                fontWeight: 600
                                            }}>
                                                Grade {b.qualityGrade}
                                            </span>
                                        </td>
                                        <td style={td}>
                                            {new Date(b.harvestDate).toLocaleDateString()}
                                        </td>
                                        <td
                                            style={{
                                                ...td,
                                                color: "#16a34a",
                                                fontWeight: 600
                                            }}
                                        >
                                            AUTHENTIC
                                        </td>
                                        <td style={td}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 8,
                                                    justifyContent: "center"
                                                }}
                                            >
                                                <button
                                                    disabled={isLoading}
                                                    onClick={() => approveBatch(b.batchId)}
                                                    style={approveBtn(isLoading)}
                                                >
                                                    {isLoading ? "Processing…" : "Approve"}
                                                </button>

                                                <button
                                                    disabled={isLoading}
                                                    onClick={() => rejectBatch(b.batchId)}
                                                    style={rejectBtn(isLoading)}
                                                >
                                                    {isLoading ? "Processing…" : "Reject"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ================= DEBUG PANEL ================= */}
            {showDebug && (
                <div
                    style={{
                        position: "fixed",
                        right: 20,
                        bottom: 20,
                        width: 260,
                        maxHeight: 280,
                        overflowY: "auto",
                        background: "#111827",
                        color: "#e5e7eb",
                        padding: 12,
                        borderRadius: 10,
                        fontSize: 12,
                        zIndex: 999
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 6,
                            fontWeight: 700
                        }}
                    >
                        <span>ADMIN DEBUG</span>
                        <span
                            style={{ cursor: "pointer" }}
                            onClick={() => setShowDebug(false)}
                        >
                            ✕
                        </span>
                    </div>

                    <div>
                        Total pending batches: <b>{batches.length}</b>
                    </div>

                    <ul style={{ paddingLeft: 16, marginTop: 6 }}>
                        {batches.map((b) => (
                            <li key={b.batchId}>{b.batchId}</li>
                        ))}
                    </ul>
                </div>
            )}
        </AdminLayout>
    );
}

/* ================= STYLES ================= */

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

const approveBtn = (loading) => ({
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1
});

const rejectBtn = (loading) => ({
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1
});
