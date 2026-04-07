import { useState } from "react";
import RetailerLayout from "../layouts/RetailerLayout";
import "./FarmerDashboard.css";

export default function RetailerSupport() {

    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: "Why is a product marked as Tampered?",
            a: "A product is marked tampered when blockchain hash verification or supply chain geo-route validation fails."
        },
        {
            q: "How is Retailer Trust Score calculated?",
            a: "Retailer trust score is based on verified sales, zero tamper alerts, and timely product authenticity updates."
        },
        {
            q: "Can I sell products without verification?",
            a: "No. Every product must be verified before retail sale to maintain blockchain integrity."
        }
    ];

    return (
        <RetailerLayout activeTab="support">

            <section className="dashboard-content profile-desktop">

                <div className="profile-form">

                    <h2>Retailer Support</h2>

                    {/* ================= FAQ SECTION ================= */}

                    {faqs.map((item, i) => (
                        <div key={i} style={styles.faqItem}>

                            <div
                                style={styles.faqHeader}
                                onClick={() =>
                                    setOpenFaq(openFaq === i ? null : i)
                                }
                            >
                                {item.q}
                                <span>
                                    {openFaq === i ? "−" : "+"}
                                </span>
                            </div>

                            {openFaq === i && (
                                <div style={styles.faqAnswer}>
                                    {item.a}
                                </div>
                            )}

                        </div>
                    ))}

                    {/* ================= CONTACT SECTION ================= */}

                    <div style={styles.contactBox}>

                        <h3>Contact Support</h3>

                        <p>Email: support@agrichaintrust.com</p>
                        <p>Phone: +91-9876543210</p>
                        <p>
                            Project: SIH25045 – Blockchain Supply Chain Transparency
                        </p>
                        <p>
                            Institute: Dhaanish Ahmed Institute of Technology
                        </p>

                    </div>

                </div>

            </section>

        </RetailerLayout>
    );
}

/* ================= STYLES ================= */

const styles = {

    faqItem: {
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        marginBottom: 12,
        overflow: "hidden"
    },

    faqHeader: {
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        cursor: "pointer",
        fontWeight: 600,
        background: "#f1f5f9"
    },

    faqAnswer: {
        padding: "12px 16px",
        fontSize: 14,
        background: "#ffffff"
    },

    contactBox: {
        marginTop: 24,
        borderTop: "1px solid #e5e7eb",
        paddingTop: 16,
        fontSize: 14
    }
};
