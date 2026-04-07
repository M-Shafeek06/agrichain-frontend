import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import transporterAvatar from "../assets/transporter.png";
import "./FarmerDashboard.css";

export default function UploadInvoice() {
    const navigate = useNavigate();
    const location = useLocation();

    const roleId = localStorage.getItem("roleId");
    const roleName = localStorage.getItem("roleName");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [profile, setProfile] = useState({
        name: "",
        vehicleNumber: "",
        vehicleType: "",
        capacity: "",
        location: ""
    });

    const [distributors, setDistributors] = useState([]);
    const [fromLocation, setFromLocation] = useState("");
    const [harvestDate, setHarvestDate] = useState("");

    const [dateError, setDateError] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        batchId: "",
        transportDate: "",
        charge: "",
        distributorId: "",
        distributorName: "",
        distributorLocation: ""
    });

    /* ================= FETCH TRANSPORTER ================= */
    useEffect(() => {
        if (!roleId) return;

        api.get(`/profile/${roleId}`)
            .then(res => {
                setProfile({
                    name: res?.data?.name || "",
                    vehicleNumber: res?.data?.vehicleNumber || "",
                    vehicleType: res?.data?.vehicleType || "—",
                    capacity: res?.data?.capacity || "—",
                    location: res?.data?.location || ""
                });
            })
            .catch(err => console.error("Profile fetch failed:", err));
    }, [roleId]);

    /* ================= FETCH DISTRIBUTORS ================= */
    useEffect(() => {
        api.get("/distributor/list")
            .then(res => {
                console.log("Distributors API:", res.data);
                setDistributors(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => {
                console.error("Distributor fetch failed:", err);
                setDistributors([]);
            });
    }, []);

    /* ================= FETCH FARMER LOCATION ================= */
    useEffect(() => {
        if (!form.batchId) {
            setFromLocation("");
            return;
        }

        api.get(`/transporter/batch-location/${form.batchId}`)
            .then(res => {
                setFromLocation(res?.data?.fromLocation || "");
                setHarvestDate(res?.data?.harvestDate || "");
            })
            .catch(() => {
                setFromLocation("");
                setHarvestDate("");
            });
    }, [form.batchId]);

    /* ================= HANDLE INPUT ================= */
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "charge") {

            if (value.includes(".")) {
                return;
            }

            if (!/^\d*$/.test(value)) {
                return;
            }

            setForm(prev => ({ ...prev, charge: value }));

            if (value === "") {
                setMessage("");
                return;
            }

            const charge = Number(value);

            if (!Number.isInteger(charge)) {
                setMessage("Only whole numbers are allowed");
                return;
            }

            if (charge < 750 || charge > 10000) {
                setMessage("Transport charge must be between ₹750 and ₹10,000");
            } else {
                setMessage("");
            }

            return;
        }

        if (name === "distributorId") {
            const selected = distributors.find(d => d.roleId === value);

            setForm(prev => ({
                ...prev,
                distributorId: value,
                distributorName: selected?.name || "",
                distributorLocation: selected?.location || ""
            }));
            return;
        }

        setForm(prev => ({ ...prev, [name]: value }));
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage("");

        if (
            !form.batchId?.trim() ||
            !form.transportDate ||
            !form.charge ||
            !form.distributorId
        ) {
            setMessage("All required fields must be filled");
            return;
        }

        if (dateError) {
            setMessage("Please select a valid transport date");
            return;
        }

        const charge = Number(form.charge);

        if (!Number.isInteger(charge)) {
            setMessage("Transport charge must be a whole number");
            return;
        }

        if (charge < 750 || charge > 10000) {
            setMessage("Transport charge must be between ₹750 and ₹10,000");
            return;
        }

        if (!profile?.name || !profile?.vehicleNumber) {
            setMessage("Transporter profile incomplete");
            return;
        }

        // ✅ ONLY OPEN MODAL
        setShowConfirm(true);
    };

    const confirmUpload = async () => {
        try {
            setLoading(true);

            const payload = {
                transporterName: profile.name,
                transporterId: roleId,
                vehicleNumber: profile.vehicleNumber,
                transportDate: form.transportDate,
                charge: Number(form.charge),
                distributorId: form.distributorId,
                distributorName: form.distributorName,
                distributorLocation: form.distributorLocation
            };

            await api.post(
                `/transporter/invoice/${form.batchId.trim()}`,
                payload
            );

            setMessage("Invoice uploaded successfully");

            setForm({
                batchId: "",
                transportDate: "",
                charge: "",
                distributorId: "",
                distributorName: "",
                distributorLocation: ""
            });

            setFromLocation("");
            setShowConfirm(false);

        } catch (err) {
            setMessage(
                err?.response?.data?.message ||
                "Upload failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const maxDate = formatDate(today);

    useEffect(() => {
        if (!form.transportDate || !harvestDate) return;

        // ✅ FORCE BOTH DATES INTO SAME FORMAT (NO TIMEZONE ISSUE)
        const selectedDate = new Date(form.transportDate + "T00:00:00");
        const harvest = new Date(harvestDate.split("T")[0] + "T00:00:00");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (
            selectedDate < harvest ||
            selectedDate > today
        ) {
            setDateError("Invalid date: must be between harvest date and today");
        } else {
            setDateError("");
        }

    }, [form.transportDate, harvestDate]);

    return (
        <>
            <Navbar />

            <div style={{ display: "flex" }}>
                <aside
                    className={`drawer-panel ${drawerOpen ? "open" : ""}`}
                    onMouseLeave={() => setDrawerOpen(false)}
                >
                    <div className="drawer-profile">
                        <div className="avatar-wrap">
                            <img src={transporterAvatar} alt="transporter" />
                        </div>
                        <div>
                            <div>{roleName}</div>
                            <div className="drawer-id">ID: {roleId}</div>
                        </div>
                    </div>

                    <ul className="drawer-nav">
                        <li className="nav-item" onClick={() => navigate("/transporter-dashboard")}>
                            Dashboard Overview
                        </li>

                        <li
                            className="nav-item"
                            onClick={() => navigate("/transporter/shipments")}
                        >
                            Assigned Shipments
                        </li>

                        <li
                            className="nav-item"
                            onClick={() => navigate("/transporter-dashboard", { state: { tab: "update" } })}
                        >
                            Update Shipment Status
                        </li>

                        <li
                            className={
                                location.pathname === "/transporter/history"
                                    ? "nav-item active"
                                    : "nav-item"
                            }
                            onClick={() => navigate("/transporter/history")}
                        >
                            My Transport History
                        </li>

                        <li className="nav-item active">Upload Invoice</li>

                        <li
                            className="nav-item"
                            onClick={() => navigate("/transporter/invoice-history")}
                        >
                            Invoice History
                        </li>

                        <li
                            className="nav-item"
                            onClick={() => navigate("/transporter/profile")}
                        >
                            Profile Settings
                        </li>

                        <li className="nav-item" onClick={() => navigate("/transporter/support")}>
                            Support
                        </li>

                        <li
                            className="logout-item logout-btn"
                            style={{ marginTop: "200px" }}
                            onClick={() => {
                                if (!window.confirm("Do you want to logout?")) return;
                                localStorage.clear();
                                navigate("/auth");
                            }}
                        >
                            LOG OUT
                        </li>
                    </ul>
                </aside>

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
                        <h2 style={titleStyle}>Transporter Invoice Upload</h2>

                        <form onSubmit={handleSubmit} style={threeGrid}>

                            <div style={sectionCard}>
                                <SectionTitle text="INVOICE DETAILS" />

                                {/* ✅ Batch ID (Read Only) */}
                                <Input
                                    label="Batch ID"
                                    name="batchId"
                                    value={form.batchId}
                                    onChange={handleChange}
                                    required
                                />

                                {/* ✅ Transport Date (Harvest Safe + No Future Dates) */}
                                <Input
                                    label="Transport Date"
                                    type="date"
                                    name="transportDate"
                                    value={form.transportDate}
                                    onChange={handleChange}
                                    min={harvestDate ? harvestDate.split("T")[0] : undefined}
                                    max={maxDate}
                                    required
                                />

                                {dateError && (
                                    <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                                        {dateError}
                                    </div>
                                )}

                                {/* ✅ Transport Charge */}
                                <Input
                                    label="Transport Charge (₹)"
                                    type="number"
                                    name="charge"
                                    value={form.charge}
                                    onChange={handleChange}
                                    min="750"
                                    max="10000"
                                    step="1"
                                    inputMode="numeric"
                                    onKeyDown={(e) => {
                                        if (e.key === "." || e.key === "e") {
                                            e.preventDefault(); // 🚫 block decimals & scientific notation
                                        }
                                    }}
                                    required
                                />

                                {/* ✅ Distributor Select */}
                                <Select
                                    label="Distributor Name"
                                    name="distributorId"
                                    value={form.distributorId}
                                    options={distributors.map(d => ({
                                        label: d.name,
                                        value: d.roleId
                                    }))}
                                    onChange={(e) => {
                                        const selected = distributors.find(
                                            d => d.roleId === e.target.value
                                        );

                                        if (!selected) return;

                                        setForm(prev => ({
                                            ...prev,
                                            distributorId: selected.roleId,
                                            distributorName: selected.name,
                                            distributorLocation: selected.location
                                        }));
                                    }}
                                    required
                                />

                                {/* ✅ Auto-filled Distributor Location */}
                                <Input
                                    label="Distributor Location"
                                    value={form.distributorLocation || ""}
                                    disabled
                                />
                            </div>

                            {/* TRANSPORTER */}
                            <div style={sectionCard}>
                                <SectionTitle text="TRANSPORTER DETAILS" />

                                <Input label="Transporter Name" value={profile.name} disabled />
                                <Input label="Transporter ID" value={roleId} disabled />
                                <Input label="Vehicle Number" value={profile.vehicleNumber} disabled />
                                <Input label="Vehicle Type" value={profile.vehicleType} disabled />
                                <Input label="Capacity (tons)" value={profile.capacity} disabled />
                            </div>

                            {/* ROUTE */}
                            <div style={sectionCard}>
                                <SectionTitle text="ROUTE DETAILS" />

                                <Input label="From Location" value={fromLocation} disabled />
                                <Input label="To Location" value={form.distributorLocation} disabled />

                                <div style={{ marginTop: "auto" }}>
                                    {message && <div style={messageStyle}>{message}</div>}

                                    <button type="submit" disabled={loading} style={submitBtn}>
                                        {loading ? "Uploading..." : "Submit Invoice"}
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>

                    {showConfirm && (
                        <div style={modalOverlay}>
                            <div style={modalBox}>

                                <h3 style={{ marginBottom: 10 }}>Confirm Invoice</h3>

                                <div style={{ fontSize: 13, lineHeight: "22px" }}>
                                    <b>Batch ID:</b> {form.batchId} <br />
                                    <b>Date:</b> {form.transportDate} <br />
                                    <b>Charge:</b> ₹{form.charge} <br />
                                    <b>From:</b> {fromLocation} <br />
                                    <b>To:</b> {form.distributorLocation} <br />
                                    <b>Distributor:</b> {form.distributorName} <br />
                                    <b>Vehicle:</b> {profile.vehicleNumber}
                                </div>

                                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        style={cancelBtn}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={confirmUpload}
                                        style={confirmBtn}
                                    >
                                        Confirm Upload
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

/* ================= UI COMPONENTS ================= */

function SectionTitle({ text }) {
    return (
        <h4 style={{ marginBottom: 12, color: "#065f46", fontSize: 13 }}>
            {text} </h4>
    );
}

function Input({ label, ...props }) {
    return (<div style={fieldWrapper}> <label style={labelStyle}>{label}</label>
        <input {...props} style={inputStyle} /> </div>
    );
}

function Select({ label, options = [], ...props }) {
    return (
        <div style={fieldWrapper}>
            <label style={labelStyle}>{label}</label>

            <select {...props} style={inputStyle}>
                <option value="">Select distributor</option>

                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

/* ================= STYLES ================= */

const cardStyle = {
    maxWidth: 1300,
    margin: "0 auto",
    background: "#fff",
    padding: "30px 35px",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const titleStyle = {
    textAlign: "center",
    marginBottom: 24
};

const threeGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 24
};

const sectionCard = {
    display: "flex",
    flexDirection: "column",
    background: "#f9fafb",
    padding: 18,
    borderRadius: 12,
    border: "1px solid #e5e7eb"
};

const messageStyle = {
    color: "#065f46",
    fontWeight: 600,
    marginBottom: 8
};

const submitBtn = {
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    background: "#16a34a",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    width: "100%"
};

const fieldWrapper = {
    marginBottom: 10,
    width: "100%"
};

const labelStyle = {
    fontSize: 12,
    fontWeight: 600
};

const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 13,
    marginTop: 3,
    height: 36,
    boxSizing: "border-box"
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