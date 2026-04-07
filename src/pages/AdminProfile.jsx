import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "../layouts/AdminLayout";
import adminAvatar from "../assets/admin.png";

export default function AdminProfile() {

    const roleId = localStorage.getItem("roleId");

    const [editMode, setEditMode] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(true);

    const requiredFields = [
        "organization",
        "location",
        "emergencyContact",
        "department",
        "designation"
    ];

    const [profile, setProfile] = useState({
        name: "",
        role: "",
        roleId: "",
        organization: "",
        location: "",
        emergencyContact: "",
        department: "",
        designation: "",
        officeContact: "",
        createdAt: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);

                const res = await api.get(`/profile/${roleId}`);

                setProfile(res.data);

            } catch (err) {
                console.error("Profile fetch failed:", err.message || err);
            } finally {
                setLoading(false);
            }
        };

        if (roleId) {
            fetchProfile();
        }
    }, [roleId]);

    useEffect(() => {
        // Alert validation only for ADMIN role
        if (profile.role !== "ADMIN") {
            setShowAlert(false);
            return;
        }

        const missing = requiredFields.some(field => {
            const value = profile[field];

            return (
                value === undefined ||
                value === null ||
                (typeof value === "string" && value.trim() === "")
            );
        });

        setShowAlert(missing);

    }, [profile, requiredFields]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        /* FULL NAME (letters + space only, max 25) */
        if (name === "name") {
            newValue = value.replace(/[^A-Za-z ]/g, "").slice(0, 25);
        }

        /* ORGANIZATION (letters + space only, max 25) */
        if (name === "organization") {
            newValue = value.replace(/[^A-Za-z ]/g, "").slice(0, 25);
        }

        /* EMERGENCY CONTACT (numbers only, max 10) */
        if (name === "emergencyContact") {
            newValue = value.replace(/\D/g, "").slice(0, 10);
        }

        /* OFFICE CONTACT (numbers + dash allowed, max 12) */
        if (name === "officeContact") {
            newValue = value.replace(/[^0-9-]/g, "").slice(0, 12);
        }

        /* DEPARTMENT (max 25 characters) */
        if (name === "department") {
            newValue = value.slice(0, 25);
        }

        /* DESIGNATION (max 25 characters) */
        if (name === "designation") {
            newValue = value.slice(0, 25);
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
                emergencyContact: profile.emergencyContact,
                department: profile.department,
                designation: profile.designation,
                officeContact: profile.officeContact
            });

            alert("Admin profile updated successfully");

            setEditMode(false);

            // Refresh profile to ensure UI sync with DB
            const refreshed = await api.get(`/profile/${roleId}`);
            setProfile(refreshed.data);

        } catch (err) {
            console.error("Profile update failed:", err.message || err);
            alert("Update failed. Please try again.");
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ padding: 40 }}>Loading profile...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>

            <div style={styles.pageContainer}>

                {/* ===== LEFT PROFILE CARD ===== */}
                <div style={styles.leftCard}>

                    <div style={styles.avatarWrapper}>
                        <img
                            src={adminAvatar}
                            style={styles.avatar}
                            alt="admin avatar"
                        />
                    </div>

                    <h3 style={styles.nameText}>
                        {profile.name || "Admin User"}
                    </h3>

                    <p style={styles.subText}>
                        {profile.designation || "System Administrator"}
                    </p>

                    <p style={styles.locationText}>
                        {profile.location || "No location added"}
                    </p>

                    <div style={styles.metaBox}>
                        <p><b>Role:</b> {profile.role}</p>

                        <p><b>Role ID:</b> {profile.roleId || "System Generated"}</p>

                        <p>
                            <b>Joined On:</b>{" "}
                            {profile.createdAt &&
                                new Date(profile.createdAt).toLocaleDateString("en-IN")}
                        </p>

                        <p><b>Department:</b> {profile.department || "Not Set"}</p>
                    </div>
                </div>

                {/* ===== RIGHT MAIN CARD ===== */}
                <div style={styles.mainCard}>

                    <div style={styles.header}>
                        <h2>Admin Profile Settings</h2>

                        <button
                            style={styles.actionBtn}
                            onClick={() => editMode ? saveProfile() : setEditMode(true)}
                        >
                            {editMode ? "Save Changes" : "Edit Profile"}
                        </button>
                    </div>

                    {showAlert && (
                        <div style={styles.alertBox}>
                            ⚠ Please complete all required admin profile details.
                        </div>
                    )}

                    <div style={styles.formGrid}>

                        <Input
                            label="Full Name"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="e.g. Arjun Reddy"
                        />

                        <Input
                            label="Organization"
                            name="organization"
                            value={profile.organization}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="e.g. AgriChain Trust Pvt Ltd"
                        />

                        <Input
                            label="Location"
                            name="location"
                            value={profile.location}
                            disabled
                            placeholder="e.g. Coimbatore, Tamil Nadu"
                        />

                        <Input
                            label="Department"
                            name="department"
                            value={profile.department}
                            onChange={handleChange}
                            disabled={!editMode}
                            maxLength={25}
                        />

                        <Input
                            label="Designation"
                            name="designation"
                            value={profile.designation}
                            onChange={handleChange}
                            disabled={!editMode}
                            maxLength={25}
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
                            label="Office Contact"
                            name="officeContact"
                            value={profile.officeContact}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="e.g. 0422-2233445"
                        />

                        <Input
                            label="Role ID"
                            name="roleId"
                            value={profile.roleId}
                            disabled
                            placeholder="System Generated"
                        />
                    </div>

                </div>

            </div>

        </AdminLayout>
    );
}

function Input({ label, ...props }) {
    return (
        <div style={styles.inputWrap}>
            <label style={styles.label}>{label}</label>
            <input style={styles.input} {...props} />
        </div>
    );
}

const styles = {

    pageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: 24,
        padding: "10px 24px 24px 24px",
        marginTop: "-40px",
        background: "#f1f5f9",
        minHeight: "100vh"
    },

    leftCard: {
        width: "320px",
        minHeight: "480px",
        background: "#ffffff",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
    },

    avatarWrapper: {
        marginBottom: 14
    },

    avatar: {
        width: 120,
        height: 120,
        borderRadius: "50%",
        objectFit: "cover",
        border: "3px solid #e2e8f0"
    },

    nameText: {
        fontSize: 20,
        fontWeight: 600
    },

    subText: {
        fontSize: 14,
        color: "#64748b"
    },

    locationText: {
        fontSize: 14,
        marginBottom: 10
    },

    mainCard: {
        width: "820px",
        minHeight: "485px",
        background: "#ffffff",
        borderRadius: 16,
        padding: 28,
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20
    },

    actionBtn: {
        padding: "10px 18px",
        background: "#0f172a",
        color: "#fff",
        borderRadius: 10,
        border: "none",
        cursor: "pointer"
    },

    alertBox: {
        background: "#fff3cd",
        padding: 14,
        marginBottom: 18,
        borderRadius: 10,
        color: "#664d03"
    },

    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 18
    },

    inputWrap: {
        display: "flex",
        flexDirection: "column"
    },

    label: {
        fontSize: 14,
        marginBottom: 6,
        fontWeight: 500
    },

    input: {
        padding: 12,
        borderRadius: 10,
        border: "1px solid #d1d5db",
        outline: "none"
    },

    metaBox: {
        marginTop: 20,
        background: "#f8fafc",
        padding: 16,
        borderRadius: 12,
        width: "100%",
        textAlign: "left"
    }
};
