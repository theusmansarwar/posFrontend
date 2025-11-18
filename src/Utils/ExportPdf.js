import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import image from "../Assets/IbrahimMotors.png";

export const exportDashboardPDF = (dashboardData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ---- Header (Logo + Company Info) ----
  const imgWidth = 40;
  const imgHeight = 25;
  const imgX = (pageWidth - imgWidth) / 2;
  doc.addImage(image, "PNG", imgX, 10, imgWidth, imgHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Ibrahim Autos & Wholesale", pageWidth / 2, 42, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Phone: 0307-8694372", pageWidth / 2, 48, { align: "center" });

  const formattedDate = new Date().toLocaleString("en-GB", { hour12: false });
  doc.text(`Date: ${formattedDate}`, pageWidth / 2, 54, { align: "center" });

  let currentY = 65;

  // Helper function to draw section title without dots
  const drawSectionTitle = (text) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(text, 14, currentY);
    currentY += 6;
  };

  // Helper: Insert data table
  const insertTable = (title, rows) => {
    drawSectionTitle(title);

    autoTable(doc, {
      startY: currentY,
      head: [["Metric", "Value"]],
      body: rows,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      didDrawPage: (data) => {
        currentY = data.cursor.y + 10;
      },
    });

    currentY = doc.lastAutoTable.finalY + 12;

    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
  };

  // ---- Build Report Sections ----
  insertTable("Products & Sales Overview", [
    ["Total Products", dashboardData.products.totalProducts.quantity],
    ["Total Products Value", dashboardData.products.totalProducts.price],
    ["Total Sold Units", dashboardData.products.totalSold.quantity],
    ["Total Sales Revenue", dashboardData.products.totalSold.sale],
    ["Today Sales", dashboardData.products.today.quantity],
    ["Yesterday Sales", dashboardData.products.yesterday.quantity],
    ["This Week", dashboardData.products.thisWeek.quantity],
    ["This Month", dashboardData.products.thisMonth.quantity],
  ]);

  insertTable("Expense Overview", [
    ["Today", dashboardData.expense.today],
    ["Yesterday", dashboardData.expense.yesterday],
    ["This Week", dashboardData.expense.thisWeek],
    ["This Month", dashboardData.expense.thisMonth],
    ["Total Expense", dashboardData.expense.totalExpense],
  ]);

  insertTable("Labour Cost Overview", [
    ["Today", dashboardData.labourCost.today],
    ["Yesterday", dashboardData.labourCost.yesterday],
    ["This Week", dashboardData.labourCost.thisWeek],
    ["This Month", dashboardData.labourCost.thisMonth],
    ["Last Month", dashboardData.labourCost.lastMonth],
    ["Total Labour Cost", dashboardData.labourCost.totalLabourCost],
  ]);

  insertTable("Pending Amount Summary", [
    ["Pending Amount", dashboardData.pendingAmount],
  ]);

 // ---- BAR CHART AFTER PENDING AMOUNT ----
currentY += 5; // some margin after Pending Amount table

// --- Chart Title ---
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.text("Summary Chart", pageWidth / 2, currentY, { align: "center" });

currentY += 8; // space below title

const chartData = [
  { title: "Total Products", value: dashboardData.products.totalProducts.quantity },
  { title: "Total Sold", value: dashboardData.products.totalSold.quantity },
  { title: "Expenses", value: dashboardData.expense.totalExpense },
  { title: "Labour Cost", value: dashboardData.labourCost.totalLabourCost },
  { title: "Pending", value: dashboardData.pendingAmount },
];

const chartX = 20;
const chartY = currentY;
const chartWidth = pageWidth - 40;
const chartHeight = 80;
const barWidth = chartWidth / chartData.length - 10;
const maxValue = Math.max(...chartData.map(d => d.value));

// Draw chart borders (left and bottom)
doc.setDrawColor(0);
doc.setLineWidth(0.2);
doc.line(chartX, chartY, chartX, chartY + chartHeight); // left border
doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight); // bottom border

// Draw bars
chartData.forEach((item, index) => {
  const barHeight = (item.value / maxValue) * chartHeight;
  const x = chartX + index * (barWidth + 10);
  const y = chartY + chartHeight - barHeight;

  doc.setFillColor(41, 128, 185);
  doc.rect(x, y, barWidth, barHeight, "F");

  doc.setFontSize(9);
  doc.text(String(item.value), x + barWidth / 2, y - 2, { align: "center" });

  const label = doc.splitTextToSize(item.title, barWidth);
  label.forEach((line, i) => {
    doc.text(line, x + barWidth / 2, chartY + chartHeight + 6 + i * 4, { align: "center" });
  });
});
  // ---- SAVE PDF ----
  doc.save("Dashboard_Report.pdf");
};
