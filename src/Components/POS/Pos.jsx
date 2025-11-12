import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Trash2, Plus, Minus, Printer, Download, Search, X } from 'lucide-react';
import { FaPhoneAlt } from "react-icons/fa";
import logoo from '../../Assets/logoo.jpg'
import './Pos.css';

const POSBillingSystem = () => {
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [discountType, setDiscountType] = useState('amount');
  const [discountValue, setDiscountValue] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [customerPay, setCustomerPay] = useState('');
  const [staffId, setStaffId] = useState('');
  const [shift, setShift] = useState('morning');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [showBillPopup, setShowBillPopup] = useState(false);
  const [billData, setBillData] = useState(null);
  const [products, setProducts] = useState([]);
  const billRef = useRef();

  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        const res = await axios.get('https://pos.ztesting.site/backend/stock/list?page=1&limit=50');
        setProducts(res.data?.data || res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchInitialProducts();
  }, []);

  const handleSearch = async () => {
    try {
      const res = await axios.get(`https://pos.ztesting.site/backend/stock/list?page=1&limit=10&keyword=${searchId}`);
      const apiProducts = res.data?.data || res.data;

      if (apiProducts.length > 0) {
        setSearchResult(apiProducts[0]);
      } else {
        setSearchResult(null);
        alert('No products found!');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error fetching products');
    }
  };

const handleAddToCart = (product) => {
  const existingItem = cartItems.find(item => item._id === product._id);
  if (existingItem) {
    updateQuantity(product._id, existingItem.quantity + 1);
  } else {
    setCartItems([...cartItems, { ...product, quantity: 1 }]);
  }
  setSearchId('');
  setSearchResult(null);
};


const updateQuantity = (_id, newQuantity) => {
  if (newQuantity < 1) {
    removeItem(_id);
    return;
  }
  setCartItems(cartItems.map(item =>
    item._id === _id ? { ...item, quantity: newQuantity } : item
  ));
};

const removeItem = (_id) => {
  setCartItems(cartItems.filter(item => item._id !== _id));
};


  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const labor = parseFloat(laborCost) || 0;
    return subtotal - discount + labor;
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseFloat(customerPay) || 0;
    return paid - total;
  };

  const handleGenerateBill = async () => {
    if (cartItems.length === 0) {
      alert('Please add items to cart!');
      return;
    }

    if (!staffId.trim()) {
      alert('Please enter staff ID!');
      return;
    }

    if (!customerPay || parseFloat(customerPay) <= 0) {
      alert('Please enter a valid payment amount!');
      return;
    }

    // Prepare payload for API
    const payload = {
      items: cartItems.map(item => ({
        productId: item._id,
        quantity: parseInt(item.quantity)
      })),
      discount: parseFloat(calculateDiscount().toFixed(2)),
      laborCost: parseFloat(laborCost) || 0,
      paymentMode: paymentMode,
      userPaidAmount: parseFloat(customerPay),
      staff: staffId,
      shift: shift
    };

    console.log('Sending API Payload:', JSON.stringify(payload, null, 2));

    try {
      // Call the API
      const response = await axios.post('https://pos.ztesting.site/backend/bill/create', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);

      // Prepare bill data for display
      const bill = {
        billNo: response.data?.billId || response.data?.data?.billId || `BILL-${Date.now()}`,
        date: response.data?.createdAt ? new Date(response.data.createdAt).toLocaleString() : new Date().toLocaleString(),
        items: cartItems,
        subtotal: calculateSubtotal(),
        discountType: discountType,
        discountValue: discountValue,
        discount: calculateDiscount(),
        laborCost: parseFloat(laborCost) || 0,
        total: calculateTotal(),
        customerPaid: parseFloat(customerPay) || 0,
        change: calculateChange(),
        cashierName: response.data?.data?.staff?.name || "Admin",
        shift: shift,
        paymentMode: paymentMode
      };

      setBillData(bill);
      setShowBillPopup(true);

      // Reset form after successful bill generation
      setCartItems([]);
      setDiscountValue(0);
      setLaborCost(0);
      setCustomerPay('');
      
    } catch (error) {
      console.error('Error creating bill:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Unknown error occurred';
      
      alert(`Error creating bill: ${errorMessage}\n\nPlease check the console for details.`);
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
            border-bottom: 2px solid #1e3a8a;
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
          }
          .summary-line.total {
            font-size: 17px;
            font-weight: 700;
            color: #1e3a8a;
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
        </style>
      </head>
      <body>${billRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const billHTML = billRef.current.innerHTML;
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
      <body>${billHTML}</body>
      </html>
    `], { type: 'text/html' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-${billData?.billNo}.html`;
    a.click();
  };

  return (
    <div className="pos-container">
      <div className="pos-left-section">
        <h2 className="section-title">Available Products</h2>
        
        <div className="search-section">
          <input
            type="text"
            placeholder="Search Product ID or Name"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="btn-search">
            <Search size={20} /> Search
          </button>
        </div>

        {searchResult && (
          <div className="search-result">
            <div className="result-details">
              <span className="result-id">{searchResult.productId}</span>
              <span className="result-name">{searchResult.productName}</span>
              <span className="result-price">${searchResult.unitPrice?.toFixed(2) || '0.00'}</span>
            </div>
            <button onClick={() => handleAddToCart(searchResult)} className="btn-add">
              Add to Cart
            </button>
          </div>
        )}

        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Unit Price</th>
                <th>Sale Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-products">No products available</td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>{product.productId}</td>
                    <td>{product.productName}</td>
                    <td>${product.unitPrice?.toFixed(2) || '0.00'}</td>
                    <td>${product.salePrice?.toFixed(2) || '0.00'}</td>
                    <td>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn-select"
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
        
           <div className="cart-section">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Sale Price</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cart">No items in cart</td>
                </tr>
              ) : (
                cartItems.map(item => (
                  <tr key={item.productId}>
                    <td>{item.productName}</td>
                    <td>
                      <div className="quantity-control">
                        <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="btn-qty">
                          <Minus size={16} />
                        </button>
                        <span className="qty-display">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="btn-qty">
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>
                    <td>${item.unitPrice?.toFixed(2) || '0.00'}</td>
                    <td>${item.salePrice?.toFixed(2) || '0.00'}</td>
                    <td>${(item.salePrice * item.quantity).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeItem(item._id)} className="btn-delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Side - Billing Section */}
      <div className="pos-right-section">
        <h1 className="pos-title">POS Billing System</h1>

        <div className="billing-summary">
          <div className="summary-row">
            <span>No of Items:</span>
            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>

          <div className="discount-section">
            <div className="discount-type-selector">
              <label>
                <input
                  type="radio"
                  value="amount"
                  checked={discountType === 'amount'}
                  onChange={(e) => setDiscountType(e.target.value)}
                />
                Amount ($)
              </label>
              <label>
                <input
                  type="radio"
                  value="percentage"
                  checked={discountType === 'percentage'}
                  onChange={(e) => setDiscountType(e.target.value)}
                />
                Percentage (%)
              </label>
            </div>
            <div className="summary-row">
              <span>Discount {discountType === 'percentage' ? '(%)' : '($)'}:</span>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                className="discount-input"
                placeholder="0.00"
                min="0"
                max={discountType === 'percentage' ? '100' : undefined}
              />
            </div>
          </div>

          {calculateDiscount() > 0 && (
            <div className="summary-row savings-row">
              <span>You Saved:</span>
              <span className="savings-amount">-${calculateDiscount().toFixed(2)}</span>
            </div>
          )}

          <div className="labor-section">
            <div className="summary-row">
              <span>Labor Cost ($):</span>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                className="discount-input"
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          {laborCost > 0 && (
            <div className="summary-row labor-row">
              <span>Labor Added:</span>
              <span className="labor-amount">+${parseFloat(laborCost).toFixed(2)}</span>
            </div>
          )}

          <div className="summary-row total-row">
            <span>Total Amount:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Payment Mode:</span>
            <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="payment-select">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          <div className="summary-row">
            <span>Customer Pay:</span>
            <input
              type="number"
              value={customerPay}
              onChange={(e) => setCustomerPay(e.target.value)}
              className="discount-input"
              placeholder="0.00"
            />
          </div>
          <div className="summary-row">
            <span>Change:</span>
            <span>${calculateChange().toFixed(2)}</span>
          </div>
        </div>

        <button onClick={handleGenerateBill} className="btn-generate">
          Generate Bill
        </button>
      </div>

      {/* Bill Popup Modal */}
      {showBillPopup && billData && (
        <div className="bill-popup-overlay">
          <div className="bill-popup-container">
            <button onClick={() => setShowBillPopup(false)} className="btn-close-popup">
              <X size={20} />
            </button>

            {/* <h2 className="bill-popup-title">Bill Receipt</h2> */}

            <div ref={billRef} className="bill-receipt">
              <div className="receipt-header">
                <img src={logoo} alt="Company Logo" className="company-logo" />
                <h2>Ibrahim Autos & Wholesale</h2>
                <p>Phone: 0307-8694372</p>
              </div>

              <div className="receipt-info">
                <div className="Bill-date">
                  <p><strong>Bill No:</strong> {billData.billNo}</p>
                  <p><strong>Date:</strong> {billData.date}</p>
                </div>
                <div className="Cashier-info">
                  <p><strong>Cashier:</strong> {billData.cashierName}</p>
                  <p><strong>Shift:</strong> {billData.shift.charAt(0).toUpperCase() + billData.shift.slice(1)}</p>
                  <p><strong>Payment:</strong> {billData.paymentMode.toUpperCase()}</p>
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
                  {billData.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>${item.salePrice?.toFixed(2)}</td>
                      <td>${(item.salePrice * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="receipt-summary">
                <div className="summary-line">
                  <span>Subtotal:</span>
                  <span>${billData.subtotal.toFixed(2)}</span>
                </div>
                {billData.discount > 0 && (
                  <>
                    <div className="summary-line">
                      <span>Discount ({billData.discountType === 'percentage' ? `${billData.discountValue}%` : `$${billData.discountValue}`}):</span>
                      <span>-${billData.discount.toFixed(2)}</span>
                    </div>
                    <div className="summary-line savings-highlight">
                      <span>Discounted Amount (You Saved):</span>
                      <span>${billData.discount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {billData.laborCost > 0 && (
                  <div className="summary-line labor-highlight">
                    <span>Labor Cost:</span>
                    <span>+${billData.laborCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-line total">
                  <span>Total:</span>
                  <span>${billData.total.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Paid:</span>
                  <span>${billData.customerPaid.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Change:</span>
                  <span>${billData.change.toFixed(2)}</span>
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

            <div className="bill-actions">
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

export default POSBillingSystem;