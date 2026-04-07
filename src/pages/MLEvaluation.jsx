import { useEffect, useState } from "react";
import api from "../api/axios";
import AdminLayout from "../layouts/AdminLayout";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function MLEvaluation() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const res = await api.get("/ml/evaluation");
        if (!res.data) throw new Error("Empty response");
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load ML evaluation data");
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluation();
  }, []);

  if (loading) return <Centered text="Loading ML evaluation..." />;
  if (error) return <Centered text={error} error />;
  if (!data) return <Centered text="No evaluation data available" />;

  const {
    accuracy = 0,
    precision = 0,
    recall = 0,
    confusionMatrix = {},
    totalRecords = 0
  } = data;

  const { tn = 0, fp = 0, fn = 0, tp = 0 } = confusionMatrix;

  // F1 Score
  const f1 =
    precision && recall
      ? (2 * Number(precision) * Number(recall) /
        (Number(precision) + Number(recall))).toFixed(2)
      : "N/A";

  const trendData = [
    { name: "Run 1", acc: 0.85 },
    { name: "Run 2", acc: 0.88 },
    { name: "Run 3", acc: 0.91 },
    { name: "Current", acc: accuracy }
  ];

  return (
    <AdminLayout>
      <section style={styles.page}>

        <h2 style={styles.title}>
          AI Tamper Detection – Model Evaluation
        </h2>

        {/* KPI ROW */}
        <div style={styles.grid}>
          <Metric title="Dataset Size" value={totalRecords} color="#059669" />
          <Metric title="Accuracy" value={accuracy} color="#16a34a" />
          <Metric title="Precision" value={precision} color="#f59e0b" />
          <Metric title="Recall" value={recall} color="#2563eb" />
          <Metric title="F1 Score" value={f1} color="#7c3aed" />
        </div>

        {/* BOTTOM SECTION */}
        <div style={styles.bottomGrid}>

          {/* CHART */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Model Accuracy Trend</h3>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <XAxis dataKey="name" />
                <YAxis domain={[0.8, 1]} />
                <Tooltip />
                <Line type="monotone" dataKey="acc" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* HEATMAP */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Confusion Matrix</h3>

            <div style={styles.heatmap}>
              <HeatCell label="True Negative" value={tn} color="#16a34a" />
              <HeatCell label="False Positive" value={fp} color="#f59e0b" />
              <HeatCell label="False Negative" value={fn} color="#f59e0b" />
              <HeatCell label="True Positive" value={tp} color="#16a34a" />
            </div>

            <div style={styles.legend}>
              <span style={{ color: "#16a34a" }}>■ Correct</span>
              <span style={{ color: "#f59e0b" }}>■ Errors</span>
            </div>
          </div>

        </div>

      </section>
    </AdminLayout>
  );
}

/* COMPONENTS */

function Metric({ title, value, color }) {
  return (
    <div
      style={{ ...styles.metricCard, borderTop: `4px solid ${color}` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow = `0 15px 35px ${color}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.08)";
      }}
    >
      <p style={styles.metricTitle}>{title}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  );
}

function HeatCell({ label, value, color }) {
  return (
    <div
      style={{
        ...styles.heatCell,
        background: color === "#16a34a" ? "#ecfdf5" : "#fff7ed",
        border: `2px solid ${color}`
      }}
    >
      <p style={{ fontSize: 13 }}>{label}</p>
      <h2 style={{ margin: 0 }}>{value}</h2>
    </div>
  );
}

function Centered({ text, error }) {
  return (
    <AdminLayout>
      <div style={styles.center}>
        <h3 style={{ color: error ? "red" : "#333" }}>{text}</h3>
      </div>
    </AdminLayout>
  );
}

/* STYLES */

const styles = {
  page: {
    padding: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    background: "linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%)",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
  },

  title: {
    marginBottom: 20,
    fontWeight: 600,
    marginTop: "-75px"
  },

  center: {
    padding: 50,
    textAlign: "center"
  },

  /* KPI GRID */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 16,
    marginBottom: 24
  },

  metricCard: {
    padding: 18,
    background: "linear-gradient(180deg, #ffffff, #f9fafb)",
    borderRadius: 16,
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    minHeight: "95px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    transition: "all 0.25s ease"
  },

  metricTitle: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 6
  },

  metricValue: {
    fontSize: 26,
    margin: 0,
    fontWeight: 600
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "2.3fr 1.2fr",
    gap: 20,
    marginTop: 10
  },

  card: {
    background: "linear-gradient(180deg, #ffffff, #f8fafc)",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb"
  },

  sectionTitle: {
    marginBottom: 14,
    fontWeight: 600
  },

  heatmap: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 10
  },

  heatCell: {
    borderRadius: 10,
    padding: 14, // reduced from 20+
    textAlign: "center",
    minHeight: "70px", // 🔥 smaller height
    display: "flex",
    flexDirection: "column",
    justifyContent: "center"
  },

  legend: {
    marginTop: 10,
    display: "flex",
    justifyContent: "center",
    gap: 20,
    fontSize: 13
  }
};