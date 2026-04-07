import { useState, useEffect } from "react";
import api from "../api/axios";
import "./FarmerDashboard.css";

export default function Support() {
    const [openFaq, setOpenFaq] = useState(null);
    const [transporters, setTransporters] = useState([]);
    const [loading, setLoading] = useState(true);

    const faqs = [
        {
            q: "Why is my batch marked as Tampered?",
            a: "This happens when blockchain hash does not match produce snapshot or shipment trail."
        },
        {
            q: "What does Trust Score = 0 mean?",
            a: "Your batches failed verification such as geo mismatch or blockchain inconsistency."
        },
        {
            q: "Can I edit produce data after submission?",
            a: "No. Any modification will trigger tamper alerts to maintain integrity."
        }
    ];

    /* ================= FETCH TRANSPORTERS ================= */
    useEffect(() => {
        async function fetchTransporters() {
            try {
                setLoading(true);
                const res = await api.get("/transporter/support-info");
                setTransporters(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Transporter fetch failed:", err);
                setTransporters([]);
            } finally {
                setLoading(false);
            }
        }

        fetchTransporters();
    }, []);

    return (
        <section style={styles.pageWrapper}>
            <div style={styles.mainCard}>

                {/* ===== TITLE ===== */}
                <h2 style={styles.title}>Support Center</h2>

                <div style={styles.container}>

                    {/* ================= LEFT PANEL ================= */}
                    <div style={styles.leftPanel}>

                        {faqs.map((item, i) => (
                            <div key={i} style={styles.faqItem}>
                                <div
                                    style={styles.faqHeader}
                                    onClick={() =>
                                        setOpenFaq(openFaq === i ? null : i)
                                    }
                                >
                                    {item.q}
                                    <span>{openFaq === i ? "−" : "+"}</span>
                                </div>

                                {openFaq === i && (
                                    <div style={styles.faqAnswer}>
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div style={styles.contactBox}>
                            <h3>Contact Support</h3>
                            <p>Email: support@agrichaintrust.com</p>
                            <p>Phone: +91-9876543210</p>
                            <p>
                                Project: SIH25045 – Blockchain Supply Chain
                                Transparency
                            </p>
                            <p>
                                Institute: Dhaanish Ahmed Institute of
                                Technology
                            </p>
                        </div>

                    </div>

                    {/* ================= RIGHT PANEL ================= */}
                    <div style={styles.rightPanel}>

                        <h3 style={styles.transporterTitle}>
                            Available Transporters
                        </h3>

                        <div style={styles.scrollArea}>

                            {loading ? (
                                <p style={styles.placeholder}>
                                    Loading transporters...
                                </p>
                            ) : transporters.length > 0 ? (
                                transporters.map((t) => (
                                    <div key={t._id || t.name} style={styles.transporterItem}>
                                        <p><b>{t.name}</b></p>
                                        <p>{t.location}</p>
                                        <p>{t.phone || "N/A"}</p>
                                    </div>
                                ))
                            ) : (
                                <p style={styles.placeholder}>
                                    No transporters available
                                </p>
                            )}

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}

/* ================= STYLES ================= */

const styles = {

    pageWrapper: {
        padding: "20px 30px",
        width: "92%"
    },

    mainCard: {
        width: "100%",
        maxWidth: "1400px",
        margin: -20,
        background: "#ffffff",
        borderRadius: 16,
        padding: 28,
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
    },

    title: {
        marginBottom: 18
    },

    container: {
        display: "grid",
        gridTemplateColumns: "3fr 1fr", // 75% / 25%
        gap: 20,
        alignItems: "start"
    },

    /* LEFT PANEL */

    leftPanel: {
        width: "100%"
    },

    faqItem: {
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        marginBottom: 10,
        overflow: "hidden"
    },

    faqHeader: {
        padding: "10px 14px",
        display: "flex",
        justifyContent: "space-between",
        cursor: "pointer",
        fontWeight: 600,
        background: "#f1f5f9"
    },

    faqAnswer: {
        padding: "10px 14px",
        fontSize: 14
    },

    contactBox: {
        marginTop: 20,
        borderTop: "1px solid #e5e7eb",
        paddingTop: 14
    },

    /* RIGHT PANEL */

    rightPanel: {
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 14,
        background: "#f9fafb",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
    },

    transporterTitle: {
        marginBottom: 10
    },

    scrollArea: {
        maxHeight: 360,
        overflowY: "auto",
        paddingRight: 4
    },

    transporterItem: {
        padding: "10px 0",
        borderBottom: "1px solid #e5e7eb",
        fontSize: 14
    },

    placeholder: {
        color: "#6b7280"
    }
};
