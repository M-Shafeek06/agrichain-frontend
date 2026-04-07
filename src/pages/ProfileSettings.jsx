import { useEffect, useState } from "react";
import api from "../api/axios";
import "./FarmerDashboard.css";
import farmerAvatar from "../assets/farmer.png";
import { RadialBarChart, RadialBar } from "recharts";

export default function ProfileSettings() {
    const roleId = localStorage.getItem("roleId");

    const [editMode, setEditMode] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const [profile, setProfile] = useState({
        name: "",
        role: "",
        roleId: "",
        organization: "",
        location: "",
        address: "",
        pincode: "",
        emergencyContact: "",
        language: "English",
        notifications: "Enabled",
        createdAt: "",
        trustScore: 0
    });

    const requiredFields = [
        "name",
        "organization",
        "address",
        "pincode",
        "emergencyContact"
    ];

    /* ================= FETCH PROFILE + TRUST SCORE ================= */
    useEffect(() => {
        if (!roleId) return;

        const fetchProfileAndTrust = async () => {
            try {
                const [profileRes, trustRes] = await Promise.all([
                    api.get(`/profile/${roleId}`),
                    api.get(`/trust/farmer/${roleId}`)
                ]);

                setProfile(prev => ({
                    ...prev,
                    ...profileRes.data,                 // includes address & pincode if present
                    trustScore: trustRes.data?.trustScore ?? 0
                }));

            } catch (err) {
                console.error("Profile / Trust fetch error:", err);
            }
        };

        fetchProfileAndTrust();
    }, [roleId]);

    useEffect(() => {

        const missing = requiredFields.some(field => {
            const value = profile[field];
            return value === "" || value === null || value === undefined;
        });

        setShowAlert(missing);

    }, [profile]);

    /* ================= INPUT HANDLER ================= */
    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        if (name === "name") {
            newValue = value.replace(/[^A-Za-z ]/g, "").slice(0, 25);
        }

        if (name === "organization") {
            newValue = value.replace(/[^A-Za-z ]/g, "").slice(0, 25);
        }

        if (name === "address") {
            newValue = value.slice(0, 35);
        }

        if (name === "pincode") {
            newValue = value.replace(/\D/g, "").slice(0, 6);
        }

        if (name === "emergencyContact") {
            newValue = value.replace(/\D/g, "").slice(0, 10);
        }

        setProfile((prev) => ({
            ...prev,
            [name]: newValue
        }));

        setIsDirty(true);
    };
    /* ================= SAVE PROFILE ================= */
    const saveProfile = async () => {
        try {

            await api.put(`/profile/${roleId}`, {
                name: profile.name,
                organization: profile.organization,
                location: profile.location,
                address: profile.address,
                pincode: profile.pincode,
                emergencyContact: profile.emergencyContact
            });

            alert("Profile updated successfully");

            setEditMode(false);
            setIsDirty(false);

            /* 🔄 TRIGGER DASHBOARD REFRESH */
            window.dispatchEvent(new Event("profileUpdated"));

        } catch (err) {
            console.error("Profile update failed:", err);
            alert("Update failed");
        }
    };

    /* ================= TRUST SCORE UI ================= */
    const trustScore = Number(profile.trustScore) || 0;

    const trustLabel =
        trustScore >= 70
            ? "HIGH TRUST"
            : trustScore >= 40
                ? "MEDIUM TRUST"
                : "LOW TRUST";

    const trustColor =
        trustScore >= 70
            ? "#22c55e"
            : trustScore >= 40
                ? "#f59e0b"
                : "#ef4444";

    return (
        <section className="dashboard-content profile-desktop">
            {/* LEFT CARD */}
            <div className="profile-card">
                <div className="avatar-circle">
                    <img src={farmerAvatar} alt="Farmer" className="profile-avatar" />
                </div>

                <h3>{profile.name || "--"}</h3>
                <p>{profile.location || "--"}</p>

                <span className="joined">
                    Joined on{" "}
                    {profile.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("en-IN")
                        : "--"}
                </span>

                {/* TRUST SCORE */}
                <div style={{ marginTop: 22, textAlign: "center" }}>
                    <p style={{ fontWeight: 600 }}>Trust Score</p>

                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <RadialBarChart
                            width={160}
                            height={120}
                            innerRadius="70%"
                            outerRadius="100%"
                            startAngle={180}
                            endAngle={0}
                            data={[{ value: trustScore }]}
                        >
                            <RadialBar
                                dataKey="value"
                                cornerRadius={10}
                                fill={trustColor}
                            />
                            <text
                                x="50%"
                                y="70%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{ fontSize: 18, fontWeight: 700, fill: "#111" }}
                            >
                                {trustScore} / 100
                            </text>
                        </RadialBarChart>
                    </div>

                    <div
                        style={{
                            background: trustColor,
                            color: "#fff",
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: 14,
                            fontSize: 12,
                            fontWeight: 600,
                            marginTop: 6
                        }}
                    >
                        {trustLabel}
                    </div>
                </div>
            </div>

            {/* RIGHT FORM */}
            <div className="profile-form">

                {showAlert && (
                    <div className="warning-box">
                        ⚠ Please complete your farmer profile to activate your account.
                    </div>
                )}

                <div className="profile-header">
                    <h2>Profile Settings</h2>

                    <button
                        className={`save-btn ${editMode ? "active" : ""}`}
                        onClick={() => (editMode ? saveProfile() : setEditMode(true))}
                        disabled={editMode && !isDirty}
                    >
                        {editMode ? "Save" : "Edit"}
                    </button>
                </div>

                <div className="profile-grid">
                    <Input
                        label="Full Name"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        disabled={!editMode}
                    />

                    <Input label="Role ID" value={profile.roleId} disabled />
                    <Input label="Role" value={profile.role} disabled />

                    <Input
                        label="Organization"
                        name="organization"
                        value={profile.organization}
                        onChange={handleChange}
                        disabled={!editMode}
                    />

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
                    />

                    <Input
                        label="Contact Number"
                        name="emergencyContact"
                        value={profile.emergencyContact}
                        onChange={handleChange}
                        disabled={!editMode}
                        maxLength={10}
                    />

                    <Input label="Language" value={profile.language} disabled />
                    <Input label="Notifications" value={profile.notifications} disabled />
                </div>
            </div>
        </section>
    );
}

/* ================= INPUT COMPONENT ================= */
function Input({ label, ...props }) {
    return (
        <div className="field">
            <label>{label}</label>
            <input {...props} />
        </div>
    );
}
