import * as React from "react";
import { X, Printer, Download } from "lucide-react";
import { FaPhoneAlt } from "react-icons/fa";
import { formatDate } from "../../Utils/Formatedate";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logoo from "../../Assets/logoo.jpg";
import "./billHistory.css"; 

export default function BillHistoryModal({ open, setOpen, Modeldata }) {
    const billRef = React.useRef();

    const handleClose = () => setOpen(false);

    const handlePrint = () => {
        const logoElement = billRef.current?.querySelector(".company-logo");
        const logoSrc = logoElement?.src || logoo;

        const printWindow = window.open("", "", "width=800,height=600");
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; margin: 0; }
                    .receipt { max-width: 400px; margin: 0 auto; }
                    .receipt-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; }
                    .company-logo { width: 70px; height: 70px; object-fit: contain; margin-bottom: 10px; }
                    .receipt-header h2 { margin: 0 0 10px 0; color: #1e3a8a; font-size: 22px; }
                    .receipt-header p { margin: 4px 0; font-size: 12px; }
                    .receipt-info { margin-bottom: 20px; font-size: 12px; }
                    .receipt-info p { margin: 4px 0; }
                    .Bill-date { display: flex; flex-direction: column; align-items: center; margin-bottom: 8px; }
                    .Cashier-info { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .customer-info-section { border-top: 1px dashed #ccc; padding-top: 5px; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid #e5e7eb; }
                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; font-size: 12px; }
                    th { background: #f3f4f6; border-bottom: 2px solid #1e3a8a; }
                    tbody tr { background: white; }
                    .receipt-summary { border-top: 2px solid #1e3a8a; padding-top: 15px; }
                    .summary-line { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
                    .summary-line:last-child { border-bottom: none; }
                    .summary-line.total { font-size: 17px; font-weight: 700; color: #1e3a8a; margin-top: 10px; padding-top: 10px; border-top: 2px solid #e5e7eb; }
                    .savings-highlight { color: #059669; font-weight: 600; background: #d1fae5; padding: 8px; border-radius: 3px; margin: 5px 0; }
                    .labor-highlight { color: #0369a1; font-weight: 600; background: #e0f2fe; padding: 8px; border-radius: 3px; margin: 5px 0; }
                    .receipt-footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px solid #1e3a8a; }
                    .receipt-footer p { margin: 4px 0; font-size: 12px; }
                    .watermark { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #d1d5db; }
                    .watermark p { margin: 2px 0; font-size: 11px; color: #9ca3af; }
                    .watermark strong { color: #1e3a8a; font-size: 12px; }
                </style>
            </head>
            <body>
                ${billRef.current.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleDownload = async () => {
        if (!billRef.current) return;
        const element = billRef.current;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let imgWidth = pageWidth - 20;
        let imgHeight = (canvas.height * imgWidth) / canvas.width;
        if (imgHeight > pageHeight - 20) {
            const scaleFactor = (pageHeight - 20) / imgHeight;
            imgWidth *= scaleFactor;
            imgHeight *= scaleFactor;
        }
        const xPosition = (pageWidth - imgWidth) / 2;
        const yPosition = 10;
        pdf.addImage(imgData, "PNG", xPosition, yPosition, imgWidth, imgHeight);
        pdf.save(`Bill-${Modeldata?.billId}.pdf`);
    };

    if (!open || !Modeldata) return null;

    const { 
        billId, 
        createdAt, 
        totalAmount, 
        paymentMode, 
        userPaidAmount, 
        remainingAmount, 
        change,
        discount,
        labourCost,
        staff, 
        items,
        shift,
        customerName,
        customerPhone
    } = Modeldata;

    // Calculate subtotal from items
    const calculateSubtotal = () => {
        return items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
    };

    return (
        <div className="bill-modal-overlay">
            <div className="bill-modal-container">
                {/* Close Button */}
                <button onClick={handleClose} className="btn-close-modal">
                    <X size={20} />
                </button>

                {/* Receipt Content */}
                <div ref={billRef} className="bill-receipt">
                    <div className="receipt-header">
                        <img
                            src={logoo}
                            alt="Company Logo"
                            className="company-logo"
                        />
                        <h2>Ibrahim Autos & Wholesale</h2>
                        <p>Phone: 0307-8694372</p>
                    </div>

                    <div className="receipt-info">
                        <div className="Bill-date">
                            <p><strong>Bill No:</strong> {billId}</p>
                            <p><strong>Date:</strong> {formatDate(createdAt)}</p>
                        </div>
                        <div className="Cashier-info">
                            <p><strong>Cashier:</strong> {staff?.name || "N/A"}</p>
                            <p><strong>Shift:</strong> {shift ? shift.charAt(0).toUpperCase() + shift.slice(1) : "N/A"}</p>
                            <p><strong>Payment:</strong> {paymentMode?.toUpperCase() || "CASH"}</p>
                        </div>
                        <div className="customer-info-section">
                            <p><strong>Customer:</strong> {customerName || "N/A"}</p>
                            <p><strong>Phone:</strong> {customerPhone || "N/A"}</p>
                        </div>
                    </div>

                    <table className="receipt-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items && items.length > 0 ? (
                                items.map((item, index) => (
                                    <tr key={item._id || index}>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>Rs. {item.salePrice?.toFixed(2)}</td>
                                        <td>Rs. {item.total?.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-row">
                                        No products available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="receipt-summary">
                        <div className="summary-line">
                            <span>Subtotal:</span>
                            <span>Rs. {calculateSubtotal().toFixed(2)}</span>
                        </div>

                        {discount > 0 && (
                            <>
                                <div className="summary-line">
                                    <span>Discount:</span>
                                    <span>-Rs. {discount?.toFixed(2)}</span>
                                </div>
                                <div className="summary-line savings-highlight">
                                    <span>Discounted Amount (You Saved):</span>
                                    <span>Rs. {discount?.toFixed(2)}</span>
                                </div>
                            </>
                        )}

                        {labourCost > 0 && (
                            <div className="summary-line labor-highlight">
                                <span>Labor Cost:</span>
                                <span>+Rs. {labourCost?.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="summary-line total">
                            <span>Total:</span>
                            <span>Rs. {totalAmount?.toFixed(2)}</span>
                        </div>

                        <div className="summary-line">
                            <span>Paid:</span>
                            <span>Rs. {userPaidAmount?.toFixed(2)}</span>
                        </div>

                        <div className="summary-line">
                            <span>Change:</span>
                            <span>Rs. {change?.toFixed(2) || "0.00"}</span>
                        </div>

                        <div className="summary-line">
                            <span>Remaining Amount:</span>
                            <span style={{ 
                                color: remainingAmount > 0 ? "#dc2626" : "#059669",
                                fontWeight: "600"
                            }}>
                                Rs. {remainingAmount?.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="receipt-footer">
                        <p>Thank you for your purchase!</p>
                        <p>Visit again</p>
                        <div className="watermark">
                            <p>Software Powered by</p>
                            <p><strong>Zemalt PVT LTD</strong></p>
                            <p className="phone-contact">
                                <FaPhoneAlt className="phone-icon" />
                                <span>03285522005</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bill-actions">
                    <button onClick={handlePrint} className="btn-action btn-print">
                        <Printer size={18} /> Print
                    </button>
                    <button onClick={handleDownload} className="btn-action btn-download">
                        <Download size={18} /> Download
                    </button>
                </div>
            </div>
        </div>
    );
}

