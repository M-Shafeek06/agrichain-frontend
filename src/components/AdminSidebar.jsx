import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import adminAvatar from "../assets/admin.png";

export default function AdminSidebar({ open, setOpen }) {

    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef(null);

    const [adminName, setAdminName] = useState("Administrator");
    const [adminId, setAdminId] = useState("");

    /* ================= ADMIN AUTH CHECK ================= */

    useEffect(() => {

        const name = localStorage.getItem("roleName");
        const id = localStorage.getItem("roleId");
        const role = localStorage.getItem("role");

        if ((!id || role !== "ADMIN") && location.pathname !== "/auth") {
            navigate("/auth", { replace: true });
            return;
        }

        setAdminName(name || "Administrator");
        setAdminId(id || "");

    }, [navigate, location.pathname]);


    /* ================= NAVIGATION ================= */

    const goTo = (path) => {
        if (location.pathname !== path) {
            navigate(path);
        }
        setOpen(false);
    };


    /* ================= SIDEBAR AUTO CLOSE ================= */

    const handleMouseLeave = (e) => {

        if (!sidebarRef.current) return;

        const toElement = e.relatedTarget;

        if (!sidebarRef.current.contains(toElement)) {
            setOpen(false);
        }
    };


    /* ================= MENU ITEMS ================= */

    const menuItems = [

        { label: "Admin Dashboard", path: "/admin-dashboard" },

        { label: "Gas Analytics", path: "/admin/gas-analytics" },

        { label: "ML Evaluation", path: "/admin/ml-evaluation" },

        { label: "Attack Simulation", path: "/admin/attack" },

        { label: "Verify Produce", path: "/admin/verify-produce" },

        { label: "Verified Produce History", path: "/admin/verified-produce" },

        { label: "System Users", path: "/admin/users" },

        { label: "Activity Timeline", path: "/admin/activity" },
        { label: "Profile Settings", path: "/admin/profile" },

        { label: "Support Center", path: "/admin/support" }

    ];


    /* ================= LOGOUT ================= */

    const handleLogout = () => {

        if (!window.confirm("Do you want to logout?")) return;

        localStorage.clear();

        navigate("/auth", { replace: true });
    };


    return (
        <aside
            ref={sidebarRef}
            className={`drawer-panel ${open ? "open" : ""}`}
            onMouseLeave={handleMouseLeave}
            style={{
                pointerEvents: open ? "auto" : "none",
                flexDirection: "column",
                height: "100vh"
            }}
        >
            {/* ================= PROFILE ================= */}

            <div className="drawer-profile">

                <div className="avatar-wrap">
                    <img src={adminAvatar} alt="admin" />
                </div>

                <div>
                    <div>{adminName}</div>
                    <div className="drawer-id">ID: {adminId}</div>
                </div>

            </div>


            {/* ================= MENU ================= */}

            <ul
                className="drawer-nav"
                style={{
                    flex: 1,
                    overflowY: "auto"
                }}
            >

                {menuItems.map((item) => (

                    <li
                        key={item.path}
                        className={
                            location.pathname === item.path
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() => goTo(item.path)}
                    >
                        {item.label}
                    </li>

                ))}
            </ul>
            {/* ================= LOGOUT ================= */}

            <div
                className="nav-item logout-btn"
                style={{
                    display: "table",
                    margin: "10px auto 20px",
                    padding: "8px 16px",
                    borderTop: "1px solid rgba(255,255,255,0.4)",
                    borderBottom: "1px solid rgba(255,255,255,0.4)",
                    fontWeight: 600,
                    cursor: "pointer",
                    borderRadius: 8,
                    textAlign: "center"
                }}
                onClick={handleLogout}
            >
                LOG OUT
            </div>

        </aside>
    );
}