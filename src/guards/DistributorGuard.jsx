import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function DistributorGuard({ children }) {

    const navigate = useNavigate();
    const ran = useRef(false);

    /* ================= PROFILE CHECK ================= */

    const checkProfile = async () => {

        const roleId = localStorage.getItem("roleId");
        if (!roleId) return;

        try {

            const res = await api.get(`/profile/${roleId}`);
            const p = res.data || {};

            const required = [
                "name",
                "address",
                "pincode",
                "emergencyContact",
                "warehouseCapacity"
            ];

            const missing = required.some(f => !p[f]);

            if (missing) {

                alert("⚠ Please complete your distributor profile before accessing other pages.");

                navigate("/distributor/profile", { replace: true });

            }

        } catch (err) {
            console.log("Distributor guard check failed");
        }
    };

    /* ================= INITIAL CHECK ================= */

    useEffect(() => {

        if (ran.current) return;
        ran.current = true;

        checkProfile();

    }, [navigate]);

    /* ================= AUTO REFRESH AFTER SAVE ================= */

    useEffect(() => {

        const handleProfileUpdate = () => {
            checkProfile();
        };

        window.addEventListener("profileUpdated", handleProfileUpdate);

        return () => {
            window.removeEventListener("profileUpdated", handleProfileUpdate);
        };

    }, []);

    return children;
}