import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import DistributorSidebar from "../../components/DistributorSidebar";
import api from "../../api/axios";
import DistributorGuard from "../../guards/DistributorGuard";

export default function DistributorSupport() {
    const [open, setOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);

    const faqs = [
        {
            q: "Why is a shipment delayed?",
            a: "Delays occur due to transport or verification issues in the supply chain."
        },
        {
            q: "Can I modify dispatched inventory?",
            a: "No. Once dispatched, blockchain records are locked for integrity."
        },
        {
            q: "How do I contact retailers?",
            a: "Use the retailer directory available in this support panel."
        }
    ];

    useEffect(() => {
        async function fetchRetailers() {
            try {
                setLoading(true);
                const res = await api.get("/retailer/support-info");
                setRetailers(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Retailer fetch failed:", err);
                setRetailers([]);
            } finally {
                setLoading(false);
            }
        }

        fetchRetailers();


    }, []);

    return (
        <DistributorGuard>

            <>
                <Navbar />
                <DistributorSidebar open={open} setOpen={setOpen} />

                <div style={styles.wrapper}>

                    <div style={styles.headerRow}>
                        <div style={styles.hamburger} onMouseEnter={() => setOpen(true)}>
                            ☰
                        </div>
                        <h2 style={{ marginLeft: "12px" }}>Support Center</h2>
                    </div>

                    <div style={styles.card}>
                        <div style={styles.grid}>

                            {/* LEFT PANEL */}
                            <div>
                                {faqs.map((item, i) => (
                                    <div key={i} style={styles.faqItem}>
                                        <div
                                            style={styles.faqHeader}
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        >
                                            {item.q}
                                            <span>{openFaq === i ? "−" : "+"}</span>
                                        </div>

                                        {openFaq === i && (
                                            <div style={styles.faqAnswer}>{item.a}</div>
                                        )}
                                    </div>
                                ))}

                                <div style={styles.contact}>
                                    <h3>Contact Support</h3>
                                    <p>Email: support@agrichaintrust.com</p>
                                    <p>Phone: +91-9876543210</p>
                                </div>
                            </div>

                            {/* RIGHT PANEL */}
                            <div style={styles.sideCard}>
                                <h3>Available Retailers</h3>

                                <div style={styles.scroll}>
                                    {loading ? (
                                        <p>Loading retailers...</p>
                                    ) : retailers.length > 0 ? (
                                        retailers.map((r, i) => (
                                            <div key={i} style={styles.listItem}>
                                                <b>{r.name}</b>
                                                <p>{r.location}</p>
                                                <p>{r.phone || "N/A"}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No retailers available</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </>

        </DistributorGuard >
    );
}

const styles = {
    wrapper: {
        padding: "20px 28px",
        background: "#f3f6f4",
        flex: 1,
        display: "flex",
        flexDirection: "column"
    },

    headerRow: {
        display: "flex",
        alignItems: "center",
        marginBottom: 25
    },

    hamburger: {
        fontSize: 22,
        cursor: "pointer"
    },

    card: {
        background: "#fff",
        borderRadius: 14,
        padding: 22,
        boxShadow: "0 6px 14px rgba(0,0,0,0.06)"
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "3fr 1fr",
        gap: 20
    },

    faqItem: {
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        marginBottom: 10
    },

    faqHeader: {
        padding: 12,
        display: "flex",
        justifyContent: "space-between",
        cursor: "pointer",
        fontWeight: 600,
        background: "#f1f5f9"
    },

    faqAnswer: {
        padding: 12,
        fontSize: 14
    },

    contact: {
        marginTop: 20,
        borderTop: "1px solid #e5e7eb",
        paddingTop: 14
    },

    sideCard: {
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: 14,
        background: "#f9fafb"
    },

    scroll: {
        maxHeight: 360,
        overflowY: "auto"
    },

    listItem: {
        padding: "10px 0",
        borderBottom: "1px solid #e5e7eb",
        fontSize: 14
    }
};
