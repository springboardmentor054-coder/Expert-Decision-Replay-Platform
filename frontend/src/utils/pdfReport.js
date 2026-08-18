import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


// ============================================================
// Generate Professional Decision PDF
// ============================================================

export const generateDecisionPDF = (data) => {

  const pdf = new jsPDF();

  const decision = data?.decision || {};
  const alternatives = data?.alternatives || [];
  const criteria = data?.criteria || [];
  const scores = data?.scores || [];
  const approvals = data?.approvals || [];


  // ==========================================================
  // HEADER
  // ==========================================================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);

  pdf.text(
    "EXPERT DECISION REPLAY PLATFORM",
    105,
    20,
    { align: "center" }
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);

  pdf.text(
    "Professional Decision Report",
    105,
    28,
    { align: "center" }
  );

  pdf.line(20, 34, 190, 34);


  // ==========================================================
  // DECISION INFORMATION
  // ==========================================================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);

  pdf.text(
    "Decision Information",
    20,
    46
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  pdf.text(
    `Decision ID: ${decision.decision_id ?? "-"}`,
    20,
    56
  );

  pdf.text(
    `Title: ${decision.title || "-"}`,
    20,
    64
  );

  pdf.text(
    `Status: ${decision.status || "-"}`,
    20,
    72
  );

  const createdDate = decision.created_at
    ? new Date(
        decision.created_at
      ).toLocaleString()
    : "-";

  pdf.text(
    `Created: ${createdDate}`,
    20,
    80
  );


  // ==========================================================
  // DESCRIPTION
  // ==========================================================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);

  pdf.text(
    "Decision Description",
    20,
    94
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  const description =
    decision.description || "-";

  const descriptionLines =
    pdf.splitTextToSize(
      description,
      170
    );

  pdf.text(
    descriptionLines,
    20,
    102
  );

  let currentY =
    102 +
    descriptionLines.length * 5 +
    10;


  // ==========================================================
  // ALTERNATIVES
  // ==========================================================

  if (alternatives.length > 0) {

    if (currentY > 250) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);

    pdf.text(
      "Alternatives",
      20,
      currentY
    );

    currentY += 5;

    autoTable(pdf, {

      startY: currentY,

      head: [[
        "ID",
        "Alternative",
        "Cost",
        "Feasibility",
        "Risk"
      ]],

      body: alternatives.map(
        (item) => [

          item.alternative_id ?? "-",

          item.name || "-",

          item.estimated_cost != null
            ? `Rs. ${item.estimated_cost}`
            : "-",

          item.feasibility || "-",

          item.risk_level || "-"

        ]
      ),

      theme: "grid",

      styles: {
        fontSize: 8
      },

      headStyles: {
        fontStyle: "bold"
      }

    });

    currentY =
      pdf.lastAutoTable.finalY + 12;
  }


  // ==========================================================
  // CRITERIA
  // ==========================================================

  if (criteria.length > 0) {

    if (currentY > 250) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);

    pdf.text(
      "Decision Criteria",
      20,
      currentY
    );

    currentY += 5;

    autoTable(pdf, {

      startY: currentY,

      head: [[
        "ID",
        "Criteria",
        "Weight"
      ]],

      body: criteria.map(
        (item) => [

          item.criteria_id ?? "-",

          item.name || "-",

          item.weight ?? "-"

        ]
      ),

      theme: "grid",

      styles: {
        fontSize: 8
      },

      headStyles: {
        fontStyle: "bold"
      }

    });

    currentY =
      pdf.lastAutoTable.finalY + 12;
  }


  // ==========================================================
  // SCORES
  // ==========================================================

  if (scores.length > 0) {

    if (currentY > 250) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);

    pdf.text(
      "Alternative Scores",
      20,
      currentY
    );

    currentY += 5;

    autoTable(pdf, {

      startY: currentY,

      head: [[
        "Alternative ID",
        "Criteria ID",
        "Score"
      ]],

      body: scores.map(
        (item) => [

          item.alternative_id ?? "-",

          item.criteria_id ?? "-",

          item.score ?? "-"

        ]
      ),

      theme: "grid",

      styles: {
        fontSize: 8
      },

      headStyles: {
        fontStyle: "bold"
      }

    });

    currentY =
      pdf.lastAutoTable.finalY + 12;
  }


  // ==========================================================
  // APPROVAL HISTORY
  // ==========================================================

  if (approvals.length > 0) {

    if (currentY > 240) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);

    pdf.text(
      "Approval History",
      20,
      currentY
    );

    currentY += 5;

    autoTable(pdf, {

      startY: currentY,

      head: [[
        "Reviewer",
        "Level",
        "Status",
        "Remarks",
        "Date"
      ]],

      body: approvals.map(
        (item) => [

          item.reviewer_id ?? "-",

          item.approval_level ?? "-",

          item.status || "-",

          item.remarks || "-",

          item.approved_at
            ? new Date(
                item.approved_at
              ).toLocaleString()
            : "-"

        ]
      ),

      theme: "grid",

      styles: {
        fontSize: 7
      },

      headStyles: {
        fontStyle: "bold"
      }

    });

  }


  // ==========================================================
  // FOOTER
  // ==========================================================

  const pageCount =
    pdf.internal.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page++
  ) {

    pdf.setPage(page);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);

    pdf.text(
      "Expert Decision Replay Platform",
      20,
      285
    );

    pdf.text(
      `Page ${page} of ${pageCount}`,
      190,
      285,
      {
        align: "right"
      }
    );
  }


  // ==========================================================
  // DOWNLOAD
  // ==========================================================

  const safeTitle =
    (decision.title || "Decision")
      .replace(
        /[^a-z0-9]/gi,
        "_"
      );

  pdf.save(
    `Decision_Report_${safeTitle}.pdf`
  );
};