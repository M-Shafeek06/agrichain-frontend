import { useEffect, useState } from "react";
import api from "../api/axios";

export default function TrustScoreMeter({ farmerId }) {
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (!farmerId) return;

        api.get(`/trust/farmer/${farmerId}`)
            .then(res => {
                setScore(res.data.trustScore || 0);
            })
            .catch(() => setScore(0));
    }, [farmerId]);

    const meterColor =
        score >= 80 ? "#10b981" :
            score >= 50 ? "#f59e0b" :
                "#dc2626";

    return (
        <div style={{
            textAlign: "center",
            padding: 10
        }}>
            <h4>Trust Score</h4>

            <div style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: `10px solid ${meterColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "10px auto"
            }}>
                <span style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: meterColor
                }}>
                    {score}%
                </span>
            </div>
        </div>
    );
}
