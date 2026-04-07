import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import DistributorSidebar from "../../components/DistributorSidebar";
import api from "../../api/axios";
import distributorAvatar from "../../assets/distributor.png";

export default function DistributorProfile() {

    const [open, setOpen] = useState(false);
    const roleId = localStorage.getItem("roleId");

    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);

    const requiredFields = [
        "name",
        "address",
        "pincode",
        "emergencyContact",
        "warehouseCapacity"
    ];

    const [profile, setProfile] = useState({
        name: "",
        roleId: "",
        location: "",
        address: "",
        pincode: "",
        emergencyContact: "",
        warehouseCapacity: "",
        createdAt: ""
    });

    /* ================= FETCH PROFILE ================= */

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/profile/${roleId}`);
                setProfile(res.data || {});
            } catch (err) {
                console.error("Profile fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };

        if (roleId) fetchProfile();
    }, [roleId]);

    /* ================= VALIDATION WARNING ================= */

    useEffect(() => {
        const missing = requiredFields.some(field => {
            const value = profile[field];
            return value === "" || value === null || value === undefined;
        });

        setShowAlert(missing);
    }, [profile]);

    /* ================= INPUT CHANGE ================= */

    const handleChange = (e) => {

        const { name, value } = e.target;
        let newValue = value;

        /* FULL NAME */
        if (name === "name") {
            newValue = value.replace(/[^A-Za-z ]/g, "").slice(0, 25);
        }

        /* PHONE NUMBER */
        if (name === "emergencyContact") {
            newValue = value.replace(/\D/g, "").slice(0, 10);
        }

        /* ADDRESS */
        if (name === "address") {
            newValue = value.slice(0, 35);
        }

        /* PINCODE */
        if (name === "pincode") {
            newValue = value.replace(/\D/g, "").slice(0, 6);
        }

        /* WAREHOUSE CAPACITY */
        if (name === "warehouseCapacity") {
            newValue = value.replace(/\D/g, "");

            if (newValue === "") newValue = "";
            else if (parseInt(newValue) > 50000) newValue = "50000";
        }

        /* ORGANIZATION */
        if (name === "organization") {
            newValue = value.slice(0, 30);
        }

        setProfile(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    /* ================= SAVE PROFILE ================= */

    const saveProfile = async () => {
        try {
            await api.put(`/profile/${roleId}`, {
                name: profile.name,
                address: profile.address,
                pincode: profile.pincode,
                emergencyContact: profile.emergencyContact,
                warehouseCapacity: profile.warehouseCapacity
            });
            alert("Profile updated successfully");
            setEditMode(false);

            const refreshed = await api.get(`/profile/${roleId}`);
            setProfile(refreshed.data);

        } catch (err) {
            console.error("Update failed:", err);
            alert("Update failed");
        }
    };

    const [trust, setTrust] = useState({
        trustScore: 0,
        totalBlocks: 0,
        validBlocks: 0
    });

    /* ================= FETCH TRUST SCORE ================= */

    useEffect(() => {

        const fetchTrust = async () => {
            try {

                const res = await api.get(`/trust/${roleId}`);

                setTrust(res.data || {
                    trustScore: 0,
                    totalBlocks: 0,
                    validBlocks: 0
                });

            } catch (err) {
                console.error("Trust fetch failed:", err);
            }
        };

        if (roleId) fetchTrust();

    }, [roleId]);

    /* ================= LOADING ================= */

    if (loading) {
        return (
            <>
                <Navbar />
                <DistributorSidebar open={open} setOpen={setOpen} />
                <div style={{ padding: 40 }}>Loading profile...</div>
            </>
        );
    }

    /* ================= UI ================= */

    return (
        <>
            <Navbar />
            <DistributorSidebar open={open} setOpen={setOpen} />

            <div style={styles.wrapper}>

                <div style={styles.headerRow}>
                    <div
                        style={styles.hamburger}
                        onMouseEnter={() => setOpen(true)}
                    >
                        ☰
                    </div>
                </div>

                <div style={styles.pageContainer}>

                    {/* LEFT PROFILE CARD */}
                    <div style={styles.leftCard}>

                        <img
                            src={distributorAvatar}
                            alt="distributor avatar"
                            style={styles.avatar}
                        />

                        <h3 style={styles.nameText}>
                            {profile.name || "Distributor User"}
                        </h3>

                        <p style={styles.locationText}>
                            {profile.location || "No location added"}
                        </p>

                        <div style={styles.metaBox}>

                            <div style={styles.metaRow}>
                                <span style={styles.metaLabel}>Role ID</span>
                                <span style={styles.metaValue}>{profile.roleId}</span>
                            </div>

                            <div style={styles.metaRow}>
                                <span style={styles.metaLabel}>Phone</span>
                                <span style={styles.metaValue}>
                                    {profile.emergencyContact || "Not added"}
                                </span>
                            </div>

                            <div style={styles.metaRow}>
                                <span style={styles.metaLabel}>Warehouse Capacity</span>
                                <span style={styles.metaValue}>
                                    {profile.warehouseCapacity ? `${profile.warehouseCapacity} KG` : "Not added"}
                                </span>
                            </div>

                            <div style={styles.metaRow}>
                                <span style={styles.metaLabel}>Joined On</span>
                                <span style={styles.metaValue}>
                                    {profile.createdAt &&
                                        new Date(profile.createdAt).toLocaleDateString("en-IN")}
                                </span>
                            </div>
                            {/* TRUST SCORE */}
                            <div style={styles.trustBox}>

                                <div style={styles.trustHeader}>
                                    Trust Score
                                </div>

                                <div style={styles.trustScore}>
                                    {trust.trustScore}%
                                </div>

                                <div style={styles.trustMeta}>
                                    Valid Blocks: {trust.validBlocks} / {trust.totalBlocks}
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* RIGHT SETTINGS CARD */}
                    <div style={styles.mainCard}>

                        <div style={styles.cardHeader}>
                            <h3 style={{ margin: 0 }}>
                                Distributor Profile Settings
                            </h3>

                            <button
                                style={styles.actionBtn}
                                onClick={() =>
                                    editMode ? saveProfile() : setEditMode(true)
                                }
                            >
                                {editMode ? "Save Changes" : "Edit Profile"}
                            </button>
                        </div>

                        {/* WARNING BOX */}
                        {showAlert && (
                            <div style={styles.warningBox}>
                                ⚠ Please complete your distributor details to activate operations.
                            </div>
                        )}

                        <div style={styles.formGrid}>

                            {/* Editable Fields */}
                            <Input
                                label="Full Name"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                disabled={!editMode}
                                placeholder="e.g. Abc Def"
                            />
                            <Input
                                label="Phone Number"
                                name="emergencyContact"
                                value={profile.emergencyContact}
                                onChange={handleChange}
                                disabled={!editMode}
                                placeholder="10 digit mobile"
                            />
                            <Input
                                label="Address"
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                                disabled={!editMode}
                                placeholder="e.g. Kamarajar Salai"
                            />
                            <Input label="Pincode" name="pincode" value={profile.pincode} onChange={handleChange} disabled={!editMode} />
                            <Input
                                label="Warehouse Capacity (KG)"
                                type="number"
                                name="warehouseCapacity"
                                value={profile.warehouseCapacity}
                                onChange={handleChange}
                                disabled={!editMode}
                                placeholder="e.g. 4500"
                            />
                            <Input
                                label="Organization / Distribution Center"
                                name="organization"
                                value={profile.organization}
                                onChange={handleChange}
                                disabled={!editMode}
                                placeholder="e.g. RC Agro Wholesale Traders"
                            />
                            {/* Non Editable */}
                            <Input label="Location" name="location" value={profile.location} disabled />
                            <Input label="Role ID" name="roleId" value={profile.roleId} disabled />

                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

/* ================= INPUT COMPONENT ================= */

function Input({ label, ...props }) {
    return (
        <div style={styles.inputWrap}>
            <label style={styles.label}>{label}</label>
            <input
                style={{
                    ...styles.input,
                    backgroundColor: props.disabled ? "#f1f5f9" : "#ffffff"
                }}
                {...props}
            />
        </div>
    );
}

/* ================= STYLES ================= */

const styles = {

    wrapper: {
        padding: "30px 40px",
        background: "linear-gradient(to bottom, #f4f7f6, #eef2f1)",
        minHeight: "100vh"
    },

    headerRow: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 28
    },

    hamburger: {
        fontSize: 22,
        cursor: "pointer"
    },

    trustBox: {
        marginTop: 12,
        background: "#ffffff",
        border: "1px solid #d1fae5",
        borderRadius: 12,
        padding: "8px 10px",
        textAlign: "center"
    },

    trustHeader: {
        fontSize: 12,
        fontWeight: 600,
        color: "#047857",
        marginBottom: 2
    },

    trustScore: {
        fontSize: 20,
        fontWeight: 700,
        color: "#059669",
        marginBottom: 2
    },

    trustMeta: {
        fontSize: 11,
        color: "#6b7280"
    },

    metaRow: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 10,
        fontSize: 13
    },

    metaLabel: {
        color: "#64748b",
        fontWeight: 500
    },

    metaValue: {
        fontWeight: 600,
        color: "#1f2937"
    },

    pageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "stretch",
        gap: 28
    },

    leftCard: {
        width: "320px",
        background: "#f6fdf9",
        border: "1px solid #e6f7ef",
        borderRadius: 20,
        padding: 28,
        boxShadow: "0 12px 30px rgba(16, 24, 40, 0.06)",
        textAlign: "center",
        height: "100%"
    },

    mainCard: {
        width: "820px",
        background: "#ffffff",
        borderRadius: 20,
        padding: 24,
        boxShadow: "0 12px 30px rgba(16, 24, 40, 0.06)",
        border: "1px solid #edf2f7"
    },

    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
    },

    formGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        columnGap: 20,
        rowGap: 18,
        alignItems: "start"
    },

    inputWrap: {
        display: "flex",
        flexDirection: "column",
        width: "100%"
    },

    label: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: 500,
        color: "#334155",
        whiteSpace: "nowrap"
    },

    input: {
        padding: "8px 10px",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        background: "#f9fafb",
        fontSize: 13,
        height: 25
    },

    actionBtn: {
        padding: "10px 20px",
        background: "#0f172a",
        color: "#fff",
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        fontWeight: 500
    },

    warningBox: {
        background: "#fff3cd",
        border: "1px solid #ffecb5",
        color: "#664d03",
        padding: "12px 16px",
        borderRadius: 12,
        marginBottom: 20,
        fontWeight: 500,
        fontSize: 14
    },

    avatar: {
        width: 120,
        height: 120,
        borderRadius: "50%",
        objectFit: "cover",
        border: "3px solid #e2e8f0",
        marginBottom: 18
    },

    nameText: {
        fontSize: 20,
        fontWeight: 600,
        marginBottom: 6
    },

    locationText: {
        fontSize: 14,
        marginBottom: 16
    },

    metaBox: {
        marginTop: "auto",
        background: "#f8fafc",
        padding: 18,
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        textAlign: "left",
        fontSize: 14,
        lineHeight: "1.6"
    }
};