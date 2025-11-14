import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import image from "../Assets/IbrahimMotors.png";

export const exportPDF = (title, data) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Logo ---
    const imgWidth = 40;
    const imgHeight = 25;
    const imgX = (pageWidth - imgWidth) / 2;
    const imgY = 10;
    doc.addImage(image, 'PNG', imgX, imgY, imgWidth, imgHeight);

    // --- Company Info ---
    const textStartY = imgY + imgHeight + 10;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Ibrahim Autos & Wholesale", pageWidth / 2, textStartY, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Phone: 0307-8694372", pageWidth / 2, textStartY + 6, { align: "center" });

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString("en-GB", { hour12: false });
    doc.text(`Date: ${formattedDate}`, pageWidth / 2, textStartY + 12, { align: "center" });

    // --- Section Title ---
    const titleY = textStartY + 22;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, titleY, { align: "center" });

    // --- Table ---
    const tableY = titleY + 8;
    autoTable(doc, {
        startY: tableY,
        head: [['Metric', 'Value']],
        body: data.map(item => [item.title, item.value]),
        styles: { fontSize: 11, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // --- Bar Chart Below Table ---
    const chartStartY = doc.lastAutoTable.finalY + 15; // margin above chart
    const chartHeight = 50;
    const chartWidth = pageWidth - 40;
    const barWidth = chartWidth / data.length - 10;
    const chartLeftX = 20;
    const maxValue = Math.max(...data.map(d => Number(d.value.toString().replace(/[^\d]/g, ''))));

    // --- Chart Title with margin bottom ---
    const chartTitleSize = 14;
    doc.setFontSize(chartTitleSize);
    doc.setFont("helvetica", "bold");
    const chartTitleY = chartStartY - 5;
    doc.text("Summary Chart", pageWidth / 2, chartTitleY, { align: "center" });
    const chartActualStartY = chartStartY + 8; // margin below chart title
    const chartBottomY = chartActualStartY + chartHeight;

    // Draw axes
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(chartLeftX, chartActualStartY, chartLeftX, chartBottomY); // left axis
    doc.line(chartLeftX, chartBottomY, chartLeftX + chartWidth, chartBottomY); // bottom axis

    // Draw bars
    data.forEach((item, index) => {
        const value = Number(item.value.toString().replace(/[^\d]/g, ''));
        const barHeight = (value / maxValue) * chartHeight;
        const x = chartLeftX + index * (barWidth + 10);
        const y = chartBottomY - barHeight;

        // Fill bar
        doc.setFillColor(41, 128, 185);
        doc.rect(x, y, barWidth, barHeight, 'F');

        // Value above bar
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${item.value}`, x + barWidth / 2, y - 2, { align: "center" });

        // Label below bar
        // Label below bar with auto wrapping
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);

        // Correct wrap width based on bar width
        const maxLabelWidth = barWidth;
        const wrapped = doc.splitTextToSize(item.title, maxLabelWidth);

        // Calculate starting Y so wrapped text stays centered below bar
        const textStartY = chartBottomY + 6;

        // Draw wrapped lines centered
        wrapped.forEach((line, i) => {
            doc.text(line, x + barWidth / 2, textStartY + (i * 4), { align: "center" });
        });


    });

    // --- Save PDF ---
    doc.save(`${title}.pdf`);
};
