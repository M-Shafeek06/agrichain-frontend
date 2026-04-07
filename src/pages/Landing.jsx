import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <style>
        {`
          .ctaBtn {
            padding: 12px 30px;
            font-size: 15px;
            font-weight: 600;
            background-color: transparent;
            color: #166534;
            border: 2px solid #166534;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .ctaBtn:hover {
            background-color: #166534;
            color: #ffffff;
          }
        `}
      </style>

      {/* BACKGROUND WRAPPER */}
      <div style={styles.background}>
        {/* GLASS CARD */}
        <div style={styles.glassCard}>
          <h1 style={styles.title}>AgriChainTrust</h1>

          <p style={styles.subtitle}>
            A blockchain-enabled framework for transparent, tamper-proof, and
            end-to-end traceability of agricultural produce across the supply
            chain.
          </p>

          <div style={styles.divider} />

          <p style={styles.description}>
            The system records verified supply chain events — including
            production, transportation, and retail updates — on an immutable
            ledger, enabling trust, accountability, and data integrity for
            farmers, stakeholders, and consumers.
          </p>

          <button
            className="ctaBtn"
            onClick={() => {
              localStorage.clear();
              navigate("/auth");
            }}
          >
            Get Started
          </button>

        </div>
      </div>
    </>
  );
}

const styles = {
  background: {
    minHeight: "calc(100vh - 70px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage:
      "linear-gradient(to right bottom, rgba(22,101,52,0.6), rgba(15,23,42,0.7))",
    backgroundSize: "cover",
    backgroundPosition: "center"
  },


  glassCard: {
    width: "80%",
    maxWidth: "900px",
    padding: "60px 70px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.78)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 25px 50px rgba(0,0,0,0.18)",
    textAlign: "center"
  },

  title: {
    fontSize: "34px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "16px"
  },

  subtitle: {
    fontSize: "18px",
    color: "#334155",
    lineHeight: "1.6",
    marginBottom: "20px"
  },

  divider: {
    width: "60px",
    height: "4px",
    background: "linear-gradient(90deg, #166534, #22c55e)",
    margin: "22px auto",
    borderRadius: "3px"
  },

  description: {
    fontSize: "16px",
    color: "#475569",
    lineHeight: "1.7",
    marginBottom: "30px"
  }
};

export default Landing;
