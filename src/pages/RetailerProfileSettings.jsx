import { useEffect, useState } from "react";
import api from "../api/axios";
import RetailerLayout from "../layouts/RetailerLayout";
import retailerAvatar from "../assets/retailer.png";
import "./FarmerDashboard.css";

export default function RetailerProfileSettings() {

    const roleId = localStorage.getItem("roleId");
    const roleName = localStorage.getItem("roleName");

    const [editMode, setEditMode] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const requiredFields = [
        "storeName",
        "gstNumber",
        "fssaiLicense",
        "storageCapacity",
        "emergencyContact"
    ];

    const [profile, setProfile] = useState({
        name: "",
        role: "",
        roleId: "",
        organization: "",
        location: "",
        address: "",
        pincode: "",
        storeName: "",
        gstNumber: "",
        fssaiLicense: "",
        storageCapacity: "",
        emergencyContact: "",
        createdAt: ""
    });

    /* ================= FETCH PROFILE ================= */

    useEffect(() => {
        if (!roleId) return;

        api.get(`/profile/${roleId}`).then(res => {
            setProfile(prev => ({
                ...prev,
                ...res.data
            }));
        });
    }, [roleId]);

    /* ================= COMPLIANCE CHECK ================= */

    useEffect(() => {
        if (profile.role === "RETAILER") {
            const missing = requiredFields.some(f => !profile[f]);
            setShowAlert(missing);
        }
    }, [profile]);

    /* ================= HANDLE CHANGE ================= */

    const handleChange = (e) => {

        const { name, value } = e.target;
        let newValue = value;

        /* FULL NAME */
        if (name === "name") {
            newValue = value.replace(/[^A-Za-z ]/g, "").slice(0, 25);
        }

        /* ORGANIZATION */
        if (name === "organization") {
            newValue = value.replace(/[^A-Za-z ]/g, "").slice(0, 25);
        }

        /* ADDRESS */
        if (name === "address") {
            newValue = value.slice(0, 35);
        }

        /* PINCODE */
        if (name === "pincode") {
            newValue = value.replace(/\D/g, "").slice(0, 6);
        }

        /* STORE NAME */
        if (name === "storeName") {
            newValue = value.slice(0, 30);
        }

        /* GST NUMBER */
        if (name === "gstNumber") {
            newValue = value.replace(/[^0-9A-Z]/gi, "").toUpperCase().slice(0, 15);
        }

        /* FSSAI LICENSE */
        if (name === "fssaiLicense") {
            newValue = value.replace(/\D/g, "").slice(0, 14);
        }

        /* STORAGE CAPACITY */
        if (name === "storageCapacity") {

            newValue = value.replace(/\D/g, "");

            if (newValue === "") newValue = "";
            else if (parseInt(newValue) > 10000) newValue = "10000";

        }

        /* EMERGENCY CONTACT */
        if (name === "emergencyContact") {
            newValue = value.replace(/\D/g, "").slice(0, 10);
        }

        setProfile(prev => ({
            ...prev,
            [name]: newValue
        }));

        setIsDirty(true);
    };

    /* ================= SAVE ================= */

    const saveProfile = async () => {

        try {

            await api.put(`/profile/${roleId}`, {
                name: profile.name,
                organization: profile.organization,
                address: profile.address,
                pincode: profile.pincode,
                storeName: profile.storeName,
                gstNumber: profile.gstNumber,
                fssaiLicense: profile.fssaiLicense,
                storageCapacity: profile.storageCapacity,
                emergencyContact: profile.emergencyContact
            });

            alert("Profile updated successfully");

            setEditMode(false);
            setIsDirty(false);

            /* 🔄 GLOBAL AUTO REFRESH EVENT */
            window.dispatchEvent(new Event("profileUpdated"));

        } catch (err) {

            console.error("Profile update failed:", err);
            alert("Failed to update profile");

        }
    };

    return (
        <RetailerLayout activeTab="profile">

            <section
                className="dashboard-content profile-desktop"
                style={{
                    display: "flex",
                    gap: 28,
                    overflow: "hidden",
                    marginTop: -20,
                    paddingLeft: 40,
                    height: "calc(100vh - 200px)",
                    alignItems: "flex-start"
                }}
            >

                {/* ===== LEFT CARD ===== */}

                <div
                    className="profile-card"
                    style={{
                        width: 340,
                        minWidth: 340
                    }}
                >
                    <div className="avatar-circle">
                        <img
                            src={retailerAvatar}
                            className="profile-avatar"
                            alt="profile"
                        />
                    </div>

                    <h3>{profile.name || roleName}</h3>

                    <p style={{ fontWeight: 600, fontSize: 13 }}>
                        ID: {roleId}
                    </p>

                    <p>{profile.location}</p>

                    <span className="joined">
                        Joined on{" "}
                        {profile.createdAt &&
                            new Date(profile.createdAt)
                                .toLocaleDateString("en-IN")}
                    </span>

                    <div className="profile-divider" />

                    <h4>Retailer Compliance</h4>

                    <div className="trust-center">
                        <div className="trust-row">
                            <span>Store Name</span>
                            <b>{profile.storeName || "-"}</b>
                        </div>

                        <div className="trust-row">
                            <span>GST No</span>
                            <b>{profile.gstNumber || "-"}</b>
                        </div>

                        <div className="trust-row">
                            <span>FSSAI License</span>
                            <b>{profile.fssaiLicense || "-"}</b>
                        </div>

                        <div className="trust-row">
                            <span>Storage Capacity</span>
                            <b>{profile.storageCapacity ? `${profile.storageCapacity} kg` : "-"}</b>
                        </div>
                    </div>

                    <div className="profile-divider" />

                    <h4>Contact</h4>

                    <div className="trust-row">
                        <span>Emergency Contact</span>
                        <b>{profile.emergencyContact || "-"}</b>
                    </div>

                </div>

                {/* ===== RIGHT FORM ===== */}

                <div
                    className="profile-form"
                    style={{
                        flex: 1,
                        maxWidth: 900
                    }}
                >

                    <div className="profile-header">
                        <h2>Profile Settings</h2>

                        <button
                            className="save-btn"
                            disabled={!editMode && false}
                            onClick={() =>
                                editMode ? saveProfile() : setEditMode(true)
                            }
                        >
                            {editMode ? "Save" : "Edit"}
                        </button>
                    </div>

                    {showAlert && (
                        <div
                            style={{
                                background: "#fff8dc",
                                border: "1px solid #f1d48b",
                                padding: "12px 16px",
                                borderRadius: 8,
                                fontSize: 14,
                                marginBottom: 16,
                                color: "#8a6d1d"
                            }}
                        >
                            ⚠ Complete your retailer compliance details to activate your account.
                        </div>
                    )}

                    <div className="profile-grid">

                        <Input
                            label="Full Name"
                            name="name"
                            value={profile.name}
                            onChange={handleChange}
                            disabled={!editMode}
                        />

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
                            label="Store Name"
                            name="storeName"
                            value={profile.storeName}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="e.g. ABC Fresh Mart"
                        />

                        <Input
                            label="GST Number"
                            name="gstNumber"
                            value={profile.gstNumber}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="e.g. 22ABAB0000A1Y5"
                        />

                        <Input
                            label="FSSAI License"
                            name="fssaiLicense"
                            value={profile.fssaiLicense}
                            onChange={handleChange}
                            disabled={!editMode}
                            placeholder="14 digit license"
                        />

                        <Input
                            label="Storage Capacity (kg)"
                            name="storageCapacity"
                            value={profile.storageCapacity}
                            onChange={handleChange}
                            disabled={!editMode}
                            maxLength={5}
                            placeholder="1 – 10,000kg"
                        />

                        <Input
                            label="Emergency Contact"
                            name="emergencyContact"
                            value={profile.emergencyContact}
                            onChange={handleChange}
                            disabled={!editMode}
                        />

                    </div>

                </div>

            </section>

        </RetailerLayout>
    );
}

/* ===== INPUT COMPONENT ===== */

function Input({ label, ...props }) {
    return (
        <div className="field">
            <label>{label}</label>
            <input {...props} />
        </div>
    );
}