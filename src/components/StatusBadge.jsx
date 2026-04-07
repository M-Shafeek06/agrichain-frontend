export default function StatusBadge({ status }) {
    if (!status) return null;

    const colors = {
        PICKED_UP: "#2563eb",
        IN_TRANSIT: "#f59e0b",
        AT_DISTRIBUTOR: "#16a34a",
        DELIVERED: "#16a34a"
    };

    return (
        <span style={{
            background: colors[status] || "#64748b",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600
        }}>
            {status.replaceAll("_", " ")}
        </span>
    );
}