import transporterAvatar from "../assets/transporter.png";
import { useNavigate, useLocation } from "react-router-dom";

export default function TransporterSidebar({ drawerOpen, setDrawerOpen }) {
    const navigate = useNavigate();
    const location = useLocation();

    const roleId = localStorage.getItem("roleId");
    const roleName = localStorage.getItem("roleName");

    const isActive = (path) => location.pathname === path;

    return (
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

                <li
                    className={isActive("/transporter-dashboard") ? "nav-item active" : "nav-item"}
                    onClick={() => navigate("/transporter-dashboard")}
                >
                    Dashboard Overview
                </li>

                <li
                    className={isActive("/transporter/shipments") ? "nav-item active" : "nav-item"}
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
                    className={isActive("/transporter/history") ? "nav-item active" : "nav-item"}
                    onClick={() => navigate("/transporter/history")}
                >
                    My Transport History
                </li>

                <li
                    className={isActive("/transporter/upload-invoice") ? "nav-item active" : "nav-item"}
                    onClick={() => navigate("/transporter/upload-invoice")}
                >
                    Upload Invoice
                </li>

                <li
                    className={isActive("/transporter/invoice-history") ? "nav-item active" : "nav-item"}
                    onClick={() => navigate("/transporter/invoice-history")}
                >
                    Invoice History
                </li>

                <li
                    className={isActive("/transporter/profile") ? "nav-item active" : "nav-item"}
                    onClick={() => navigate("/transporter/profile")}
                >
                    Profile Settings
                </li>

                <li
                    className={isActive("/transporter/support") ? "nav-item active" : "nav-item"}
                    onClick={() => navigate("/transporter/support")}
                >
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
    );
}
