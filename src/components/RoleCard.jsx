import { useState } from "react";

function RoleCard({ title, description, icon, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <div style={styles.icon}>{icon}</div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.desc}>{description}</p>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#ffffff",
    border: "2px solid #14532d",     // ✅ ALWAYS visible border
    borderRadius: "16px",            // ✅ rounded-rectangle
    padding: "26px",
    width: "230px",
    cursor: "pointer",
    textAlign: "center",
    transition: "background-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box",
  },

  /* ✅ Hover = fill INSIDE card (NO movement) */
  cardHover: {
    backgroundColor: "#bbf7d0",      // 🟢 stronger green fill
    boxShadow: "0 6px 12px rgba(0,0,0,0.08)", // subtle depth only
  },

  icon: {
    fontSize: "38px",
    marginBottom: "14px",
  },

  title: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#0f172a",
  },

  desc: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#475569",
  },
};

export default RoleCard;
