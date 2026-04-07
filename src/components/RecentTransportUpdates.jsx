import { useEffect, useState } from "react";
import api from "../api/axios";

export default function RecentTransportUpdates({ transporterId }) {
    const [updates, setUpdates] = useState([]);

    useEffect(() => {
        api.get(`/shipments/recent/${transporterId}`)
            .then(res => setUpdates(res.data || []))
            .catch(() => { });
    }, [transporterId]);

    return (
        <div style={styles.card}>
            <h3 style={styles.heading}>Recent Shipment Updates</h3>

            {updates.map(u => (
                <div key={u._id} style={styles.row}>
                    <strong>{u.batchId}</strong>
                    <span>{u.cropName} | {u.status}</span>
                    <span style={styles.time}>
                        {new Date(u.updatedAt).toLocaleString()}
                    </span>
                </div>
            ))}

            {!updates.length && <p style={{ color: "#64748b" }}>No updates yet</p>}
        </div>
    );
}

const styles = {
    card: {
        background: "#fff", padding: 22, borderRadius: 12,
        border: "1px solid #e5e7eb", height: "100%"
    },
    heading: { marginBottom: 16, fontWeight: 700 },
    row: {
        borderBottom: "1px solid #f1f5f9",
        padding: "10px 0", display: "flex", flexDirection: "column", gap: 4
    },
    time: { fontSize: 12, color: "#64748b" }
};
