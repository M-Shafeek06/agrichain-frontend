import { useState } from "react";
import Navbar from "../components/Navbar";
import TransporterSidebar from "../components/TransporterSidebar";
import { useNavigate } from "react-router-dom";
import "./FarmerDashboard.css";

export default function TransporterSupport() {
    const navigate = useNavigate();
    const roleId = localStorage.getItem("roleId");
    const roleName = localStorage.getItem("roleName");

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: "Why is my shipment marked as Tampered?",
            a: "This happens when shipment geo-location or blockchain hash verification fails."
        },
        {
            q: "How is Transporter Trust Score calculated?",
            a: "Trust score is calculated based on successful deliveries, verified routes, and absence of tamper alerts."
        },
        {
            q: "Can I modify shipment location?",
            a: "No. Any location modification automatically triggers blockchain re-verification and may mark shipment as tampered."
        }
    ];

    return (
        <>
            <Navbar />
            <TransporterSidebar
                drawerOpen={drawerOpen}
                setDrawerOpen={setDrawerOpen}
            />
            <main className="dashboard-layout">
                <div className="dashboard-main">
                    <div className="dashboard-topbar">
                        <span className="menu-btn" onMouseEnter={() => setDrawerOpen(true)}>☰</span>
                    </div>

                    <section className="dashboard-content profile-desktop">
                        <div className="profile-form">
                            <h2>Transporter Support</h2>

                            {faqs.map((item, i) => (
                                <div key={i} style={styles.faqItem}>
                                    <div style={styles.faqHeader} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                        {item.q}
                                        <span>{openFaq === i ? "−" : "+"}</span>
                                    </div>
                                    {openFaq === i && <div style={styles.faqAnswer}>{item.a}</div>}
                                </div>
                            ))}

                            <div style={styles.contactBox}>
                                <h3>Contact Support</h3>
                                <p>Email: support@agrichaintrust.com</p>
                                <p>Phone: +91-9876543210</p>
                                <p>Project: SIH25045 – Blockchain Supply Chain Transparency</p>
                                <p>Institute: Dhaanish Ahmed Institute of Technology</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

const styles = {
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
    }
};
