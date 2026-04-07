import { useEffect, useState } from "react";
import api from "../../api/axios";
import Navbar from "../../components/Navbar";
import DistributorSidebar from "../../components/DistributorSidebar";
import DistributorGuard from "../../guards/DistributorGuard";

export default function IncomingShipments() {
    const [open, setOpen] = useState(false);

    const name = localStorage.getItem("roleName");
    const id = localStorage.getItem("roleId");

    return (
        <DistributorGuard>

            <>
                <Navbar />
                <DistributorSidebar
                    open={open}
                    setOpen={setOpen}
                    distributorName={name}
                    distributorId={id}
                />

                <IncomingHome setOpen={setOpen} />
            </>

        </DistributorGuard>
    );
}

/* ================= PAGE CONTENT ================= */

function IncomingHome({ setOpen }) {
    const [shipments, setShipments] = useState([]);
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [confirmModal, setConfirmModal] = useState(null);
    const [typed, setTyped] = useState("");

    const [acknowledged, setAcknowledged] = useState(false);
    const [ownershipModal, setOwnershipModal] = useState(null);
    const [ownershipTyped, setOwnershipTyped] = useState("");

    async function handleConfirm(id) {
        try {
            const roleId = localStorage.getItem("roleId");

            await api.post(
                `/distributor/accept`,
                {
                    batchId: ownershipModal.batchId
                },
                {
                    headers: { "x-role-id": roleId }
                }
            );

            // 🔁 REFRESH DATA
            const res = await api.get(`/distributor/incoming`, {
                headers: { "x-role-id": roleId }
            });

            setShipments(res.data || []);

        } catch (err) {
            console.error(err);
        }
    }

    const [sortConfig, setSortConfig] = useState({
        key: "createdAt",
        direction: "desc"
    });

    async function handlePriceConfirm(shipment) {
        try {
            const roleId = localStorage.getItem("roleId");

            await api.post(
                `/distributor/confirm-base-price`,
                {
                    batchId: shipment.batchId,
                    acceptedBasePrice: shipment.basePrice
                },
                {
                    headers: { "x-role-id": roleId }
                }
            );

            // 🔁 REFRESH DATA
            const res = await api.get(`/distributor/incoming`, {
                headers: { "x-role-id": roleId }
            });

            setShipments(res.data || []);

        } catch (err) {
            console.error(err?.response?.data?.message || "Confirmation failed");
        }
    }

    /* ================= FETCH ================= */

    useEffect(() => {
        async function fetchHistory() {
            try {
                const roleId = localStorage.getItem("roleId");

                const res = await api.get(`/distributor/incoming`, {
                    headers: { "x-role-id": roleId }
                });

                setShipments(res.data || []);
            } catch (err) {
                console.error("History fetch failed:", err);
            }
        }

        fetchHistory();
    }, []);

    /* ================= FILTER ================= */

    const filteredData = shipments.filter(s => {
        const matchSearch =
            s.batchId?.toLowerCase().includes(search.toLowerCase()) ||
            s.cropName?.toLowerCase().includes(search.toLowerCase());

        const arrival = new Date(s.createdAt);

        const matchFrom =
            !fromDate || arrival >= new Date(fromDate);

        const matchTo =
            !toDate || arrival <= new Date(toDate + "T23:59:59");

        return matchSearch && matchFrom && matchTo;
    });

    /* ================= SORT ================= */

    function requestSort(key) {
        let direction = "asc";

        if (
            sortConfig.key === key &&
            sortConfig.direction === "asc"
        ) {
            direction = "desc";
        }

        setSortConfig({ key, direction });
    }

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === "createdAt") {
            valA = new Date(valA);
            valB = new Date(valB);
        }

        if (valA < valB)
            return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB)
            return sortConfig.direction === "asc" ? 1 : -1;

        return 0;
    });



    /* ================= RETURN ================= */

    return (
        <div style={styles.wrapper}>

            {/* FILTER PANEL */}
            <div style={styles.filterPanel}>
                <div style={styles.leftFilter}>
                    <div
                        style={styles.hamburger}
                        onMouseEnter={() => setOpen(true)}
                    >
                        ☰
                    </div>
                    <h2 style={{ margin: 0 }}>
                        Incoming Shipments
                    </h2>
                </div>

                <div style={styles.rightFilter}>

                    <div style={styles.dateSection}>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => setFromDate(e.target.value)}
                            style={styles.dateInput}
                        />

                        <input
                            type="date"
                            value={toDate}
                            onChange={e => setToDate(e.target.value)}
                            style={styles.dateInput}
                        />
                    </div>

                    <input
                        placeholder="Search batch or crop..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={styles.search}
                    />

                    <button
                        onClick={() => downloadCSV(filteredData)}
                        style={styles.downloadBtn}
                    >
                        Download
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div style={styles.card}>
                <table style={styles.table}>
                    <thead style={styles.stickyHeader}>
                        <tr>
                            <th style={styles.th} onClick={() => requestSort("batchId")}>Batch ID</th>
                            <th style={styles.th} onClick={() => requestSort("cropName")}>Crop</th>
                            <th style={styles.th} onClick={() => requestSort("remainingQuantity")}>Quantity</th>
                            <th style={styles.th}>From</th>
                            <th style={styles.th}>Arrival</th>
                            <th style={styles.th}>Integrity</th>
                            <th style={styles.th}>Base Price</th>
                            <th style={styles.th}>Total Cost</th>
                            <th style={styles.th}>Price Confirmation</th>
                            <th style={styles.th}>Action</th>
                            <th style={styles.th} onClick={() => requestSort("createdAt")}>Arrival Time</th>
                            <th style={styles.th}>Transport Charge</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sortedData.map((s, index) => {
                            const fromLocation = s.transporterInvoice?.fromLocation || "—";
                            const arrivalLocation = s.transporterInvoice?.toLocation || "—";
                            const quantity = s.remainingQuantity ?? s.quantity ?? 0;
                            const isSafe = s.integrityStatus !== "TAMPERED";
                            const isPriceConfirmed = !!s.distributorAcceptedBasePrice;

                            return (
                                <tr
                                    key={s._id}
                                    style={{
                                        background: index % 2 === 0 ? "#fff" : "#f9fafb"
                                    }}
                                >
                                    <td style={styles.td}>{s.batchId}</td>
                                    <td style={styles.td}>{s.cropName}</td>

                                    {/* ✅ FIXED QUANTITY */}
                                    <td style={styles.td}>{quantity} kg</td>

                                    {/* ✅ FIXED FROM */}
                                    <td style={styles.td}>{fromLocation}</td>

                                    {/* ✅ FIXED ARRIVAL */}
                                    <td style={styles.td}>{arrivalLocation}</td>

                                    {/* ✅ FIXED INTEGRITY */}
                                    <td style={styles.td}>
                                        <span style={isSafe ? styles.safe : styles.tampered}>
                                            {isSafe ? "SAFE" : "TAMPERED"}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        {s.basePrice ? `₹ ${s.basePrice}` : "Not Assigned"}
                                    </td>
                                    <td style={styles.td}>
                                        ₹ {
                                            ((s.remainingQuantity || s.totalQuantity || 0) *
                                                (s.basePrice || 0)) +
                                            (s.transporterInvoice?.charge || 0)
                                        }
                                    </td>
                                    <td style={styles.td}>
                                        {(() => {
                                            const canConfirmPrice =
                                                s.basePrice &&
                                                s.integrityStatus !== "TAMPERED" &&
                                                s.arrivedAtDistributor === true &&
                                                !s.distributorAcceptedBasePrice;
                                            if (s.distributorAcceptedBasePrice) {
                                                return (
                                                    <span style={styles.safe}>
                                                        CONFIRMED
                                                    </span>
                                                );
                                            }

                                            if (canConfirmPrice) {
                                                return (
                                                    <button
                                                        style={styles.confirmBtn}
                                                        onClick={() => {
                                                            setTyped("");
                                                            setAcknowledged(false);
                                                            setConfirmModal(s);
                                                        }}
                                                    >
                                                        Confirm Price
                                                    </button>
                                                );
                                            }

                                            return (
                                                <button
                                                    style={{
                                                        ...styles.confirmBtn,
                                                        opacity: 0.4,
                                                        cursor: "not-allowed",
                                                        background: "#9ca3af"
                                                    }}
                                                    disabled
                                                    title="Shipment not yet delivered to distributor"
                                                >
                                                    Confirm Price
                                                </button>
                                            );
                                        })()}
                                    </td>

                                    <td style={{ ...styles.td, textAlign: "center" }}>
                                        {s.integrityStatus === "TAMPERED" ? (
                                            <span style={styles.tampered}>REJECTED</span>
                                        ) : s.state === "OWNED_BY_DISTRIBUTOR" ? (
                                            <span style={styles.safe}>RECEIVED</span>
                                        ) : (
                                            <button
                                                style={{
                                                    ...styles.confirmBtn,
                                                    opacity: isPriceConfirmed ? 1 : 0.4,
                                                    cursor: isPriceConfirmed ? "pointer" : "not-allowed",
                                                    background: isPriceConfirmed ? "#2563eb" : "#9ca3af"
                                                }}
                                                disabled={!isPriceConfirmed}
                                                title={
                                                    !isPriceConfirmed
                                                        ? "Please confirm base price first"
                                                        : "Confirm shipment ownership"
                                                }
                                                onClick={() => {
                                                    if (!isPriceConfirmed) return;

                                                    setOwnershipTyped("");
                                                    setOwnershipModal(s);
                                                }}
                                            >
                                                Confirm
                                            </button>
                                        )}
                                    </td>

                                    <td style={styles.td}>
                                        {new Date(s.createdAt).toLocaleString()}
                                    </td>
                                    <td style={styles.td}>
                                        ₹ {s.transporterInvoice?.charge || 0}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {!sortedData.length && (
                    <p style={styles.empty}>No shipment history found</p>
                )}
            </div>
            {confirmModal && (() => {
                const quantity = confirmModal.remainingQuantity ?? confirmModal.totalQuantity ?? 0;
                const basePrice = confirmModal.basePrice || 0;
                const transportCharge = confirmModal.transporterInvoice?.charge || 0;
                const originalCharge = confirmModal.originalSnapshot?.transporterInvoice?.charge || 0;

                const isTampered = originalCharge !== transportCharge;

                const goodsCost = quantity * basePrice;
                const totalCost = goodsCost + transportCharge;

                return (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modalBox}>
                            <h3>Confirm Base Price</h3>

                            <p><strong>Batch:</strong> {confirmModal.batchId}</p>

                            <hr style={{ margin: "12px 0" }} />

                            <p><strong>Quantity:</strong> {quantity} kg</p>
                            <p><strong>Base Price:</strong> ₹ {basePrice} / kg</p>

                            <p>
                                <strong>Goods Cost:</strong> ₹ {goodsCost.toFixed(2)}
                            </p>

                            <p>
                                <strong>Transport Charge:</strong> ₹ {transportCharge.toFixed(2)}
                            </p>

                            {isTampered && (
                                <p style={{
                                    color: "#dc2626",
                                    fontSize: 15,
                                    marginTop: 4,
                                    fontWeight: 600
                                }}>
                                    Transport Charge Tampered: ₹ {originalCharge} To ₹ {transportCharge}
                                </p>
                            )}

                            {isTampered && (
                                <div style={{
                                    marginTop: 10,
                                    padding: 10,
                                    borderRadius: 8,
                                    background: "#fef3c7",
                                    border: "1px solid #f59e0b"
                                }}>
                                    <p style={{
                                        color: "#b45309",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        margin: 0
                                    }}>
                                        Warning: Transport charge has been modified.
                                    </p>

                                    <p style={{
                                        color: "#92400e",
                                        fontSize: 12,
                                        marginTop: 4
                                    }}>
                                        By confirming, you accept the updated charge.
                                        The system will not be responsible for any loss due to tampering.
                                    </p>
                                </div>
                            )}

                            <hr style={{ margin: "12px 0" }} />

                            <p style={{ fontSize: 16, fontWeight: 700 }}>
                                Total Payable: ₹ {totalCost.toFixed(2)}
                            </p>

                            <p style={{ marginTop: 12 }}>
                                Type <b>CONFIRM</b> to proceed:
                            </p>
                            {isTampered && (
                                <label style={{ display: "block", marginTop: 10 }}>
                                    <input
                                        type="checkbox"
                                        checked={acknowledged}
                                        onChange={() => setAcknowledged(!acknowledged)}
                                    />
                                    <span style={{ marginLeft: 6, fontSize: 13 }}>
                                        I understand and accept the modified transport charge
                                    </span>
                                </label>
                            )}

                            <input
                                type="text"
                                value={typed}
                                onChange={(e) => setTyped(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: 8,
                                    marginTop: 8,
                                    borderRadius: 6,
                                    border: "1px solid #d1d5db"
                                }}
                            />

                            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                                <button
                                    style={{
                                        ...styles.confirmBtn,
                                        opacity:
                                            typed === "CONFIRM" &&
                                                (!isTampered || acknowledged)
                                                ? 1
                                                : 0.5,
                                        cursor:
                                            typed === "CONFIRM" &&
                                                (!isTampered || acknowledged)
                                                ? "pointer"
                                                : "not-allowed"
                                    }}
                                    disabled={
                                        typed !== "CONFIRM" ||
                                        (isTampered && !acknowledged)
                                    }
                                    onClick={async () => {
                                        await handlePriceConfirm(confirmModal);
                                        setTyped("");
                                        setConfirmModal(null);
                                    }}
                                >
                                    Final Confirm
                                </button>

                                <button
                                    style={{
                                        ...styles.confirmBtn,
                                        background: "#6b7280"
                                    }}
                                    onClick={() => {
                                        setTyped("");
                                        setConfirmModal(null);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
            {ownershipModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalBox}>

                        <h3>Confirm Ownership</h3>

                        <p>
                            <strong>Batch:</strong> {ownershipModal.batchId}
                        </p>

                        <hr style={{ margin: "12px 0" }} />

                        <p style={{ fontSize: 14 }}>
                            By confirming, you will become the <b>owner of this shipment</b>.
                        </p>

                        <div style={{
                            marginTop: 10,
                            padding: 12,
                            borderRadius: 8,
                            background: "#fef3c7",
                            border: "1px solid #f59e0b"
                        }}>
                            <p style={{
                                color: "#b45309",
                                fontSize: 13,
                                fontWeight: 600,
                                margin: 0
                            }}>
                                Responsibility Notice
                            </p>

                            <p style={{
                                color: "#92400e",
                                fontSize: 12,
                                marginTop: 6
                            }}>
                                You are responsible for:
                                <br />• Product condition
                                <br />• Quantity verification
                                <br />• Any loss or damage after acceptance
                            </p>
                        </div>

                        <p style={{ marginTop: 12 }}>
                            Type <b>ACCEPT</b> to proceed:
                        </p>

                        <input
                            type="text"
                            value={ownershipTyped}
                            onChange={(e) => setOwnershipTyped(e.target.value)}
                            style={{
                                width: "100%",
                                padding: 8,
                                marginTop: 8,
                                borderRadius: 6,
                                border: "1px solid #d1d5db"
                            }}
                        />

                        <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                            <button
                                style={{
                                    ...styles.confirmBtn,
                                    opacity: ownershipTyped === "ACCEPT" ? 1 : 0.5,
                                    cursor: ownershipTyped === "ACCEPT" ? "pointer" : "not-allowed"
                                }}
                                disabled={ownershipTyped !== "ACCEPT"}
                                onClick={async () => {
                                    await handleConfirm(ownershipModal._id);
                                    setOwnershipModal(null);
                                    setOwnershipTyped("");
                                }}
                            >
                                Accept & Confirm
                            </button>

                            <button
                                style={{
                                    ...styles.confirmBtn,
                                    background: "#6b7280"
                                }}
                                onClick={() => {
                                    setOwnershipModal(null);
                                    setOwnershipTyped("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

/* ================= CSV ================= */

function downloadCSV(data) {
    if (!data.length) return;

    const headers = [
        "Batch ID",
        "Crop",
        "Quantity",
        "From",
        "Arrival",
        "Integrity",
        "Arrival Time"
    ];

    const rows = data.map(s => [
        s.batchId,
        s.cropName,
        s.remainingQuantity ?? s.quantity ?? 0,
        s.transporterInvoice?.fromLocation || "",
        s.transporterInvoice?.toLocation || "",
        s.integrityStatus === "AUTHENTIC" ? "SAFE" : "TAMPERED",
        new Date(s.createdAt).toLocaleString()
    ]);

    const csvContent =
        [headers, ...rows]
            .map(e => e.join(","))
            .join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "incoming_shipment_history.csv";
    link.click();
}


/* ================= STYLES ================= */

const styles = {
    wrapper: {
        padding: "24px 40px",
        background: "#f3f4f6",
        minHeight: "100vh",
        overflowY: "auto"
    },

    /* ===== FILTER PANEL ===== */

    filterPanel: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        gap: 20
    },
    dateSection: {
        display: "flex",
        gap: 12,
        marginTop: 0   // 👈 controls vertical position
    },

    leftFilter: {
        display: "flex",
        alignItems: "center",
        gap: 14
    },

    rightFilter: {
        display: "flex",
        alignItems: "center",
        gap: 12,
    },

    confirmBtn: {
        padding: "7px 14px",
        background: "#2563eb",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        transition: "all 0.2s ease"
    },

    hamburger: {
        fontSize: 22,
        cursor: "pointer"
    },

    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
    },

    modalBox: {
        background: "#fff",
        padding: 30,
        borderRadius: 16,
        width: 520,
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
    },

    search: {
        padding: 10,
        width: 240,
        borderRadius: 8,
        border: "1px solid #d1d5db",
        background: "#fff"
    },

    dateInput: {
        padding: 10,
        borderRadius: 8,
        border: "1px solid #d1d5db",
        background: "#fff"
    },

    downloadBtn: {
        padding: "10px 16px",
        background: "#14532d",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 600
    },

    /* ===== SUMMARY BAR ===== */

    summaryBar: {
        display: "flex",
        gap: 20,
        marginBottom: 20
    },

    summaryItem: {
        background: "#ffffff",
        padding: "16px 22px",
        borderRadius: 14,
        boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
        minWidth: 200
    },

    summaryLabel: {
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 6
    },

    summaryValue: {
        fontSize: 20,
        fontWeight: 700,
        color: "#14532d"
    },

    /* ===== TABLE ===== */

    card: {
        background: "#ffffff",
        borderRadius: 18,
        boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
        maxHeight: "75vh",
        overflow: "auto",              // 👈 enable both vertical + horizontal
        border: "1px solid #e5e7eb"
    },

    table: {
        width: "100%",
        minWidth: "1200px",          // 👈 ensures table does not squeeze
        borderCollapse: "collapse"
    },

    stickyHeader: {
        position: "sticky",
        top: 0,
        zIndex: 5,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
    },

    th: {
        background: "#14532d",
        color: "#fff",
        padding: "16px 14px",
        fontWeight: 600,
        fontSize: 13,
        textAlign: "center",
        letterSpacing: "0.4px",
        whiteSpace: "nowrap"
    },

    td: {
        padding: "14px 14px",
        fontSize: 13,
        borderBottom: "1px solid #f1f5f9",
        textAlign: "center"
    },

    safe: {
        display: "inline-flex",          // 👈 important
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        background: "#16a34a",
        color: "#fff",
        padding: "6px 14px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap"
    },

    tampered: {
        background: "#dc2626",
        color: "#fff",
        padding: "6px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600
    },

    empty: {
        textAlign: "center",
        padding: 30,
        color: "#6b7280"
    }
};