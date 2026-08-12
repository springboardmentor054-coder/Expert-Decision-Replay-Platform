import React, { useEffect, useState } from "react";
import api from "../api";

function Reports() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    api.get("/reports/summary")
      .then((response) => setReport(response.data))
      .catch((error) => console.error(error));
  }, []);

  if (!report) {
    return <div style={{ padding: "40px" }}>Loading report...</div>;
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 70px)",
      background: "#f5f7fb",
      padding: "35px 20px"
    }}>
      <div style={{ maxWidth: "1000px", margin: "auto" }}>
        <h1 style={{ color: "#1f2937" }}>Reports</h1>

        <p style={{ color: "#6b7280" }}>
          Decision management summary report
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px",
          marginTop: "30px"
        }}>
          {[
            ["Total Decisions", report.total_decisions],
            ["Approved", report.approved],
            ["Rejected", report.rejected],
            ["Pending", report.pending],
            ["Draft", report.draft]
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,.05)"
              }}
            >
              <p style={{ color: "#6b7280", margin: 0 }}>
                {label}
              </p>

              <h2 style={{
                fontSize: "28px",
                margin: "10px 0",
                color: "#1f2937"
              }}>
                {value}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;