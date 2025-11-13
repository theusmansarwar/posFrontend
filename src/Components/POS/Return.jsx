import React, { useState, useEffect, useRef } from 'react';
import { Trash2, RotateCcw, Printer, Download, Search, X, PackageX } from 'lucide-react';
import { FaPhoneAlt } from "react-icons/fa";
import './Return.css';
import logoo from '../../Assets/logoo.jpg';

const ReturnManagement = () => {
  const [searchBillId, setSearchBillId] = useState('BILL-');
  const [recentBills, setRecentBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [staffId, setStaffId] = useState('');
  const [shift, setShift] = useState('morning');
  const [refundMode, setRefundMode] = useState('cash');
  const [showReturnReceipt, setShowReturnReceipt] = useState(false);
  const [returnReceiptData, setReturnReceiptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef();

  // Fetch recent bills on component mount
  useEffect(() => {
    fetchRecentBills();
  }, []);

  const fetchRecentBills = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://pos.ztesting.site/backend/bill/list');
      if (response.ok) {
        const result = await response.json();
        // Map API response to expected format
        const mappedBills = result.data ? result.data.map(bill => ({
          _id: bill._id,
          billNo: bill.billId,
          date: new Date(bill.createdAt).toLocaleString(),
          items: bill.items,
          total: bill.totalAmount,
          paymentMode: bill.paymentMode
        })) : result.map(bill => ({
          _id: bill._id,
          billNo: bill.billId || bill.billNo,
          date: bill.createdAt ? new Date(bill.createdAt).toLocaleString() : bill.date,
          items: bill.items,
          total: bill.totalAmount || bill.total,
          paymentMode: bill.paymentMode
        }));
        setRecentBills(mappedBills);
      }
    } catch (error) {
      console.error('Error fetching recent bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchBill = async () => {
    if (!searchBillId.trim() || searchBillId === 'BILL-') {
      alert('Please enter a bill number!');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`https://pos.ztesting.site/backend/bill/${searchBillId}`);
      
      if (response.ok) {
        const result = await response.json();
        // Map API response to expected format
        const mappedBill = {
          _id: result.data._id,
          billNo: result.data.billId,
          date: new Date(result.data.createdAt).toLocaleString(),
          items: result.data.items,
          total: result.data.totalAmount,
          paymentMode: result.data.paymentMode,
          discount: result.data.discount,
          staffId: result.data.staff?.name || 'N/A',
          shift: result.data.shift
        };
        handleBillSelect(mappedBill);
      } else {
        alert('Bill not found!');
      }
    } catch (error) {
      console.error('Error searching bill:', error);
      alert('Error searching bill. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const handleBillSelect = (bill) => {
    setSelectedBill(bill);
    // Auto-fill return items with all items from the bill
    // returnQuantity ko item ki quantity se initialize karo
    const itemsWithReturnQty = bill.items.map(item => ({
      ...item,
      returnQuantity: item.quantity, // Puri quantity auto-fill ho jayegi
      maxQuantity: item.quantity
    }));
    setReturnItems(itemsWithReturnQty);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    // Always keep "BILL-" prefix
    if (!value.startsWith('BILL-')) {
      setSearchBillId('BILL-');
    } else {
      setSearchBillId(value);
    }
  };

  // FIXED: Update return quantity function
  const updateReturnQuantity = (_id, newQuantity) => {
    setReturnItems(returnItems.map(item => {
      if (item._id === _id) {
        const validQuantity = Math.min(Math.max(0, newQuantity), item.maxQuantity);
        return { ...item, returnQuantity: validQuantity };
      }
      return item;
    }));
  };

  // FIXED: Delete item from return list
  const handleDeleteItem = (_id) => {
    setReturnItems(returnItems.filter(item => item._id !== _id));
  };

  const handleRestockItem = async (_id) => {
    const item = returnItems.find(i => i._id === _id);
    if (!item || item.returnQuantity === 0) {
      alert('Please set return quantity first!');
      return;
    }

    // API call for restocking
    try {
      const response = await fetch('https://pos.ztesting.site/backend/inventory/restock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.returnQuantity
        })
      });

      if (response.ok) {
        alert(`Successfully restocked ${item.returnQuantity} units of ${item.productName}`);
        
        // Remove returned quantity from the item
        setReturnItems(returnItems.map(i => {
          if (i._id === _id) {
            return { ...i, maxQuantity: i.maxQuantity - i.returnQuantity, returnQuantity: 0 };
          }
          return i;
        }));
      } else {
        alert('Failed to restock item!');
      }
    } catch (err) {
      console.error('Restock error:', err);
      alert('Failed to restock item!');
    }
  };

  const calculateReturnTotal = () => {
    return returnItems.reduce((sum, item) => sum + (item.salePrice * item.returnQuantity), 0);
  };

   
  const handleGenerateReturnReceipt = async () => {
    const itemsToReturn = returnItems.filter(item => item.returnQuantity > 0);
    
    if (itemsToReturn.length === 0) {
      alert('Please select items to return!');
      return;
    }

    if (!staffId.trim()) {
      alert('Please enter staff ID!');
      return;
    }

    if (!returnReason.trim()) {
      alert('Please enter return reason!');
      return;
    }

    try {
      setLoading(true);

      // ✅ Match your backend’s expected structure
      const returnData = {
        billId: selectedBill.billNo, // BILL-000020
        isDeleted: false,            // ensure reactivation if needed
        items: itemsToReturn.map(item => ({
          productId: item.productId?._id || item.productId, // handle object or ID
          productName: item.productName,
          quantity: item.returnQuantity,
          salePrice: item.salePrice,
          total: item.salePrice * item.returnQuantity
        })),
        returnReason,
        refundMode,
        staffId,
        shift
      };

      // ✅ Use your actual bill update endpoint
      const response = await fetch(
        `https://pos.ztesting.site/backend/bill/${selectedBill.billNo}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(returnData)
        }
      );

      if (response.ok) {
        const result = await response.json();

        const returnReceipt = {
          returnNo: `RET-${Date.now()}`,
          originalBillNo: selectedBill.billNo,
          originalBillDate: selectedBill.date,
          returnDate: new Date().toLocaleString(),
          items: itemsToReturn,
          returnTotal: calculateReturnTotal(),
          refundMode,
          returnReason,
          staffId,
          shift
        };

        setReturnReceiptData(returnReceipt);
        setShowReturnReceipt(true);
        
      } else {
        const errorData = await response.json();
        console.error('Return error:', errorData);
        alert(`Failed to process return: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error processing return:', error);
      alert('Error processing return. Please try again!');
    } finally {
      setLoading(false);
    }
  };


  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
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
            border-bottom: 2px solid #dc2626;
            padding-bottom: 15px;
          }
          .receipt-header h2 {
            margin: 0 0 10px 0;
            color: #dc2626;
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
            border-bottom: 2px solid #dc2626;
          }
          .receipt-summary {
            border-top: 2px solid #dc2626;
            padding-top: 15px;
          }
          .summary-line {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 13px;
          }
          .summary-line.total {
            font-size: 17px;
            font-weight: 700;
            color: #dc2626;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #e5e7eb;
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
            border-top: 2px solid #dc2626;
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
            color: #dc2626;
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
    const blob = new Blob([`
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
    `], { type: 'text/html' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `return-${returnReceiptData?.returnNo}.html`;
    a.click();
  };

  return (
    <div className="return-container">
      {/* Left Side - Available Bills */}
      <div className="return-left-section">
        <h2 className="section-title">
           
          Return Management
        </h2>
        
        <div className="search-section">
          <input
            type="text"
            placeholder="Enter bill number (e.g., BILL-000009)"
            value={searchBillId}
            onChange={handleSearchInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchBill()}
            className="search-input"
          />
          <button onClick={handleSearchBill} className="btn-search" disabled={loading}>
            <Search size={20} /> {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        

        {selectedBill && (
          <div className="selected-bill-info">
            <h3 className="subsection-title">Selected Bill Items</h3>
            <div className="bill-details-box">
              <p><strong>Bill No:</strong> {selectedBill.billNo}</p>
              <p><strong>Date:</strong> {selectedBill.date}</p>
              <p><strong>Original Total:</strong> Rs.{selectedBill.total?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        )}

        <div className="cashier-section">
          <div className="cashier-input-group">
            <label>Staff ID:</label>
            <input
              type="text"
              placeholder="Enter staff ID"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="cashier-input"
            />
          </div>
          <div className="cashier-input-group">
            <label>Shift:</label>
            <select value={shift} onChange={(e) => setShift(e.target.value)} className="shift-select">
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
                <th>Return Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {returnItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-return">Select a bill to process returns</td>
                </tr>
              ) : (
                returnItems.map(item => (
                  <tr key={item._id}>
                    <td>{item.productName}</td>
                    <td>
                      <div className="quantity-control">
                        <button 
                          onClick={() => updateReturnQuantity(item._id, item.returnQuantity - 1)} 
                          className="btn-qty"
                          disabled={item.returnQuantity === 0}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.returnQuantity}
                          onChange={(e) => updateReturnQuantity(item._id, parseInt(e.target.value) || 0)}
                          className="qty-input"
                          min="0"
                          max={item.maxQuantity}
                        />
                        <button 
                          onClick={() => updateReturnQuantity(item._id, item.returnQuantity + 1)} 
                          className="btn-qty"
                          disabled={item.returnQuantity >= item.maxQuantity}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>Rs.{item.salePrice?.toFixed(2) || '0.00'}</td>
                    <td>Rs.{((item.salePrice || 0) * item.returnQuantity).toFixed(2)}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteItem(item._id)} 
                        className="btn-delete"
                        title="Remove from return list"
                      >
                        <Trash2 size={18} />
                      </button>
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
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="empty-bills">Loading bills...</td>
                  </tr>
                ) : recentBills.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-bills">No recent bills found</td>
                  </tr>
                ) : (
                  recentBills.map(bill => (
                    <tr 
                      key={bill._id}
                      className={selectedBill?._id === bill._id ? 'selected-row' : ''}
                    >
                      <td className="bill-number-cell">{bill.billNo}</td>
                      <td className="bill-date-cell">{bill.date}</td>
                      <td className="bill-items-cell">{bill.items?.length || 0}</td>
                      <td className="bill-total-cell">Rs.{bill.total?.toFixed(2) || '0.00'}</td>
                      <td>
                        <span className="payment-badge">{bill.paymentMode?.toUpperCase() || 'N/A'}</span>
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

      {/* Right Side - Return Processing */}
      <div className="return-right-section">
        <h1 className="return-title">Process Return</h1>

        <div className="return-summary">
          <div className="summary-row">
            <span>Selected Bill:</span>
            <span>{selectedBill?.billNo || 'None'}</span>
          </div>
          <div className="summary-row">
            <span>Return Items:</span>
            <span>{returnItems.filter(i => i.returnQuantity > 0).length}</span>
          </div>
          <div className="summary-row">
            <span>Total Quantity:</span>
            <span>{returnItems.reduce((sum, item) => sum + item.returnQuantity, 0)}</span>
          </div>

          <div className="summary-row total-row">
            <span>Refund Amount:</span>
            <span>Rs.{calculateReturnTotal().toFixed(2)}</span>
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
            <select value={refundMode} onChange={(e) => setRefundMode(e.target.value)} className="refund-select">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleGenerateReturnReceipt} 
          className="btn-generate-return"
          disabled={!selectedBill || returnItems.filter(i => i.returnQuantity > 0).length === 0 || loading}
        >
          {loading ? 'Processing...' : 'Generate Return Receipt'}
        </button>
      </div>

      {/* Return Receipt Modal */}
      {showReturnReceipt && returnReceiptData && (
        <div className="receipt-popup-overlay">
          <div className="receipt-popup-container">
            <button onClick={() => setShowReturnReceipt(false)} className="btn-close-popup">
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
                  <p><strong>Return No:</strong> {returnReceiptData.returnNo}</p>
                  <p><strong>Return Date:</strong> {returnReceiptData.returnDate}</p>
                </div>
                <div className="Cashier-info">
                  <p><strong>Original Bill:</strong> {returnReceiptData.originalBillNo}</p>
                </div>
                <div className="Cashier-info">
                  <p><strong>Bill Date:</strong> {returnReceiptData.originalBillDate}</p>
                </div>
                <div className="Cashier-info">
                  <p><strong>Staff ID:</strong> {returnReceiptData.staffId}</p>
                  <p><strong>Shift:</strong> {returnReceiptData.shift.charAt(0).toUpperCase() + returnReceiptData.shift.slice(1)}</p>
                  <p><strong>Refund:</strong> {returnReceiptData.refundMode.toUpperCase()}</p>
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
                  {returnReceiptData.items.map(item => (
                    <tr key={item._id}>
                      <td>{item.productName}</td>
                      <td>{item.returnQuantity}</td>
                      <td>Rs.{item.salePrice?.toFixed(2) || '0.00'}</td>
                      <td>Rs.{((item.salePrice || 0) * item.returnQuantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-summary">
                <div className="summary-line total">
                  <span>Total Refund:</span>
                  <span>Rs.{returnReceiptData.returnTotal.toFixed(2)}</span>
                </div>
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
                  <p><strong>Zemalt PVT LTD</strong></p>
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