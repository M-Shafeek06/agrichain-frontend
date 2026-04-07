import { useNavigate } from "react-router-dom";
import appLogo from "../assets/AgriChainLeaf.png";

function Navbar({ showBack = false, backTo = "/" }) {
  const navigate = useNavigate();

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.left}>
          {showBack && (
            <button style={styles.backBtn} onClick={() => navigate(backTo)}>
              ← Back
            </button>
          )}
          <div style={styles.logoWrapper}>
            <img src={appLogo} alt="AgriChainTrust Logo" style={styles.logoImage} />
          </div>
          <div>
            <h1 style={styles.logo}>AgriChainTrust</h1>
            <span style={styles.subtitle}>
              Blockchain-Based Agricultural Traceability System
            </span>
          </div>
        </div>

        <div style={styles.right}>
          <span>Version 1.0</span>
          <span>|</span>
          <span>Final Year Project</span>
          <span>|</span>
          <span>2025 - 2026</span>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    width: "100%",
    height: "86px",               // 🔒 fixed height for layout math
    minHeight: "86px",
    backgroundColor: "#14532d",
    borderBottom: "3px solid #0f172a",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "center"
  },

  logoWrapper: {
    height: "58px",
    width: "58px",
    borderRadius: "50%",          // 🔥 makes it curved
    overflow: "hidden",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.25)"
  },

  logoImage: {
    height: "140%",
    width: "140%",
    objectFit: "contain"
  },

  container: {
    width: "100%",
    maxWidth: "1400px",
    padding: "0 48px",           // perfectly equal outer spacing
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxSizing: "border-box"
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },

  logo: {
    margin: 0,
    fontSize: "26px",
    color: "#ffffff",
    lineHeight: "1.2"
  },

  subtitle: {
    fontSize: "13px",
    color: "#dcfce7",
    marginTop: "2px",
    display: "block"
  },

  backBtn: {
    background: "transparent",
    border: "1px solid #bbf7d0",
    color: "#ecfeff",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    whiteSpace: "nowrap"
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#ecfeff",
    fontSize: "13px",
    whiteSpace: "nowrap"
  }
};

export default Navbar;
