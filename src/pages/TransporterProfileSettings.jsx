import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import Navbar from "../components/Navbar";

import transporterAvatar from "../assets/transporter.png";
import "./FarmerDashboard.css";

export default function TransporterProfileSettings() {
    const navigate = useNavigate();

    const roleId = localStorage.getItem("roleId");
    const roleName = localStorage.getItem("roleName");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    /* ✅ TRUST SCORE STATE */
    const [trust, setTrust] = useState({
        trustScore: 0,
        totalBlocks: 0,
        validBlocks: 0
    });

    const requiredFields = [
        "vehicleNumber",
        "vehicleType",
        "capacity",
        "licenseNo",
        "licenseExpiry",
        "rcBook",
        "insuranceTill",
        "emergencyContact"
    ];

    const [profile, setProfile] = useState({
        name: "",
        role: "",
        organization: "",
        location: "",
        address: "",
        pincode: "",
        emergencyContact: "",   // ✅ ADD THIS
        vehicleNumber: "",
        vehicleType: "",
        capacity: "",
        licenseNo: "",
        licenseExpiry: "",
        rcBook: "",
        insuranceTill: "",
        createdAt: ""
    });


    /* ================= PROFILE FETCH ================= */
    useEffect(() => {
        if (!roleId) return;

        api.get(`/profile/${roleId}`)
            .then(res => {
                const cleanProfile = Object.fromEntries(
                    Object.entries(res.data || {}).map(([k, v]) => [k, v ?? ""])
                );
                setProfile(cleanProfile);
            })
            .catch(() => console.log("Profile fetch failed"));
    }, [roleId]);

    /* ================= TRUST SCORE FETCH (FIXED) ================= */
    useEffect(() => {
        if (!roleId) return;

        api.get(`/trust/${roleId}`)   // ✅ CORRECT ENDPOINT
            .then(res => {
                setTrust({
                    trustScore: res.data?.trustScore ?? 0,
                    totalBlocks: res.data?.totalBlocks ?? 0,
                    validBlocks: res.data?.validBlocks ?? 0
                });
            })
            .catch(() => {
                console.warn("Trust score fetch failed");
            });
    }, [roleId]);

    useEffect(() => {
        const missing = requiredFields.some(field => {
            const value = profile[field];
            return value === "" || value === null || value === undefined;
        });

        setShowAlert(missing);
    }, [profile]);

    const handleChange = (e) => {

        const { name, value } = e.target;
        let newValue = value;

        /* FULL NAME (letters + space, max 25) */
        if (name === "name") {
            newValue = value.replace(/[^A-Za-z ]/g, "").slice(0, 25);
        }

        /* ORGANIZATION (letters + space, max 25) */
        if (name === "organization") {
            newValue = value.replace(/[^A-Za-z ]/g, "").slice(0, 25);
        }

        /* ADDRESS (max 35 characters) */
        if (name === "address") {
            newValue = value.slice(0, 35);
        }

        /* PINCODE (6 digits only) */
        if (name === "pincode") {
            newValue = value.replace(/\D/g, "").slice(0, 6);
        }

        /* EMERGENCY CONTACT (10 digits) */
        if (name === "emergencyContact") {
            newValue = value.replace(/\D/g, "").slice(0, 10);
        }

        if (name === "vehicleType") {
            newValue = value.replace(/[^0-9A-Za-z -]/g, "");
            if (newValue.length > 11) return;

        }

        /* VEHICLE NUMBER (letters, numbers, dash) */
        if (name === "vehicleNumber") {
            newValue = value.replace(/[^A-Za-z0-9-]/g, "").toUpperCase().slice(0, 13);
        }

        /* CAPACITY (1 – 5 tons only) */
        if (name === "capacity") {
            newValue = value.replace(/\D/g, "");

            if (newValue === "") newValue = "";
            else if (parseInt(newValue) > 5) newValue = "5";
        }

        if (name === "rcBook") {

            newValue = value
                .replace(/[^A-Za-z0-9-]/g, "")
                .toUpperCase();

            const dashCount = (newValue.match(/-/g) || []).length;

            if (dashCount > 2) return;

            if (newValue.length > 15) return;

        }

        if (name === "licenseNo") {
            newValue = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 16);
        }

        setProfile(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const saveProfile = async () => {
        try {

            await api.put(`/profile/${roleId}`, {
                name: profile.name,
                organization: profile.organization,
                address: profile.address,
                pincode: profile.pincode,
                emergencyContact: profile.emergencyContact,
                vehicleNumber: profile.vehicleNumber,
                vehicleType: profile.vehicleType,
                capacity: profile.capacity,
                licenseNo: profile.licenseNo,
                licenseExpiry: profile.licenseExpiry,
                rcBook: profile.rcBook,
                insuranceTill: profile.insuranceTill
            });

            alert("Profile updated successfully");
            setEditMode(false);

            /* 🔄 TRIGGER GLOBAL PROFILE REFRESH */
            window.dispatchEvent(new Event("profileUpdated"));

        } catch {
            alert("Failed to update profile");
        }
    };
    return (
        <>
            <Navbar />

            {/* SIDEBAR */}
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
                        className={
                            location.pathname === "/transporter/shipments"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() => {
                            setDrawerOpen(false);
                            navigate("/transporter/shipments");
                        }}
                    >
                        Assigned Shipments
                    </li>

                    <li
                        className="nav-item"
                        onClick={() =>
                            navigate("/transporter-dashboard", { state: { tab: "update" } })
                        }
                    >
                        Update Shipment Status
                    </li>
                    <li
                        className={
                            location.pathname === "/transporter/history"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() => {
                            setDrawerOpen(false);
                            navigate("/transporter/history");
                        }}
                    >
                        My Transport History
                    </li>

                    <li
                        className={
                            location.pathname === "/transporter/upload-invoice"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() => {
                            setDrawerOpen(false);
                            navigate("/transporter/upload-invoice");
                        }}
                    >
                        Upload Invoice
                    </li>

                    <li
                        className={
                            location.pathname === "/transporter/invoice-history"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() => {
                            setDrawerOpen(false);
                            navigate("/transporter/invoice-history");
                        }}
                    >
                        Invoice History
                    </li>


                    <li className="nav-item active">Profile Settings</li>

                    <li className="nav-item" onClick={() => navigate("/transporter/support")}>
                        Support
                    </li>

                    <li
                        className="logout-item logout-btn"
                        style={{ marginTop: "200px" }}   // adjust value as needed
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

            {/* MAIN */}
            <main className="dashboard-layout">
                <div className="dashboard-main">
                    <div className="dashboard-topbar">
                        <span className="menu-btn" onMouseEnter={() => setDrawerOpen(true)}>☰</span>
                    </div>

                    <section
                        className="dashboard-content profile-desktop"
                        style={{ display: "flex", gap: 24, alignItems: "stretch", marginTop: "-32px" }}
                    >
                        {/* LEFT CARD */}
                        <div className="profile-card" style={{ height: "80vh", overflowY: "auto", padding: 16 }}>
                            <div className="avatar-circle">
                                <img src={transporterAvatar} className="profile-avatar" alt="profile" />
                            </div>

                            <h3>{profile.name}</h3>
                            <p style={{ fontWeight: 600, fontSize: 13 }}>ID: {roleId}</p>
                            <p>{profile.location}</p>

                            <span className="joined">
                                Joined on {profile.createdAt && new Date(profile.createdAt).toLocaleDateString("en-IN")}
                            </span>

                            {/* TRUST SCORE */}
                            <div className="profile-divider" />
                            <h4 style={{ marginBottom: 6 }}>Trust Score</h4>

                            <div
                                style={{
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: 10,
                                    padding: "8px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 12
                                }}
                            >
                                <div>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: "#047857" }}>
                                        {trust.trustScore}%
                                    </div>
                                    <div style={{ fontSize: 11, color: "#065f46", fontWeight: 600 }}>
                                        {trust.trustScore >= 80
                                            ? "High Trust"
                                            : trust.trustScore >= 50
                                                ? "Medium Trust"
                                                : "Low Trust"}
                                    </div>
                                </div>

                                <div style={{ fontSize: 11, color: "#065f46", textAlign: "right" }}>
                                    {trust.validBlocks}/{trust.totalBlocks}<br />
                                    blocks
                                </div>
                            </div>

                            {/* COMPLIANCE */}
                            <div className="profile-divider" />
                            <h4>Transporter Compliance</h4>

                            <div className="trust-center">
                                <div className="trust-row"><span>Vehicle No</span><b>{profile.vehicleNumber}</b></div>
                                <div className="trust-row"><span>Vehicle Type</span><b>{profile.vehicleType}</b></div>
                                <div className="trust-row"><span>Capacity</span><b>{profile.capacity} tons</b></div>
                                <div className="trust-row"><span>License No</span><b>{profile.licenseNo}</b></div>
                                <div className="trust-row"><span>License Expiry</span><b>{profile.licenseExpiry}</b></div>
                                <div className="trust-row"><span>RC Book</span><b>{profile.rcBook}</b></div>
                                <div className="trust-row"><span>Insurance Till</span><b>{profile.insuranceTill}</b></div>
                            </div>
                        </div>

                        {/* RIGHT FORM (UNCHANGED) */}
                        <div className="profile-form" style={{ height: "82vh", overflowY: "auto", padding: 8 }}>

                            <div className="profile-header">
                                <h2>Profile Settings</h2>
                                <button className="save-btn" onClick={() => (editMode ? saveProfile() : setEditMode(true))}>
                                    {editMode ? "Save" : "Edit"}
                                </button>
                            </div>

                            {showAlert && (
                                <div className="warning-box">
                                    ⚠ Complete your transporter compliance details to activate your account.
                                </div>
                            )}

                            <div className="profile-grid">
                                <Input label="Full Name" name="name" value={profile.name} onChange={handleChange} disabled={!editMode} />
                                <Input label="Organization" name="organization" value={profile.organization} onChange={handleChange} disabled={!editMode} />
                                <Input
                                    label="Location"
                                    value={profile.location}
                                    disabled
                                />
                                <Input
                                    label="Address"
                                    name="address"
                                    value={profile.address}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                />

                                <Input
                                    label="Pincode"
                                    name="pincode"
                                    value={profile.pincode}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    maxLength={6}
                                />

                                <Input
                                    label="Emergency Contact"
                                    name="emergencyContact"
                                    value={profile.emergencyContact}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    maxLength={10}
                                />
                                <Input
                                    label="Vehicle Number"
                                    name="vehicleNumber"
                                    value={profile.vehicleNumber}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    maxLength={13}
                                    placeholder="e.g. AB-12-XY-1234"
                                />
                                <Select
                                    label="Vehicle Type"
                                    name="vehicleType"
                                    value={profile.vehicleType}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                >
                                    <option value="">Select</option>
                                    <option value="2 - Wheeler">2 - Wheeler</option>
                                    <option value="3 - Wheeler">3 - Wheeler</option>
                                    <option value="4 - Wheeler">4 - Wheeler</option>
                                    <option value="6 - Wheeler">6 - Wheeler</option>
                                    <option value="8 - Wheeler">8 - Wheeler</option>
                                    <option value="10 - Wheeler">10 - Wheeler</option>
                                    <option value="12 - Wheeler">12 - Wheeler</option>
                                </Select>
                                <Input
                                    label="Capacity (tons)"
                                    name="capacity"
                                    value={profile.capacity}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    maxLength={1}
                                    placeholder="1 – 5"
                                />
                                <Input label="License No" name="licenseNo" value={profile.licenseNo} onChange={handleChange} disabled={!editMode} />
                                <Input label="License Expiry" type="date" name="licenseExpiry" value={profile.licenseExpiry} onChange={handleChange} disabled={!editMode} />
                                <Input
                                    label="RC Book"
                                    name="rcBook"
                                    value={profile.rcBook}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    maxLength={20}
                                    placeholder="KL09-2025-004523"
                                />
                                <Input label="Insurance Valid Till" type="date" name="insuranceTill" value={profile.insuranceTill} onChange={handleChange} disabled={!editMode} />
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

function Input({ label, ...props }) {
    return (
        <div className="field">
            <label>{label}</label>
            <input {...props} />
        </div>
    );
}

function Select({ label, ...props }) {
    return (
        <div className="field">
            <label>{label}</label>

            <select
                {...props}
                style={{
                    padding: "8px 10px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    background: props.disabled ? "#f1f5f9" : "#f9fafb",
                    fontSize: "13px",
                    height: "40px",
                    width: "106%",
                    outline: "none",
                    cursor: props.disabled ? "default" : "pointer"
                }}
            >
                {props.children}
            </select>

        </div>
    );
}