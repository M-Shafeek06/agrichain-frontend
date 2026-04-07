import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import DistributorSidebar from "../../components/DistributorSidebar";
import DistributorGuard from "../../guards/DistributorGuard";

export default function DistributorInvoice() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [open, setOpen] = useState(false);
    const [transporters, setTransporters] = useState([]);
    const [history, setHistory] = useState([]);
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const roleId = localStorage.getItem("roleId");
    const [showPreview, setShowPreview] = useState(false);

    const today = new Date().toISOString().split("T")[0];
    const [dateWarning, setDateWarning] = useState("");

    const minTransportDate = shipment?.distributorAcceptedAt
        ? new Date(shipment.distributorAcceptedAt).toISOString().split("T")[0]
        : today;

    const [invoice, setInvoice] = useState({
        transporterName: "",
        transporterId: "",
        vehicleNumber: "",
        transportDate: today,
        charge: ""
    });

    const chargeValue = Number(invoice.charge);

    useEffect(() => {
        if (shipment?.distributorAcceptedAt) {

            const minDate = new Date(shipment.distributorAcceptedAt)
                .toISOString()
                .split("T")[0];

            setInvoice(prev => ({
                ...prev,
                transportDate: minDate
            }));
        }
    }, [shipment]);

    /* ================= AUTH CHECK ================= */

    useEffect(() => {
        if (!roleId) {
            alert("Session expired. Please login again.");
            navigate("/auth");
        }
    }, [roleId, navigate]);

    /* ================= FETCH TRANSPORTERS ================= */

    useEffect(() => {
        let mounted = true;

        const fetchTransporters = async () => {
            try {
                const res = await api.get("/transporter/support-info");

                if (mounted) {
                    setTransporters(Array.isArray(res.data) ? res.data : []);
                }
            } catch (err) {
                console.error("Transporter fetch error:", err);
            }
        };

        fetchTransporters();

        return () => {
            mounted = false;
        };
    }, []);

    /* ================= FETCH SHIPMENT + HISTORY ================= */

    useEffect(() => {
        let mounted = true;

        const fetchShipments = async () => {
            if (!roleId) return;

            try {
                setLoading(true);

                const res = await api.get("/distributor/dispatch", {
                    headers: { "x-role-id": roleId }
                });

                const data = Array.isArray(res.data) ? res.data : [];

                if (!mounted) return;

                setHistory(data);

                const selected = data.find(
                    s => String(s.requestId) === String(id)
                );

                if (selected) {
                    console.log("basePrice:", selected.basePrice);
                    console.log("distributorAcceptedBasePrice:", selected.distributorAcceptedBasePrice);
                    console.log("requestedQty:", selected.requestedQty);
                }

                setShipment(selected || null);

            } catch (err) {
                console.error("Shipment fetch error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchShipments();

        return () => {
            mounted = false;
        };
    }, [id, roleId]);

    /* ================= TRANSPORTER SELECT ================= */

    const handleTransporterChange = e => {
        const selectedId = e.target.value;
        const t = transporters.find(x => x.roleId === selectedId);

        if (!t) return;

        setInvoice(prev => ({
            ...prev,
            transporterName: t.name,
            transporterId: t.roleId,
            vehicleNumber: t.vehicleNumber || "Not Available"
        }));
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = () => {

        if (submitting) return;

        if (!shipment) {
            alert("No shipment selected");
            return;
        }

        if (!invoice.transporterId || !invoice.charge) {
            alert("Please fill all required fields");
            return;
        }

        if (!Number.isInteger(chargeValue)) {
            alert("Charge must be a whole number");
            return;
        }

        if (chargeValue < 750 || chargeValue > 10000) {
            alert("Transport charge must be between ₹750 and ₹10,000");
            return;
        }

        // ✅ ONLY OPEN PREVIEW
        setShowPreview(true);
    };

    const confirmSubmit = async () => {
        try {
            setSubmitting(true);

            const token = localStorage.getItem("token");

            await api.post(
                `/distributor/dispatch/${shipment.requestId}`,
                invoice,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-role-id": roleId
                    }
                }
            );

            setShowPreview(false);

            // clean redirect
            navigate("/distributor/dispatch");

        } catch (err) {
            alert(err?.response?.data?.message || "Dispatch failed");
        } finally {
            setSubmitting(false);
        }
    };

    /* ================= DOWNLOAD ================= */

    const handleDownload = shipmentId => {
        const backendURL = api.defaults.baseURL;

        window.open(
            `${backendURL}/distributor/invoice/${shipmentId}`,
            "_blank"
        );
    };

    const requestedQty = shipment?.requestedQty || 0;

    const basePrice =
        shipment?.distributorAcceptedBasePrice ??
        shipment?.basePrice ??
        0;

    const PROFIT_PERCENT = 0.15;

    const baseGoodsAmount = requestedQty * basePrice;
    const goodsAmount = baseGoodsAmount + (baseGoodsAmount * PROFIT_PERCENT);
    const profitAmount = baseGoodsAmount * PROFIT_PERCENT;

    const transportCharge = Number(invoice.charge || 0);

    const totalAmount =
        goodsAmount +
        transportCharge;

    return (
        <DistributorGuard>

            <>
                <Navbar />
                <DistributorSidebar open={open} setOpen={setOpen} />

                <div style={styles.wrapper}>

                    <button
                        style={styles.back}
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </button>

                    <div style={styles.container}>
                        <div style={styles.card}>

                            <h2 style={styles.title}>Create Dispatch Invoice</h2>

                            <div style={styles.contentRow}>

                                {/* LEFT SIDE - FORM */}
                                <div style={styles.leftForm}>

                                    <label style={styles.label}>Transporter</label>
                                    <select
                                        value={invoice.transporterId}
                                        onChange={handleTransporterChange}
                                        style={styles.select}
                                    >
                                        <option value="">Select transporter</option>
                                        {transporters.map(t => (
                                            <option key={t.roleId} value={t.roleId}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>

                                    <label style={styles.label}>Transporter ID</label>
                                    <input
                                        value={invoice.transporterId}
                                        readOnly
                                        style={styles.input}
                                    />

                                    <label style={styles.label}>Vehicle Number</label>
                                    <input
                                        value={invoice.vehicleNumber}
                                        readOnly
                                        style={styles.input}
                                    />

                                    <label style={styles.label}>Transport Date</label>
                                    <input
                                        type="date"
                                        value={invoice.transportDate}
                                        min={minTransportDate}
                                        max={today}
                                        onChange={e => {

                                            const selectedDate = e.target.value;

                                            setInvoice(prev => ({
                                                ...prev,
                                                transportDate: selectedDate
                                            }));

                                            if (selectedDate < minTransportDate) {
                                                setDateWarning(
                                                    "Transport date cannot be before distributor acceptance date."
                                                );
                                                return;
                                            }

                                            if (selectedDate > today) {
                                                setDateWarning(
                                                    "Transport date cannot be in the future."
                                                );
                                                return;
                                            }

                                            setDateWarning("");
                                        }}
                                        style={styles.input}
                                    />
                                    {dateWarning && (
                                        <div style={styles.warning}>
                                            ⚠ {dateWarning}
                                        </div>
                                    )}

                                    <label style={styles.label}>Charge (₹)</label>
                                    <input
                                        type="number"
                                        max="10000"
                                        min="750"
                                        step="1"
                                        value={invoice.charge}
                                        inputMode="numeric"
                                        onKeyDown={(e) => {
                                            if (e.key === "." || e.key === "e") {
                                                e.preventDefault(); // 🚫 block decimals
                                            }
                                        }}
                                        onChange={(e) => {
                                            let value = e.target.value;

                                            // allow only digits
                                            if (!/^\d*$/.test(value)) return;

                                            if (value === "") {
                                                setInvoice(prev => ({ ...prev, charge: "" }));
                                                return;
                                            }

                                            const num = Number(value);

                                            if (num > 10000) {
                                                alert("Transport charge cannot exceed ₹10,000");
                                                return;
                                            }

                                            setInvoice(prev => ({
                                                ...prev,
                                                charge: value
                                            }));
                                        }}
                                        style={styles.input}
                                    />

                                    <div style={styles.buttonWrap}>
                                        <button
                                            style={styles.submit}
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                        >
                                            {submitting ? "Submitting..." : "Submit Invoice"}
                                        </button>
                                    </div>

                                </div>

                                {/* RIGHT SIDE - GREEN INFO BOX */}
                                {shipment && (
                                    <div style={styles.rightInfo}>
                                        {/* ===== BASIC INFO ===== */}
                                        <div><b>Batch:</b> {shipment.batchId}</div>
                                        <div><b>Crop:</b> {shipment.cropName}</div>

                                        <hr style={styles.divider} />

                                        {/* ===== QUANTITY & PRICE ===== */}
                                        <div><b>Requested Qty:</b> {requestedQty} kg</div>
                                        <div><b>Base Price:</b> ₹ {basePrice.toFixed(2)} / kg</div>

                                        <hr style={styles.divider} />

                                        {/* ===== COST BREAKDOWN ===== */}
                                        <div><b>Base Goods Cost:</b> ₹ {baseGoodsAmount.toFixed(2)}</div>

                                        <div style={{
                                            color: "#16a34a",
                                            fontWeight: "600"
                                        }}>
                                            <b>Distributor Profit (15%):</b> ₹ {profitAmount.toFixed(2)}
                                        </div>

                                        <div><b>Goods Amount (Final):</b> ₹ {goodsAmount.toFixed(2)}</div>

                                        <div><b>Transport Charge:</b> ₹ {transportCharge.toFixed(2)}</div>

                                        <hr style={styles.divider} />

                                        <div style={styles.totalRow}>
                                            <b>Total Payable:</b> ₹ {totalAmount.toFixed(2)}
                                        </div>

                                        <hr style={styles.divider} />

                                        {/* ===== STATUS ===== */}
                                        <div><b>Status:</b> {shipment.status}</div>
                                    </div>
                                )}

                            </div>

                        </div>
                    </div>
                </div>
                {showPreview && (
                    <div style={modalOverlay}>
                        <div style={modalBox}>

                            <h3 style={{ marginBottom: 10 }}>Review Invoice</h3>

                            <div style={{ fontSize: 13, lineHeight: "22px" }}>
                                <b>Batch:</b> {shipment?.batchId} <br />
                                <b>Crop:</b> {shipment?.cropName} <br />

                                <hr />

                                <b>Transporter:</b> {invoice.transporterName} <br />
                                <b>Vehicle:</b> {invoice.vehicleNumber} <br />
                                <b>Date:</b> {invoice.transportDate} <br />

                                <hr />

                                <b>Base Cost:</b> ₹{baseGoodsAmount.toFixed(2)} <br />
                                <b>Profit (15%):</b> ₹{profitAmount.toFixed(2)} <br />
                                <b>Goods Amount:</b> ₹{goodsAmount.toFixed(2)} <br />
                                <b>Transport Charge:</b> ₹{invoice.charge} <br />
                                <b>Total Payable:</b> ₹{totalAmount.toFixed(2)}
                            </div>

                            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    style={cancelBtn}
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={confirmSubmit}
                                    style={confirmBtn}
                                >
                                    Confirm & Submit
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>

        </DistributorGuard>
    );
}

/* ================= STYLES ================= */
const styles = {

    wrapper: {
        padding: "24px 30px",
        background: "#f3f6f4",
        minHeight: "calc(100vh - 80px)"
    },

    back: {
        background: "none",
        border: "none",
        color: "#065f46",
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 15,
        cursor: "pointer"
    },

    container: {
        display: "flex",
        justifyContent: "center"
    },

    card: {
        width: "100%",
        maxWidth: 900,
        background: "#ffffff",
        padding: 32,
        borderRadius: 16,
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb"
    },

    title: {
        fontSize: 22,
        fontWeight: 700,
        marginBottom: 25,
        color: "#1f2937"
    },

    /* NEW ROW LAYOUT */

    contentRow: {
        display: "flex",
        alignItems: "flex-start",
        gap: 40
    },

    divider: {
        margin: "8px 0",
        border: "none",
        borderTop: "1px solid #bbf7d0"
    },

    totalRow: {
        fontWeight: 700,
        fontSize: 14,
        color: "#065f46"
    },

    leftForm: {
        flex: 1,
        maxWidth: 460
    },

    rightInfo: {
        width: 280,
        background: "#ecfdf5",
        padding: "16px 18px",
        borderRadius: 12,
        fontSize: 13,
        lineHeight: "1.8",
        border: "1px solid #bbf7d0",
        marginTop: 58   // <-- THIS aligns with Transporter ID field
    },

    label: {
        display: "block",
        marginBottom: 4,
        fontSize: 12.5,
        fontWeight: 600,
        color: "#374151"
    },

    input: {
        width: "100%",
        height: 40,
        padding: "0 12px",
        marginBottom: 16,
        borderRadius: 8,
        border: "1px solid #d1d5db",
        fontSize: 13,
        boxSizing: "border-box"
    },

    warning: {
        color: "#c62828",
        fontSize: 12,
        marginTop: -10,
        marginBottom: 12,
        fontWeight: 500
    },

    select: {
        width: "100%",
        height: 40,
        padding: "0 12px",
        marginBottom: 16,
        borderRadius: 8,
        border: "1px solid #d1d5db",
        fontSize: 13,
        backgroundColor: "#fff",
        boxSizing: "border-box"
    },

    buttonWrap: {
        textAlign: "center",
        marginTop: 10
    },

    submit: {
        padding: "10px 26px",
        background: "#15803d",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer"
    }
};

const modalOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999
};

const modalBox = {
    background: "#fff",
    padding: 25,
    borderRadius: 12,
    width: 350,
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
};

const cancelBtn = {
    flex: 1,
    padding: "8px",
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#f3f4f6",
    cursor: "pointer"
};

const confirmBtn = {
    flex: 1,
    padding: "8px",
    borderRadius: 6,
    border: "none",
    background: "#16a34a",
    color: "#fff",
    cursor: "pointer"
};