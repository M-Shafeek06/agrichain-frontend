import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function TransporterGuard({ children }) {

    const navigate = useNavigate();
    const ran = useRef(false);

    /* ================= PROFILE CHECK FUNCTION ================= */

    const checkProfile = async () => {

        const transporterId = localStorage.getItem("roleId");
        if (!transporterId) return;

        try {

            const res = await api.get(`/profile/${transporterId}`);
            const p = res.data || {};

            const required = [
                "vehicleNumber",
                "vehicleType",
                "capacity",
                "licenseNo",
                "licenseExpiry",
                "rcBook",
                "insuranceTill",
                "emergencyContact"
            ];

            const missing = required.some(f => !p[f]);

            if (missing) {
                alert("⚠ Please complete your transporter profile before accessing other pages.");
                navigate("/transporter/profile", { replace: true });
            }

        } catch (err) {
            console.log("Guard check failed");
        }
    };

    /* ================= INITIAL GUARD CHECK ================= */

    useEffect(() => {

        if (ran.current) return;   // prevents double execution
        ran.current = true;

        checkProfile();

    }, [navigate]);

    /* ================= AUTO REFRESH AFTER PROFILE SAVE ================= */

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