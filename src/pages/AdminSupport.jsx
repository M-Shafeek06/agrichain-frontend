import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

export default function AdminSupport() {

    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: "How do I manage user roles?",
            a: "You can manage roles and permissions from the Admin Dashboard under User Management section."
        },
        {
            q: "How is blockchain verification handled?",
            a: "All shipment and supply chain activities are verified using AgriChainTrust Ledger built on Ethereum-based blockchain."
        },
        {
            q: "What should I do if profile data is not saving?",
            a: "Ensure all required fields are filled and your internet connection is stable before saving changes."
        },
        {
            q: "Can I reset a user password?",
            a: "Yes, admins can trigger password reset requests from the user management panel."
        }
    ];

    return (
        <AdminLayout>

            <div style={styles.pageContainer}>

                <div style={styles.mainCard}>

                    {/* HEADER */}
                    <div style={styles.headerSection}>
                        <h2 style={styles.title}>Admin Support Center</h2>

                        <p style={styles.subtitle}>
                            Get help with administration, user management, and platform configuration
                        </p>
                    </div>


                    {/* TWO COLUMN SUPPORT LAYOUT */}
                    <div style={styles.supportLayout}>

                        {/* LEFT SIDE - FAQ */}
                        <div style={styles.faqSection}>

                            <h3 style={styles.sectionTitle}>Frequently Asked Questions</h3>

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

                        </div>


                        {/* RIGHT SIDE - ALWAYS VISIBLE CONTACT SUPPORT */}
                        <div style={styles.contactSection}>

                            <h3 style={styles.sectionTitle}>Contact Support</h3>

                            <div style={styles.contactBox}>
                                <p><b>Email:</b> support@agrichaintrust.com</p>
                                <p><b>Phone:</b> +91-9876543210</p>
                                <p><b>Project Code:</b> SIH25045</p>
                                <p>
                                    <b>Institute:</b> Dhaanish Ahmed Institute of Technology, Coimbatore
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </AdminLayout>
    );
}

const styles = {

    pageContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0px 24px 24px 24px",
        marginTop: "-40px",
        background: "#f1f5f9",
        minHeight: "94vh"
    },

    mainCard: {
        width: "1120px",                 // increased width
        minHeight: "520px",              // increased height
        background: "#ffffff",
        borderRadius: 18,
        padding: "32px 38px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.10)"
    },

    headerSection: {
        marginBottom: 22,
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: 14
    },

    title: {
        margin: 0,
        fontSize: 24
    },

    subtitle: {
        color: "#64748b",
        marginTop: 8,
        fontSize: 15
    },

    sectionTitle: {
        marginBottom: 15,
        fontSize: 18
    },

    /* TWO COLUMN LAYOUT */
    supportLayout: {
        display: "flex",
        gap: 30,
        marginTop: 16
    },

    faqSection: {
        flex: 2.3                      // slightly wider FAQ area
    },

    contactSection: {
        flex: 1.2
    },

    faqItem: {
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        marginBottom: 14,
        overflow: "hidden"
    },

    faqHeader: {
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        cursor: "pointer",
        fontWeight: 600,
        background: "#f8fafc",
        fontSize: 15
    },

    faqAnswer: {
        padding: "14px 18px",
        fontSize: 14,
        lineHeight: "1.7"
    },

    contactBox: {
        background: "#f8fafc",
        padding: 22,
        borderRadius: 14,
        lineHeight: "2",
        border: "1px solid #e5e7eb",
        fontSize: 15,

        /* Always visible on screen */
        position: "sticky",
        top: 14
    }
};

