import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/utils/format";

interface RevenueRow {
  date: string;
  appointments: number;
  products: number;
}

interface AppointmentRow {
  date: string;
  count: number;
}

interface StaffPerfRow {
  name: string;
  appointments: number;
  revenue: number;
}

interface ProductSalesRow {
  name: string;
  qty: number;
  revenue: number;
}

interface ReportStats {
  revenue: number;
  appointmentRevenue: number;
  orderRevenue: number;
  appointmentCount: number;
  clientCount: number;
  avgRevenue: number;
}

interface ReportData {
  revenueData: RevenueRow[];
  appointmentData: AppointmentRow[];
  staffPerf: StaffPerfRow[];
  productSales: ProductSalesRow[];
  stats: ReportStats;
}

export function exportReportPdf(data: ReportData, dateFrom: string, dateTo: string) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  const sectionHeading = (title: string) => {
    if (y > 240) {
      doc.addPage();
      y = 18;
    }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, y);
    y += 7;
  };

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Glow By Miral — Business Report", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${dateFrom} to ${dateTo}`, pageWidth / 2, y, { align: "center" });
  y += 10;

  // Section 1: Revenue Summary
  sectionHeading("1. Revenue Summary");
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Revenue", formatCurrency(data.stats.revenue)],
      ["Appointment Revenue", formatCurrency(data.stats.appointmentRevenue)],
      ["Product Revenue", formatCurrency(data.stats.orderRevenue)],
      ["Total Appointments", String(data.stats.appointmentCount)],
      ["New Clients", String(data.stats.clientCount)],
      ["Avg Revenue / Appointment", formatCurrency(data.stats.avgRevenue)],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 30, 30] },
    columnStyles: { 0: { fontStyle: "bold" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  if (data.revenueData.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Date", "Appointment Revenue", "Product Revenue", "Total"]],
      body: data.revenueData.map((r) => [
        r.date,
        formatCurrency(r.appointments),
        formatCurrency(r.products),
        formatCurrency(r.appointments + r.products),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [60, 60, 60] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Section 2: Appointments
  sectionHeading("2. Appointments");
  if (data.appointmentData.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("No appointment data for selected period.", 14, y);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y,
      head: [["Date", "Appointments"]],
      body: data.appointmentData.map((r) => [r.date, String(r.count)]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [60, 60, 60] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Section 3: Staff Performance
  sectionHeading("3. Staff Performance");
  if (data.staffPerf.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("No completed appointments for selected period.", 14, y);
    y += 10;
  } else {
    autoTable(doc, {
      startY: y,
      head: [["Staff Member", "Appointments", "Revenue"]],
      body: [...data.staffPerf]
        .sort((a, b) => b.revenue - a.revenue)
        .map((s) => [s.name, String(s.appointments), formatCurrency(s.revenue)]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [60, 60, 60] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Section 4: Product Sales
  sectionHeading("4. Product Sales");
  if (data.productSales.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("No product sales for selected period.", 14, y);
  } else {
    autoTable(doc, {
      startY: y,
      head: [["Product", "Units Sold", "Revenue"]],
      body: [...data.productSales]
        .sort((a, b) => b.revenue - a.revenue)
        .map((p) => [p.name, String(p.qty), formatCurrency(p.revenue)]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [60, 60, 60] },
      margin: { left: 14, right: 14 },
    });
  }

  doc.save(`report-${dateFrom}-to-${dateTo}.pdf`);
}
