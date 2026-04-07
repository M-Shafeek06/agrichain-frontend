import { useState } from "react";
import Navbar from "../components/Navbar";
import AdminSidebar from "../components/AdminSidebar";
import "../pages/FarmerDashboard.css";

export default function AdminLayout({ children }) {

    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <Navbar />

            {/* 🔥 Wrapper controls mouse leave */}
            <div
                className="dashboard-layout"
                onMouseLeave={() => setDrawerOpen(false)}
            >
                {/* ✅ PASS setOpen (CRITICAL FIX) */}
                <AdminSidebar open={drawerOpen} setOpen={setDrawerOpen} />

                <div className="dashboard-main">
                    <div className="dashboard-topbar">
                        <span
                            className="menu-btn"
                            onMouseEnter={() => setDrawerOpen(true)}
                        >
                            ☰
                        </span>
                    </div>

                    <section className="dashboard-content">
                        {children}
                    </section>
                </div>
            </div>
        </>
    );
}