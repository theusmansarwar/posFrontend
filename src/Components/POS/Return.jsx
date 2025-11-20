import React, { useState, useEffect, useRef } from "react";
import { Trash2, Printer, Download, Search, X } from "lucide-react";
import { FaPhoneAlt } from "react-icons/fa";
import "./Return.css";
import logoo from "../../Assets/logoo.jpg";

// Import API functions from DAL
import { fetchallBilllist, searchBillById } from "../../DAL/fetch";
import { updateBill } from "../../DAL/edit";

const ReturnManagement = () => {
  const [searchBillId, setSearchBillId] = useState("");
  const [recentBills, setRecentBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  const [staffId, setStaffId] = useState("");
  const [shift, setShift] = useState("morning");
  const [refundMode, setRefundMode] = useState("cash");
  const [showReturnReceipt, setShowReturnReceipt] = useState(false);
  const [returnReceiptData, setReturnReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("userData");
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        if (userData._id) {
          setStaffId(userData._id);
        } else if (userData.id) {
          setStaffId(userData.id);
        } else if (userData.username) {
          setStaffId(userData.username);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    loadBills();
  }, []);

  const loadBills = async (searchKeyword = "") => {
    try {
      setLoading(true);
      const response = await fetchallBilllist(1, 50, searchKeyword);

      const mappedBills = response.data
        ? response.data.map((bill) => ({
            _id: bill._id,
            billNo: bill.billId,
            date: new Date(bill.createdAt).toLocaleString(),
            items: bill.items,
            totalAmount: bill.totalAmount || 0,
            paymentMode: bill.paymentMode,
            customerName: bill.customerName || "N/A",
            customerPhone: bill.customerPhone || "N/A",
            discount: bill.discount || 0,
            discountType: bill.discountType || "amount",
            discountValue: bill.discountValue || 0,
            labourCost: bill.labourCost || 0,
            userPaidAmount: bill.userPaidAmount || 0,
            remainingAmount: bill.remainingAmount || 0,
            change: bill.change || 0,
          }))
        : [];
      setRecentBills(mappedBills);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBill = async () => {
    if (!searchBillId.trim()) {
      loadBills();
      return;
    }
    await loadBills(searchBillId);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadBills(searchBillId);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchBillId]);

  const handleBillSelect = async (bill) => {
    try {
      setLoading(true);
      const result = await searchBillById(bill.billNo);

      if (result && result.data) {
        const billData = result.data;
        const mappedBill = {
          _id: billData._id,
          billNo: billData.billId,
          date: new Date(billData.createdAt).toLocaleString(),
          items: billData.items,
          totalAmount: billData.totalAmount || 0,
          paymentMode: billData.paymentMode,
          customerName: billData.customerName || "",
          customerPhone: billData.customerPhone || "",
          discount: billData.discount || 0,
          discountType: billData.discountType || "amount",
          discountValue: billData.discountValue || 0,
          labourCost: billData.labourCost || 0,
          userPaidAmount: billData.userPaidAmount || 0,
          remainingAmount: billData.remainingAmount || 0,
          change: billData.change || 0,
          staffName: billData.staff?.name || "N/A",
          shift: billData.shift || "morning",
        };
        setSelectedBill(mappedBill);

        // Auto-populate shift from bill
        setShift(mappedBill.shift);

        const itemsWithReturnQty = mappedBill.items.map((item) => ({
          ...item,
          returnQuantity: 0, // Start with 0, user will select what to return
          maxQuantity: item.quantity,
          productId: item.productId?._id || item.productId,
          productName: item.productName || item.productId?.productName,
          productCode: item.productCode,
          salePrice: item.salePrice,
        }));
        setReturnItems(itemsWithReturnQty);
      }
    } catch (error) {
      console.error("Error fetching bill details:", error);
      alert("Error loading bill details!");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedBill(null);
    setReturnItems([]);
    setReturnReason("");
  };

  const handleSearchInputChange = (e) => {
    setSearchBillId(e.target.value);
  };

  const updateReturnQuantity = (_id, newQuantity) => {
    setReturnItems(
      returnItems.map((item) => {
        if (item._id === _id) {
          const validQuantity = Math.min(
            Math.max(0, newQuantity),
            item.maxQuantity
          );
          return { ...item, returnQuantity: validQuantity };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (_id) => {
    setReturnItems(returnItems.filter((item) => item._id !== _id));
  };

  // Calculate return subtotal (sum of all returned items)
  const calculateReturnSubtotal = () => {
    return returnItems.reduce(
      (sum, item) => sum + item.salePrice * item.returnQuantity,
      0
    );
  };

  // Calculate original bill subtotal (before discount and labor)
  const calculateOriginalSubtotal = () => {
    if (!selectedBill) return 0;
    return selectedBill.totalAmount + selectedBill.discount - selectedBill.labourCost;
  };

  // Calculate proportional discount for returned items
  const calculateReturnDiscount = () => {
    if (!selectedBill || selectedBill.discount === 0) return 0;
    
    const returnSub = calculateReturnSubtotal();
    const originalSub = calculateOriginalSubtotal();
    
    if (originalSub === 0) return 0;
    
    // Calculate proportion of items being returned
    const returnProportion = returnSub / originalSub;
    
    // Return proportional discount
    return selectedBill.discount * returnProportion;
  };

  // Calculate refund amount (what customer gets back)
  // Formula: Return Subtotal - Proportional Discount (Labor stays with business)
  const calculateRefundAmount = () => {
    const returnSub = calculateReturnSubtotal();
    const returnDiscount = calculateReturnDiscount();
    return returnSub - returnDiscount;
  };

  // Calculate new total amount for remaining items (what goes to backend)
  const calculateNewTotalAmount = () => {
    if (!selectedBill) return 0;
    
    // Calculate subtotal of remaining items
    const remainingSubtotal = returnItems.reduce(
      (sum, item) => sum + item.salePrice * (item.maxQuantity - item.returnQuantity),
      0
    );
    
    // Calculate remaining discount proportion
    const originalSub = calculateOriginalSubtotal();
    const remainingProportion = originalSub > 0 ? remainingSubtotal / originalSub : 0;
    const remainingDiscount = selectedBill.discount * remainingProportion;
    
    // New total = Remaining Subtotal - Remaining Discount + Labor (labor stays as is)
    return remainingSubtotal - remainingDiscount + selectedBill.labourCost;
  };

  const handleGenerateReturnReceipt = async () => {
    const hasReturnItems = returnItems.some((item) => item.returnQuantity > 0);

    if (!hasReturnItems) {
      alert("Please select items to return!");
      return;
    }

    if (!returnReason.trim()) {
      alert("Please enter return reason!");
      return;
    }

    try {
      setLoading(true);

      // Calculate remaining items (what customer keeps)
      const updatedBillItems = returnItems
        .map((item) => {
          const remainingQty = item.maxQuantity - item.returnQuantity;
          return {
            productId: item.productId,
            productName: item.productName,
            productCode: item.productCode,
            quantity: remainingQty,
            salePrice: item.salePrice,
            total: item.salePrice * remainingQty,
          };
        })
        .filter((item) => item.quantity > 0);

      // Calculate new bill values
      const remainingSubtotal = updatedBillItems.reduce((sum, item) => sum + item.total, 0);
      const originalSub = calculateOriginalSubtotal();
      const remainingRatio = originalSub > 0 ? remainingSubtotal / originalSub : 0;
      
      // Calculate new discount (proportional to remaining items)
      const newDiscount = selectedBill.discount * remainingRatio;
      
      // Calculate new discount value
      let newDiscountValue = selectedBill.discountValue;
      if (selectedBill.discountType === "amount") {
        newDiscountValue = selectedBill.discountValue * remainingRatio;
      }
      // If percentage, keep the same percentage
      
      // Labor cost stays the same (as per requirement)
      const newLabourCost = selectedBill.labourCost;
      
      // Calculate new total amount
      const newTotalAmount = remainingSubtotal - newDiscount + newLabourCost;
      
      // Calculate refund amount
      const refundAmount = calculateRefundAmount();
      
      // Update payment details
      const newUserPaidAmount = Math.max(0, selectedBill.userPaidAmount - refundAmount);
      const newRemainingAmount = Math.max(0, newTotalAmount - newUserPaidAmount);
      const newChange = newUserPaidAmount > newTotalAmount ? newUserPaidAmount - newTotalAmount : 0;

      const billUpdatePayload = {
        items: updatedBillItems,
        discount: parseFloat(newDiscount.toFixed(2)),
        discountType: selectedBill.discountType,
        discountValue: parseFloat(newDiscountValue.toFixed(2)),
        labourCost: parseFloat(newLabourCost.toFixed(2)),
        totalAmount: parseFloat(newTotalAmount.toFixed(2)),
        userPaidAmount: parseFloat(newUserPaidAmount.toFixed(2)),
        remainingAmount: parseFloat(newRemainingAmount.toFixed(2)),
        change: parseFloat(newChange.toFixed(2)),
        returnReason: returnReason,
        staff: staffId,
        shift: shift,
      };

      const result = await updateBill(selectedBill.billNo, billUpdatePayload);

      if (result) {
        // Use response data from API
        const responseData = result.data || result;
        
        const itemsOnlyReturned = returnItems
          .filter((item) => item.returnQuantity > 0)
          .map((item) => ({
            ...item,
            total: item.salePrice * item.returnQuantity,
          }));

        // Calculate values from response
        const returnSub = calculateReturnSubtotal();
        const returnDisc = calculateReturnDiscount();
        const refundAmt = calculateRefundAmount();

        const returnReceipt = {
          returnNo: `RET-${Date.now()}`,
          originalBillNo: selectedBill.billNo,
          originalBillDate: selectedBill.date,
          returnDate: new Date().toLocaleString(),
          items: itemsOnlyReturned,
          returnSubtotal: returnSub,
          returnDiscount: returnDisc,
          refundAmount: refundAmt,
          // Use totalAmount from API response
          totalAmount: responseData.totalAmount || calculateNewTotalAmount(),
          // Use updated payment details from API response
          userPaidAmount: responseData.userPaidAmount || newUserPaidAmount,
          remainingAmount: responseData.remainingAmount || newRemainingAmount,
          change: responseData.change || newChange,
          // Use discount from API response
          discount: responseData.discount || newDiscount,
          discountType: responseData.discountType || selectedBill.discountType,
          discountValue: responseData.discountValue || newDiscountValue,
          // Use labor cost from API response
          labourCost: responseData.labourCost || selectedBill.labourCost,
          refundMode,
          returnReason: responseData.returnReason || returnReason,
          staffId: responseData.staff?.name || selectedBill.staffName || staffId,
          shift: responseData.shift || shift,
          customerName: responseData.customerName || selectedBill.customerName,
          customerPhone: responseData.customerPhone || selectedBill.customerPhone,
          paymentMode: responseData.paymentMode || selectedBill.paymentMode,
        };

        setReturnReceiptData(returnReceipt);
        setShowReturnReceipt(true);

        setSelectedBill(null);
        setReturnItems([]);
        setReturnReason("");
        loadBills();
      } else {
        alert("Failed to process return!");
      }
    } catch (error) {
      console.error("Error processing return:", error);
      alert(`Failed to process return: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            margin: 0;
          }
          .receipt { 
            max-width: 400px; 
            margin: 0 auto; 
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 15px;
          }
          .receipt-header h2 {
            margin: 0 0 10px 0;
            color: #1e3a8a;
            font-size: 22px;
          }
          .receipt-header p {
            margin: 4px 0;
            font-size: 12px;
          }
          .return-badge {
            background: #dc2626;
            color: white;
            padding: 8px 16px;
            border-radius: 3px;
            display: inline-block;
            font-weight: 700;
            font-size: 14px;
            margin: 10px 0;
          }
          .receipt-info {
            margin-bottom: 20px;
            font-size: 12px;
          }
          .receipt-info p {
            margin: 4px 0;
          }
          .Bill-date {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 8px;
          }
          .Cashier-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .customer-info-section {
            border-top: 1px dashed #ccc;
            padding-top: 5px;
            margin-top: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
            border: 1px solid #e5e7eb;
          }
          th, td { 
            padding: 8px; 
            text-align: left; 
            border-bottom: 1px solid #ddd;
            font-size: 12px;
          }
          th {
            background: #f3f4f6;
            border-bottom: 2px solid #1e3a8a;
          }
          tbody tr {
            background: #fee2e2;
          }
          tbody tr:nth-child(even) {
            background: #fecaca;
          }
          .receipt-summary {
            border-top: 2px solid #1e3a8a;
            padding-top: 15px;
          }
          .summary-line {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
            border-bottom: 1px solid #e5e7eb;
          }
          .summary-line:last-child {
            border-bottom: none;
          }
          .summary-line.total {
            font-size: 17px;
            font-weight: 700;
            color: #dc2626;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #e5e7eb;
          }
          .savings-highlight {
            color: #059669;
            font-weight: 600;
            background: #d1fae5;
            padding: 8px;
            border-radius: 3px;
            margin: 5px 0;
          }
          .labor-highlight {
            color: #0369a1;
            font-weight: 600;
            background: #e0f2fe;
            padding: 8px;
            border-radius: 3px;
            margin: 5px 0;
          }
          .return-reason-box {
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 12px;
            border-radius: 3px;
            margin: 15px 0;
          }
          .return-reason-box strong {
            color: #dc2626;
            display: block;
            margin-bottom: 5px;
          }
          .receipt-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px solid #1e3a8a;
          }
          .receipt-footer p {
            margin: 4px 0;
            font-size: 12px;
          }
          .watermark {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px dashed #d1d5db;
          }
          .watermark p {
            margin: 2px 0;
            font-size: 11px;
            color: #9ca3af;
          }
          .watermark strong {
            color: #1e3a8a;
            font-size: 12px;
          }
          .company-logo {
            width: 70px;
            height: 70px;
            object-fit: contain;
            border-radius: 5px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>${receiptRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const receiptHTML = receiptRef.current.innerHTML;
    const blob = new Blob(
      [
        `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .receipt { max-width: 400px; margin: 0 auto; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          .total { font-weight: bold; font-size: 1.2em; }
        </style>
      </head>
      <body>${receiptHTML}</body>
      </html>
    `,
      ],
      { type: "text/html" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `return-${returnReceiptData?.returnNo}.html`;
    a.click();
  };

  return (
    <div className="return-container">
      <div className="return-left-section">
        <h2 className="section-title">Return Management</h2>

        <div className="search-section">
          <input
            type="text"
            placeholder="Search by Bill ID or Customer Name..."
            value={searchBillId}
            onChange={handleSearchInputChange}
            onKeyPress={(e) => e.key === "Enter" && handleSearchBill()}
            className="search-input"
          />
          <button
            onClick={handleSearchBill}
            className="btn-search"
            disabled={loading}
          >
            <Search size={20} /> {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {selectedBill && (
          <div className="selected-bill-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 className="subsection-title" style={{ margin: 0 }}>Selected Bill Details</h3>
              <button
                onClick={handleClearSelection}
                style={{
                  padding: '8px 16px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#b91c1c'}
                onMouseOut={(e) => e.target.style.background = '#dc2626'}
              >
                Clear
              </button>
            </div>
            <div className="bill-details-box">
              <p><strong>Bill No:</strong> {selectedBill.billNo}</p>
              <p><strong>Date:</strong> {selectedBill.date}</p>
              <p><strong>Customer:</strong> {selectedBill.customerName}</p>
              <p><strong>Phone:</strong> {selectedBill.customerPhone}</p>
              <p><strong>Original Total:</strong> Rs. {selectedBill.totalAmount?.toFixed(2)}</p>
              <p><strong>Payment Mode:</strong> {selectedBill.paymentMode?.toUpperCase()}</p>
              {selectedBill.discount > 0 && (
                <p><strong>Discount:</strong> {selectedBill.discountType === "percentage" ? `${selectedBill.discountValue}%` : `Rs. ${selectedBill.discountValue.toFixed(2)}`} (Rs. {selectedBill.discount.toFixed(2)})</p>
              )}
              {selectedBill.labourCost > 0 && (
                <p><strong>Labor Cost:</strong> Rs. {selectedBill.labourCost.toFixed(2)}</p>
              )}
            </div>
          </div>
        )}

        <div className="cashier-section">
          <div className="cashier-input-group">
            <label>Shift:</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="shift-select"
            >
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </div>
        </div>

        <div className="return-items-section">
          <h3 className="subsection-title">Return Items</h3>
          <table className="return-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Max Qty</th>
                <th>Return Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {returnItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-return">
                    Select a bill to process returns
                  </td>
                </tr>
              ) : (
                returnItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item.productName}</td>
                    <td>{item.maxQuantity}</td>
                    <td>
                      <div className="quantity-control">
                        <button
                          onClick={() =>
                            updateReturnQuantity(
                              item._id,
                              item.returnQuantity - 1
                            )
                          }
                          className="btn-qty"
                          disabled={item.returnQuantity === 0}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.returnQuantity}
                          onChange={(e) =>
                            updateReturnQuantity(
                              item._id,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="qty-input"
                          min="0"
                          max={item.maxQuantity}
                        />
                        <button
                          onClick={() =>
                            updateReturnQuantity(
                              item._id,
                              item.returnQuantity + 1
                            )
                          }
                          className="btn-qty"
                          disabled={item.returnQuantity >= item.maxQuantity}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>Rs. {item.salePrice?.toFixed(2)}</td>
                    <td>
                      Rs. {(item.salePrice * item.returnQuantity).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="recent-bills-section">
          <h3 className="subsection-title">Recent Bills</h3>
          <div className="bills-table-container">
            <table className="bills-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="empty-bills">
                      Loading bills...
                    </td>
                  </tr>
                ) : recentBills.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-bills">
                      No bills found
                    </td>
                  </tr>
                ) : (
                  recentBills.map((bill) => (
                    <tr
                      key={bill._id}
                      className={
                        selectedBill?._id === bill._id ? "selected-row" : ""
                      }
                    >
                      <td className="bill-number-cell">{bill.billNo}</td>
                      <td className="bill-date-cell">{bill.date}</td>
                      <td>{bill.customerName}</td>
                      <td className="bill-items-cell">
                        {bill.items?.length || 0}
                      </td>
                      <td className="bill-total-cell">
                        Rs. {bill.totalAmount?.toFixed(2)}
                      </td>
                      <td>
                        <button
                          onClick={() => handleBillSelect(bill)}
                          className="btn-select-bill"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="return-right-section">
        <h1 className="return-title">Process Return</h1>

        <div className="return-summary">
          <div className="summary-row">
            <span>Selected Bill:</span>
            <span>{selectedBill?.billNo || "None"}</span>
          </div>
          <div className="summary-row">
            <span>Customer Name:</span>
            <span>{selectedBill?.customerName || "N/A"}</span>
          </div>
          <div className="summary-row">
            <span>Customer Phone:</span>
            <span>{selectedBill?.customerPhone || "N/A"}</span>
          </div>
          <div className="summary-row">
            <span>Return Items:</span>
            <span>
              {returnItems.filter((i) => i.returnQuantity > 0).length}
            </span>
          </div>
          <div className="summary-row">
            <span>Total Quantity:</span>
            <span>
              {returnItems.reduce((sum, item) => sum + item.returnQuantity, 0)}
            </span>
          </div>

          <div className="summary-row">
            <span>Return Subtotal:</span>
            <span>Rs. {calculateReturnSubtotal().toFixed(2)}</span>
          </div>

          {calculateReturnDiscount() > 0 && (
            <div className="summary-row savings-row">
              <span>Discount Deducted:</span>
              <span className="savings-amount">
                -Rs. {calculateReturnDiscount().toFixed(2)}
              </span>
            </div>
          )}

          {selectedBill && selectedBill.labourCost > 0 && (
            <div className="summary-row labor-row">
              <span>Labor Cost (Not Refunded):</span>
              <span className="labor-amount">
                Rs. {selectedBill.labourCost.toFixed(2)}
              </span>
            </div>
          )}

          <div className="summary-row total-row">
            <span>Refund Amount:</span>
            <span>Rs. {calculateRefundAmount().toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>New Total Amount:</span>
            <span>Rs. {calculateNewTotalAmount().toFixed(2)}</span>
          </div>

          <div className="return-reason-section">
            <label>Return Reason:</label>
            <textarea
              placeholder="Enter reason for return..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              className="return-reason-input"
              rows="3"
            />
          </div>

          <div className="summary-row">
            <span>Refund Mode:</span>
            <select
              value={refundMode}
              onChange={(e) => setRefundMode(e.target.value)}
              className="refund-select"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateReturnReceipt}
          className="btn-generate-return"
          disabled={
            !selectedBill ||
            returnItems.filter((i) => i.returnQuantity > 0).length === 0 ||
            loading
          }
        >
          {loading ? "Processing..." : "Generate Return Receipt"}
        </button>
      </div>

      {showReturnReceipt && returnReceiptData && (
        <div className="receipt-popup-overlay">
          <div className="receipt-popup-container">
            <button
              onClick={() => setShowReturnReceipt(false)}
              className="btn-close-popup"
            >
              <X size={20} />
            </button>

            <div ref={receiptRef} className="return-receipt">
              <div className="receipt-header">
                <img src={logoo} alt="Company Logo" className="company-logo" />
                <h2>Ibrahim Autos & Wholesale</h2>
                <p>Phone: 0307-8694372</p>
                <div className="return-badge">RETURN RECEIPT</div>
              </div>

              <div className="receipt-info">
                <div className="Bill-date">
                  <p>
                    <strong>Return No:</strong> {returnReceiptData.returnNo}
                  </p>
                  <p>
                    <strong>Return Date:</strong> {returnReceiptData.returnDate}
                  </p>
                </div>
                <div className="Cashier-info">
                  <p>
                    <strong>Original Bill:</strong>{" "}
                    {returnReceiptData.originalBillNo}
                  </p>
                  <p>
                    <strong>Bill Date:</strong>{" "}
                    {returnReceiptData.originalBillDate}
                  </p>
                </div>
                <div className="Cashier-info">
                  <p>
                    <strong>Staff:</strong> {returnReceiptData.staffId}
                  </p>
                  <p>
                    <strong>Shift:</strong>{" "}
                    {returnReceiptData.shift.charAt(0).toUpperCase() +
                      returnReceiptData.shift.slice(1)}
                  </p>
                  <p>
                    <strong>Refund Mode:</strong>{" "}
                    {returnReceiptData.refundMode.toUpperCase()}
                  </p>
                </div>
                <div className="customer-info-section">
                  <p>
                    <strong>Customer:</strong> {returnReceiptData.customerName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {returnReceiptData.customerPhone}
                  </p>
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
                  {returnReceiptData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productName}</td>
                      <td>{item.returnQuantity}</td>
                      <td>Rs. {item.salePrice?.toFixed(2)}</td>
                      <td>Rs. {item.total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-summary">
                <div className="summary-line">
                  <span>Return Subtotal:</span>
                  <span>Rs. {returnReceiptData.returnSubtotal.toFixed(2)}</span>
                </div>
                
                {returnReceiptData.returnDiscount > 0 && (
                  <>
                    <div className="summary-line">
                      <span>Discount ({returnReceiptData.discountType === "percentage" ? `${returnReceiptData.discountValue}%` : `Rs. ${returnReceiptData.discountValue.toFixed(2)}`}):</span>
                      <span>-Rs. {returnReceiptData.returnDiscount.toFixed(2)}</span>
                    </div>
                    <div className="summary-line savings-highlight">
                      <span>Discount Deducted:</span>
                      <span>Rs. {returnReceiptData.returnDiscount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                
                {returnReceiptData.labourCost > 0 && (
                  <div className="summary-line labor-highlight">
                    <span>Labor Cost (Not Refunded):</span>
                    <span>Rs. {returnReceiptData.labourCost.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="summary-line total">
                  <span>Refund Amount:</span>
                  <span>Rs. {returnReceiptData.refundAmount.toFixed(2)}</span>
                </div>

                <div className="summary-line">
                  <span>New Bill Total:</span>
                  <span>Rs. {returnReceiptData.totalAmount.toFixed(2)}</span>
                </div>

                {returnReceiptData.userPaidAmount !== undefined && (
                  <>
                    {returnReceiptData.remainingAmount > 0 && (
                      <div className="summary-line">
                        <span>Remaining Amount:</span>
                        <span>Rs. {returnReceiptData.remainingAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="return-reason-box">
                <strong>Return Reason:</strong>
                <p>{returnReceiptData.returnReason}</p>
              </div>

              <div className="receipt-footer">
                <p>Return processed successfully</p>
                <p>Thank you for your cooperation</p>
                <div className="watermark">
                  <p>Software Powered by</p>
                  <p>
                    <strong>Zemalt PVT LTD</strong>
                  </p>
                  <p className="phone-contact">
                    <FaPhoneAlt className="phone-icon" />
                    <span>03285522005</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="receipt-actions">
              <button onClick={handlePrint} className="btn-action">
                <Printer size={20} /> Print
              </button>
              <button onClick={handleDownload} className="btn-action">
                <Download size={20} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnManagement;