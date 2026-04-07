import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";
import StatusBadge from "../components/StatusBadge";

import api from "../api/axios";
import { DISTRICTS } from "../data/districts";

import TransporterSidebar from "../components/TransporterSidebar";

function TransporterAssignedShipments() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const transporterId = localStorage.getItem("roleId");
    const transporterName = localStorage.getItem("roleName");

    const [assigned, setAssigned] = useState([]);
    const [selected, setSelected] = useState(null);

    const [formData, setFormData] = useState({
        status: "",
        location: ""
    });

    const [loading, setLoading] = useState(false);

    /* ================= FETCH ================= */

    const fetchAssigned = async () => {
        if (!transporterId) return;

        try {
            const res = await api.get(
                `/shipments/transporter/${transporterId}`
            );

            const normalized = (res.data || []).map((s) => ({
                ...s,
                shipmentKey: s.shipmentId || s._id,
                shipmentSessionId: s.shipmentSessionId || null
            }));

            setAssigned(normalized);

        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    useEffect(() => {
        if (!transporterId) {
            navigate("/auth");
            return;
        }

        fetchAssigned();

    }, [transporterId, navigate]);

    /* ================= SELECT ================= */

    const selectShipment = (s) => {
        setSelected(s);
        setFormData({
            status: "",
            location: ""
        });
    };

    /* ================= SUBMIT ================= */

    const submitUpdate = async (e) => {
        e.preventDefault();

        if (!selected) {
            alert("Select a shipment first");
            return;
        }

        if (!formData.status || !formData.location) {
            alert("Fill all fields");
            return;
        }

        try {
            setLoading(true);

            await api.post("/shipments/update", {
                batchId: selected.batchId,
                shipmentSessionId: selected.shipmentSessionId,
                handlerRole: "TRANSPORTER",
                handlerId: transporterId,
                status: formData.status,
                location: formData.location
            });

            alert("Shipment updated");

            setSelected(null);
            setFormData({
                status: "",
                location: ""
            });

            fetchAssigned();

        } catch (err) {
            alert(
                err?.response?.data?.message ||
                "Update failed"
            );
        } finally {
            setLoading(false);
        }
    };

    /* ================= PROGRESS ================= */

    const progress = (status) => {
        if (status === "ASSIGNED_TO_TRANSPORTER") return 10;
        if (status === "PICKED_UP") return 33;
        if (status === "IN_TRANSIT") return 66;
        if (status === "DELIVERED") return 100;
        return 0;
    };

    const isCompleted = selected?.status === "DELIVERED";

    const Content = (
        <div style={styles.grid}>

            {/* LEFT PANEL */}
            <div style={styles.card}>
                <h2 style={styles.heading}>
                    Assigned Shipment Update
                </h2>

                <p style={styles.subheading}>
                    Update delivery status using shipment ID
                </p>

                {isCompleted && (
                    <p style={{ color: "red", fontWeight: 600 }}>
                        Shipment already completed.
                    </p>
                )}

                <form style={styles.form} onSubmit={submitUpdate}>
                    <input
                        style={{ ...styles.input, background: "#f1f5f9" }}
                        value={transporterName || ""}
                        readOnly
                    />

                    <input
                        style={{ ...styles.input, background: "#f1f5f9" }}
                        value={selected?.shipmentKey || ""}
                        placeholder="Select shipment from right"
                        readOnly
                    />

                    <select
                        style={styles.input}
                        value={formData.status}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                status: e.target.value
                            })
                        }
                        required
                        disabled={isCompleted}
                    >
                        <option value="">Select Status</option>
                        <option value="PICKED_UP">Picked Up</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="DELIVERED">Delivered</option>
                    </select>

                    <select
                        style={styles.input}
                        value={formData.location}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                location: e.target.value
                            })
                        }
                        required
                        disabled={isCompleted}
                    >
                        <option value="">
                            Select Current District
                        </option>

                        {DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        style={styles.submitBtn}
                        disabled={
                            loading ||
                            !selected ||
                            isCompleted
                        }
                    >
                        {loading ? "Updating..." : "Submit Update"}
                    </button>
                </form>
            </div>

            {/* RIGHT PANEL */}
            <div style={styles.recentCard}>
                <h3 style={styles.recentHeading}>
                    Assigned Shipments
                </h3>

                {!assigned.length && (
                    <p style={styles.empty}>
                        No assigned shipments
                    </p>
                )}

                {assigned.map((s) => {
                    const p = progress(s.status);

                    return (
                        <div
                            key={s.shipmentKey}
                            style={{
                                ...styles.recentRow,
                                background:
                                    selected?.shipmentKey === s.shipmentKey
                                        ? "#f0fdf4"
                                        : "#fff"
                            }}
                            onClick={() => selectShipment(s)}
                        >
                            <div style={{ minWidth: 300 }}>

                                <div style={styles.batchId}>
                                    SHIPMENT — {s.shipmentKey}
                                </div>

                                <div style={styles.crop}>
                                    Crop: {s.cropName || "Unknown"}
                                </div>

                                <div style={styles.subInfo}>
                                    Batch: {s.batchId}
                                </div>

                                <div style={styles.subInfo}>
                                    Quantity: {s.shipmentQuantity || 0} kg
                                </div>
                            </div>

                            <div style={styles.progressWrap}>
                                <div style={styles.progressLine}>
                                    <div
                                        style={{
                                            ...styles.progressFill,
                                            width: `${p}%`
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={styles.statusBlock}>
                                <StatusBadge status={s.status} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <>
            <Navbar />

            <TransporterSidebar
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen}
            />

            {/* ✅ Hamburger outside wrapper for exact alignment */}
            <div style={styles.hamburgerWrap}>
                <button
                    style={styles.hamburger}
                    onMouseEnter={() => setDrawerOpen(true)}
                    onClick={() => setDrawerOpen(true)}
                    onFocus={(e) => e.target.blur()}
                >
                    ☰
                </button>
            </div>

            <PageWrapper>
                <div style={styles.centerWrap}>
                    {Content}
                </div>
            </PageWrapper>
        </>
    );
}

/* ================= STYLES ================= */

const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: 32,
        width: "100%",
        maxWidth: 2000
    },

    topBar: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 20
    },

    centerWrap: {
        marginTop: 60,
        display: "flex",
        justifyContent: "center"
    },

    hamburger: {
        fontSize: 28,
        width: 28,
        height: 28,
        background: "transparent",
        border: "none",
        outline: "none",
        color: "#14532d",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s ease, color 0.2s ease"
    },

    hamburgerWrap: {
        position: "fixed",
        top: 105,
        left: 43,
        zIndex: 1000
    },

    card: {
        background: "#fff",
        padding: 32,
        borderRadius: 14,
        border: "1px solid #e5e7eb"
    },

    heading: {
        fontSize: 24,
        fontWeight: 700,
        textAlign: "center"
    },

    subheading: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 24,
        textAlign: "center"
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: 14
    },

    input: {
        padding: 12,
        borderRadius: 6,
        border: "1px solid #cbd5e1"
    },

    submitBtn: {
        padding: "10px 22px",
        background: "#14532d",
        color: "#fff",
        borderRadius: 6,
        border: "none",
        fontWeight: 600,
        cursor: "pointer"
    },

    recentCard: {
        background: "#fff",
        padding: 24,
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        maxHeight: "450px",
        overflowY: "auto"
    },

    recentHeading: {
        fontWeight: 700,
        fontSize: 16,
        marginBottom: 18
    },

    recentRow: {
        display: "grid",
        gridTemplateColumns: "380px 1fr 160px",
        alignItems: "center",
        gap: 16,
        padding: "20px 0",
        borderBottom: "2px solid #e2e8f0",
        cursor: "pointer"
    },

    batchId: {
        fontWeight: 700,
        fontSize: 14
    },

    subInfo: {
        fontSize: 12,
        color: "#64748b"
    },

    statusBlock: {
        display: "flex",
        justifyContent: "flex-end"
    },

    crop: {
        fontSize: 13,
        fontWeight: 600,
        color: "#14532d",
        marginTop: 2
    },

    progressWrap: {
        width: "85%",
        marginLeft: "auto"
    },

    progressLine: {
        height: 6,
        background: "#e5e7eb",
        borderRadius: 4,
        overflow: "hidden"
    },

    progressFill: {
        height: "100%",
        background: "#16a34a",
        borderRadius: 4,
        transition: "0.4s"
    },

    empty: {
        textAlign: "center",
        color: "#94a3b8"
    }
};

export default TransporterAssignedShipments;
