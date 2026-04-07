import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function RetailerGuard({ children }) {

    const navigate = useNavigate();
    const ran = useRef(false);

    useEffect(() => {

        if (ran.current) return;
        ran.current = true;

        const roleId = localStorage.getItem("roleId");
        if (!roleId) return;

        const checkProfile = async () => {

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

                if (missing) {

                    alert("⚠ Please complete your retailer profile before accessing other pages.");

                    navigate("/retailer/profile", { replace: true });

                }

            } catch (err) {

                console.log("Retailer guard check failed");

            }

        };

        checkProfile();

    }, [navigate]);

    return children;
}