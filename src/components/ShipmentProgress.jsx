const STAGES = [
    "PICKED_UP",
    "IN_TRANSIT",
    "AT_DISTRIBUTOR",
    "DELIVERED"
];

export default function ShipmentProgress({ status }) {
    if (!status) return null;

    const currentIndex = STAGES.indexOf(status);

    const progressPercent =
        currentIndex === -1
            ? 0
            : ((currentIndex + 1) / STAGES.length) * 100;

    return (
        <div style={{ marginTop: 8 }}>
            <div style={styles.progressLine}>
                <div
                    style={{
                        ...styles.progressFill,
                        width: `${progressPercent}%`
                    }}
                />
            </div>

            <div style={styles.labels}>
                {STAGES.map((stage, i) => (
                    <span
                        key={stage}
                        style={{
                            color:
                                i <= currentIndex
                                    ? "#047857"
                                    : "#94a3b8"
                        }}
                    >
                        {stage.replaceAll("_", " ")}
                    </span>
                ))}
            </div>
        </div>
    );
}

const styles = {
    progressLine: {
        height: 6,
        background: "#e5e7eb",
        borderRadius: 4,
        overflow: "hidden"
    },
    progressFill: {
        height: "100%",
        background: "#16a34a",
        borderRadius: 4,
        transition: "0.4s ease"
    },
    labels: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 10,
        marginTop: 6
    }
};