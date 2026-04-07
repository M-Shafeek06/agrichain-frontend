import { useState } from "react";
import Navbar from "../components/Navbar";
import retailerAvatar from "../assets/retailer.png";
import { useNavigate } from "react-router-dom";
import "../pages/FarmerDashboard.css";
import { useEffect } from "react";
import api from "../api/axios";

export default function RetailerLayout({ children, activeTab = "" }) {

    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const retailerName = localStorage.getItem("roleName");
    const retailerId = localStorage.getItem("roleId");

    /* ================= NAV ITEMS ================= */

    const navItems = [
        { key: "overview", label: "Dashboard Overview", path: "/retailer-dashboard" },
        { key: "update", label: "Update Retail Status", path: "/retailer/update" },
        { key: "warehouse", label: "Retail Warehouse", path: "/retailer/warehouse" },
        { key: "sales", label: "Sales Analytics", path: "/retailer/sales" },
        { key: "history", label: "Product History", path: "/retailer/history" },
        { key: "marketplace", label: "Marketplace", path: "/retailer/marketplace" },
        { key: "requests", label: "My Requests", path: "/retailer/requests" },
        { key: "verify", label: "Verify QR / Batch", path: "/retailer/verify" },
        { key: "profile", label: "Profile Settings", path: "/retailer/profile" },
        { key: "support", label: "Support", path: "/retailer/support" }
    ];

    useEffect(() => {

        const handleProfileUpdate = async () => {

            const roleId = localStorage.getItem("roleId");
            if (!roleId) return;

            try {

                const res = await api.get(`/profile/${roleId}`);
                const p = res.data || {};

                const required = [
                    "storeName",
                    "gstNumber",
                    "fssaiLicense",
                    "storageCapacity",
                    "emergencyContact"
                ];

                const missing = required.some(f => !p[f]);

                if (!missing) {
                    window.location.reload();   // simple refresh
                }

            } catch (err) {
                console.log("Retailer profile refresh failed");
            }

        };

        window.addEventListener("profileUpdated", handleProfileUpdate);

        return () => {
            window.removeEventListener("profileUpdated", handleProfileUpdate);
        };

    }, []);


    return (
        <>
            <Navbar />

            <aside
                className={`drawer-panel ${drawerOpen ? "open" : ""}`}
                onMouseLeave={() => setDrawerOpen(false)}
            >

                {/* ================= PROFILE ================= */}

                <div className="drawer-profile">
                    <div className="avatar-wrap">
                        <img src={retailerAvatar} alt="retailer" />
                    </div>
                    <div>
                        <div>{retailerName}</div>
                        <div className="drawer-id">ID: {retailerId}</div>
                    </div>
                </div>

                {/* ================= NAVIGATION ================= */}

                <ul className="drawer-nav">

                    {navItems.map(item => (
                        <li
                            key={item.key}
                            className={
                                activeTab === item.key
                                    ? "nav-item active"
                                    : "nav-item"
                            }
                            onClick={() => navigate(item.path)}
                        >
                            {item.label}
                        </li>
                    ))}

                    {/* ================= LOGOUT ================= */}

                    <li
                        className="logout-item logout-btn"
                        style={{ marginTop: "0%" }}   // ← inline adjustment
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

            {/* ================= MAIN ================= */}

            <main
                style={{
                    display: "flex",
                    height: "calc(100vh - 70px)"  // adjust if navbar height differs
                }}
            >
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",     // only this scrolls
                        padding: "20px 30px"
                    }}
                >

                    <div
                        style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 10,
                            padding: "10px 0"
                        }}
                    >
                        <span
                            onMouseEnter={() => setDrawerOpen(true)}
                            style={{
                                fontSize: 22,
                                cursor: "pointer",
                                padding: "8px 12px",
                            }}
                        >
                            ☰
                        </span>
                    </div>

                    {children}

                </div>
            </main>
        </>
    );
}
