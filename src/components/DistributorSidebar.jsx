import { useNavigate, useLocation } from "react-router-dom";
import distributorAvatar from "../assets/distributor.png"; // optional image
import { useEffect, useRef, useState } from "react";

export default function DistributorSidebar({ open, setOpen }) {
    const navigate = useNavigate();
    const location = useLocation();
    const sidebarRef = useRef(null);

    const [name, setName] = useState("");
    const [id, setId] = useState("");

    useEffect(() => {
        const roleName = localStorage.getItem("roleName");
        const roleId = localStorage.getItem("roleId");
        const role = localStorage.getItem("role");

        if ((!roleId || role !== "DISTRIBUTOR") && location.pathname !== "/auth") {
            navigate("/auth", { replace: true });
            return;
        }

        setName(roleName || "Distributor");
        setId(roleId || "");
    }, [navigate, location.pathname]);

    const goTo = (path) => {
        if (location.pathname !== path) {
            navigate(path);
        }
        setOpen(false);
    };

    /* ✅ Reliable close when mouse leaves sidebar */
    const handleMouseLeave = (e) => {
        if (!sidebarRef.current) return;

        const toElement = e.relatedTarget;
        if (!sidebarRef.current.contains(toElement)) {
            setOpen(false);
        }
    };

    return (
        <aside
            ref={sidebarRef}
            className={`drawer-panel ${open ? "open" : ""}`}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {/* Profile */}
            <div className="drawer-profile">
                <div className="avatar-wrap">
                    <img src={distributorAvatar} alt="distributor" />
                </div>

                <div>
                    <div>{name}</div>
                    <div className="drawer-id">ID: {id}</div>
                </div>
            </div>

            {/* Navigation */}
            <ul className="drawer-nav">

                <li
                    className={location.pathname === "/distributor/dashboard" ? "nav-item active" : "nav-item"}
                    onClick={() => goTo("/distributor/dashboard")}
                >
                    Dashboard
                </li>

                <li
                    className={location.pathname === "/distributor/incoming" ? "nav-item active" : "nav-item"}
                    onClick={() => goTo("/distributor/incoming")}
                >
                    Incoming Shipments
                </li>

                <li
                    className={location.pathname === "/distributor/inventory" ? "nav-item active" : "nav-item"}
                    onClick={() => goTo("/distributor/inventory")}
                >
                    Warehouse Inventory
                </li>
                <li
                    className={
                        location.pathname === "/distributor/warehouse-history"
                            ? "nav-item active"
                            : "nav-item"
                    }
                    onClick={() => goTo("/distributor/warehouse-history")}
                >
                    Warehouse History
                </li>
                <li
                    className={
                        location.pathname === "/distributor/requests" ? "nav-item active" : "nav-item"}
                    onClick={() => goTo("/distributor/requests")}
                >
                    Retailer Requests
                </li>

                <li
                    className={
                        location.pathname === "/distributor/dispatch"
                            ? "nav-item active"
                            : "nav-item"
                    }
                    onClick={() => goTo("/distributor/dispatch")}
                >
                    Dispatch to Retailer
                </li>
                <li
                    className={
                        location.pathname === "/distributor/invoices"
                            ? "nav-item active"
                            : "nav-item"
                    }
                    onClick={() => goTo("/distributor/invoices")}
                >
                    Invoice History
                </li>
                <li
                    className={
                        location.pathname === "/distributor/profile"
                            ? "nav-item active"
                            : "nav-item"
                    }
                    onClick={() => goTo("/distributor/profile")}
                >
                    Profile Settings
                </li>

                <li
                    className={
                        location.pathname === "/distributor/support"
                            ? "nav-item active"
                            : "nav-item"
                    }
                    onClick={() => goTo("/distributor/support")}
                >
                    Support Center
                </li>


                {/* Logout */}
                <li
                    className="nav-item logout-btn"
                    style={{
                        marginTop: "65%",
                        marginBottom: 16,
                        paddingTop: 10,
                        paddingBottom: 10,
                        borderTop: "1px solid rgb(255, 255, 255)",
                        borderBottom: "1px solid rgb(255, 255, 255)",
                        fontWeight: 600,
                        cursor: "pointer",
                        borderRadius: 8,
                        textAlign: "center"
                    }}
                    onClick={() => {
                        if (!window.confirm("Do you want to logout?")) return;
                        localStorage.clear();
                        navigate("/auth", { replace: true });
                    }}
                >
                    LOG OUT
                </li>

            </ul>
        </aside>
    );
}
