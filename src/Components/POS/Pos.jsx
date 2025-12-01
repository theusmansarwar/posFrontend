import React, { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Plus,
  Minus,
  Printer,
  Download,
  Search,
  X,
  AlertCircle,
} from "lucide-react";
import { FaPhoneAlt } from "react-icons/fa";
import logoo from "../../Assets/logoo.jpg";
import "./Pos.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { fetchProductsList } from "../../DAL/fetch";
import { createBill } from "../../DAL/create";
import OutOfStock from "../OutOfStock";
import LowStock from "../LowStock";


const POSBillingSystem = () => {
  const [searchId, setSearchId] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [laborCost, setLaborCost] = useState(0);
  const [tunningCost, setTunningCost] = useState(0);
  const [customerPay, setCustomerPay] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [staffId, setStaffId] = useState("");
  const [shift, setShift] = useState("morning");
  const [paymentMode, setPaymentMode] = useState("cash");
  const [showBillPopup, setShowBillPopup] = useState(false);
  const [billData, setBillData] = useState(null);
  const [products, setProducts] = useState([]);

  const [fieldErrors, setFieldErrors] = useState({});

  const [globalError, setGlobalError] = useState("");

  const billRef = useRef();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("userData");
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        if (userData._id) setStaffId(userData._id);
        else if (userData.id) setStaffId(userData.id);
        else if (userData.username) setStaffId(userData.username);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    loadProducts();
  }, []);

  const loadProducts = async (keyword = "") => {
    try {
      const response = await fetchProductsList(1, 50, keyword);
      setProducts(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadProducts(searchId);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchId]);

  const updateSalePrice = (_id, newPrice) => {
    const price = parseFloat(newPrice) || 0;
    setCartItems(
      cartItems.map((item) =>
        item._id === _id ? { ...item, salePrice: price } : item
      )
    );
  };

  const handleAddToCart = (product) => {
    setGlobalError("");
    const existingItem = cartItems.find((item) => item._id === product._id);

    if (existingItem) {
      if (existingItem.quantity < existingItem.maxStock) {
        updateQuantity(product._id, existingItem.quantity + 1);
      } else {
        setGlobalError("Maximum stock reached for this product");
      }
    } else {
      setCartItems([
        ...cartItems,
        { ...product, quantity: 1, salePrice: 1.0, maxStock: product.quantity },
      ]);
    }
  };

  const updateQuantity = (_id, newQuantity) => {
    const item = cartItems.find((item) => item._id === _id);
    if (!item) return;

    if (newQuantity > item.maxStock) {
      setGlobalError("Maximum stock reached for this product");
      newQuantity = item.maxStock;
    }

    if (newQuantity < 1) {
      removeItem(_id);
      return;
    }

    setCartItems(
      cartItems.map((cartItem) =>
        cartItem._id === _id ? { ...cartItem, quantity: newQuantity } : cartItem
      )
    );
  };


  const removeItem = (_id) => {
    setCartItems(cartItems.filter((item) => item._id !== _id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.salePrice * item.quantity,
      0
    );
  };



  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const labor = parseFloat(laborCost) || 0;
    const tunning = parseFloat(tunningCost) || 0;
    return subtotal + tunning + labor;
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseFloat(customerPay) || 0;
    return paid > total ? paid - total : 0;
  };

  const calculateRemaining = () => {
    const total = calculateTotal();
    const paid = parseFloat(customerPay) || 0;
    return total > paid ? total - paid : 0;
  };

  const clearError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleGenerateBill = async () => {
    setFieldErrors({});
    setGlobalError("");

    if (cartItems.length === 0) {
      setGlobalError("Please add items to the cart first.");
      return;
    }
    if (!staffId.trim()) {
      setGlobalError("Staff ID is missing. Please re-login.");
      return;
    }
    const remaining = calculateRemaining();

    const payload = {
      items: cartItems.map((item) => ({
        productId: item._id,
        quantity: parseInt(item.quantity),
        salePrice: parseFloat(item.salePrice),
        total: parseFloat((item.salePrice * item.quantity).toFixed(2)),
      })),
      labourCost: parseFloat(laborCost) || 0,
      tunningCost: parseFloat(tunningCost) || 0,
      paymentMode: paymentMode,
      totalAmount: parseFloat(calculateTotal().toFixed(2)),
      userPaidAmount: parseFloat(customerPay) || 0,
      remainingAmount: parseFloat(remaining.toFixed(2)),
      change: parseFloat(calculateChange().toFixed(2)),
      staff: staffId,
      shift: shift,
      customerName: customerName,
      customerPhone: customerPhone,
    };

    try {
      const response = await createBill(payload);
      const bill = {
        billNo:
          response.billId || response.data?.billId || `BILL-${Date.now()}`,
        date: response.createdAt
          ? new Date(response.createdAt).toLocaleString()
          : new Date().toLocaleString(),
        items: cartItems,
        subtotal: calculateSubtotal(),
        tunningCost: parseFloat(tunningCost) || 0,
        laborCost: parseFloat(laborCost) || 0,
        total: calculateTotal(),
        customerPaid: parseFloat(customerPay) || 0,
        change: calculateChange(),
        remainingAmount: remaining,
        cashierName: response.data?.staff?.name || "Admin",
        shift,
        paymentMode,
        customerName,
        customerPhone,
      };

      setBillData(bill);
      if (response.status == 200 || response.status == 201) {
        setShowBillPopup(true);
      } else {
        setShowBillPopup(false);
      }

      setCartItems([]);
      setTunningCost(0);
      setLaborCost(0);
      setCustomerPay("");
      setCustomerName("");
      setCustomerPhone("");
    } catch (error) {
      console.error("Error creating bill:", error);

      const backendErrors = {};
      const responseData = error.response?.data;

      if (
        responseData?.missingFields &&
        Array.isArray(responseData.missingFields)
      ) {
        responseData.missingFields.forEach((field) => {
          backendErrors[field.name] = field.message;
        });
      } else {
        const backendMsg =
          responseData?.error ||
          responseData?.message ||
          error.message ||
          "Unknown Error";

        if (
          backendMsg.includes("customerName") ||
          backendMsg.toLowerCase().includes("customer name")
        ) {
          backendErrors.customerName = "Customer Name is required";
        }
        if (
          backendMsg.includes("customerPhone") ||
          backendMsg.toLowerCase().includes("customer phone")
        ) {
          backendErrors.customerPhone = "Customer Phone is required";
        }
      }

      if (Object.keys(backendErrors).length > 0) {
        setFieldErrors(backendErrors);
        setGlobalError("");
      } else {
        setGlobalError(
          responseData?.message ||
          responseData?.error ||
          error.message ||
          "Failed to generate bill"
        );
      }
    }
  };
  const handlePrint = () => {

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill-${billData?.billNo}</title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 10mm;
            display: flex;
            justify-content: center;
          }
          .receipt { 
            max-width: 80mm; 
            width: 100%;
          }
          .receipt-header { 
            text-align: center; 
            margin-bottom: 12px; 
            border-bottom: 2px solid #000; 
            padding-bottom: 10px; 
          }
          .company-logo { 
            width: 50px; 
            height: 50px; 
            object-fit: contain; 
            margin-bottom: 8px; 
          }
          .receipt-header h2 { 
            margin: 0 0 6px 0; 
            color: #000; 
            font-size: 16px; 
            font-weight: 700;
          }
          .receipt-header p { 
            margin: 2px 0; 
            font-size: 11px; 
          }
          .receipt-info { 
            margin-bottom: 12px; 
            font-size: 11px; 
          }
          .receipt-info p { 
            margin: 3px 0; 
          }
          .Bill-date { 
            text-align: center; 
            margin-bottom: 6px;
            padding-bottom: 6px;
            border-bottom: 1px dashed #999;
          }
          .payment-info { 
            text-align: center; 
            margin-bottom: 6px;
            padding-bottom: 6px;
            border-bottom: 1px dashed #999;
          }
          .customer-info-section { 
            padding-top: 6px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0; 
          }
          th, td { 
            padding: 5px 3px; 
            text-align: left; 
            font-size: 11px; 
          }
          th { 
            border-bottom: 1px solid #000; 
            font-weight: 600;
          }
          td {
            border-bottom: 1px dashed #ccc;
          }
          .receipt-summary { 
            border-top: 2px solid #000; 
            padding-top: 8px; 
            margin-top: 8px;
          }
          .summary-line { 
            display: flex; 
            justify-content: space-between; 
            padding: 4px 0; 
            font-size: 12px; 
          }
          .summary-line.total { 
            font-size: 15px; 
            font-weight: 700; 
            margin-top: 6px; 
            padding-top: 6px; 
            border-top: 1px solid #000; 
          }
          .labor-highlight { 
            font-weight: 600; 
            padding: 4px 0; 
          }
          .receipt-footer { 
            text-align: center; 
            margin-top: 12px; 
            padding-top: 10px; 
            border-top: 2px solid #000; 
          }
          .receipt-footer p { 
            margin: 3px 0; 
            font-size: 11px; 
          }
          .watermark { 
            margin-top: 10px; 
            padding-top: 8px; 
            border-top: 1px dashed #999; 
          }
          .watermark p { 
            margin: 2px 0; 
            font-size: 10px; 
            color: #666; 
          }
          .watermark strong { 
            color: #000; 
            font-size: 11px; 
          }
          .phone-contact { 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 5px; 
            margin-top: 3px; 
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header">
            <img src="/logoo.jpg" alt="Logo" class="company-logo" />
            <h2>Ibrahim Autos & Wholesale</h2>
            <p>Phone: 0307-8694372</p>
          </div>
          
          <div class="receipt-info">
            <div class="Bill-date">
              <p><strong>Bill No:</strong> ${billData.billNo}</p>
              <p><strong>Date:</strong> ${billData.date}</p>
            </div>
            <div class="payment-info">
              <p><strong>Payment:</strong> ${billData.paymentMode.toUpperCase()}</p>
            </div>
            <div class="customer-info-section">
              <p><strong>Customer:</strong> ${billData.customerName}</p>
              <p><strong>Phone:</strong> ${billData.customerPhone}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${billData.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>Rs. ${item.salePrice?.toFixed(2)}</td>
                  <td>Rs. ${(item.salePrice * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="receipt-summary">
           <div class="summary-line">
  <span>Subtotal:</span>
  <span>Rs. ${billData.subtotal.toFixed(2)}</span>
</div>

${billData.tunningCost > 0 ? `
  <div class="summary-line labor-highlight">
    <span>Tunning Cost:</span>
    <span>+Rs. ${billData.tunningCost.toFixed(2)}</span>
  </div>
` : ''}

${billData.laborCost > 0 ? `
  <div class="summary-line labor-highlight">
    <span>Labor Cost:</span>
    <span>+Rs. ${billData.laborCost.toFixed(2)}</span>
  </div>
` : ''}

<div class="summary-line total">
  <span>Total:</span>
  <span>Rs. ${billData.total.toFixed(2)}</span>
</div>

            <div class="summary-line">
              <span>Paid:</span>
              <span>Rs. ${billData.customerPaid.toFixed(2)}</span>
            </div>
            <div class="summary-line">
              <span>Change:</span>
              <span>Rs. ${billData.change.toFixed(2)}</span>
            </div>
            <div class="summary-line">
              <span>Remaining:</span>
              <span>Rs. ${billData.remainingAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="receipt-footer">
            <p>Thank you for your purchase!</p>
            <p>Visit again</p>
            <div class="watermark">
              <p>Software Powered by</p>
              <p><strong>Zemalt PVT LTD</strong></p>
              <p class="phone-contact">
                <span>📞 03285522005</span>
              </p>
            </div>
          </div>
        </div>
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
    pdf.save(`Bill-${billData?.billNo}.pdf`);
  };

  return (
    <div className="pos-container">
      <div className="pos-left-section">
        <h2 className="section-title">Available Products</h2>
        <div className="search-section">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search Product ID or Name"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="search-input"
            />
            <Search size={20} className="search-icon" />
          </div>
        </div>
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Qunatity</th>
                <th>Unit Price</th>
                <th>Sale Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-products">
                    No products available
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.productId}</td>
                    <td>{product.productName}</td>
                    <td className="quant-status">
                      <span
                        style={{ padding: "5px 10px", borderRadius: "6px" }}
                      >
                        {product.quantity === 0 ? (
                          <>
                            {product.quantity} <br /> <OutOfStock style={{ fontSize: "10px", fontWeight: 500, padding: "3px" }} />
                          </>
                        ) : product.quantity < 10 ? (
                          <>
                            {product.quantity} <br /> <LowStock style={{ fontSize: "10px", fontWeight: 500, padding: "3px" }} />
                          </>
                        ) : (
                          product.quantity
                        )}
                      </span>
                    </td>
                    <td>Rs. {product.unitPrice?.toFixed(2) || "0.00"}</td>
                    <td>Rs. {product.salePrice?.toFixed(2) || "0.00"}</td>
                    <td>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn-select"
                        disabled={product.quantity === 0}
                        style={{
                          cursor:
                            product.quantity === 0 ? "not-allowed" : "pointer",
                          opacity: product.quantity === 0 ? 0.5 : 1,
                        }}
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
                  <td colSpan="6" className="empty-cart">
                    No items in cart
                  </td>
                </tr>
              ) : (
                cartItems.map((item) => (
                  <tr key={item.productId}>
                    <td>{item.productName}</td>
                    <td>
                      <div className="quantity-control">
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          className="btn-qty"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="qty-display">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="btn-qty"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>
                    <td>Rs. {item.unitPrice?.toFixed(2) || "0.00"}</td>
                    <td>
                      <input
                        type="number"
                        value={item.salePrice}
                        onChange={(e) =>
                          updateSalePrice(item._id, e.target.value)
                        }
                        className="sale-price-input"
                        min="0"
                        step="0.01"
                        style={{
                          width: "80px",
                          padding: "4px 8px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "13px",
                        }}
                      />
                    </td>
                    <td>Rs. {(item.salePrice * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="btn-delete"
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
      </div>

      <div className="pos-right-section">
        <h1 className="pos-title">POS Billing System</h1>

        <div className="billing-summary">
          <div className="summary-row">
            <span>No of Items:</span>
            <span>
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>Rs. {calculateSubtotal().toFixed(2)}</span>
          </div>




          <div className="tunning-section">
            <div className="summary-row">
              <span>Tunning Cost (Rs.):</span>
              <input
                type="number"
                value={tunningCost}
                onChange={(e) => setTunningCost(parseFloat(e.target.value) || 0)}
                className="discount-input"
                placeholder="0.00"
                min="0"
              />
            </div>
          </div>

          {tunningCost > 0 && (
            <div className="summary-row labor-row">
              <span>Tunning Added:</span>
              <span className="labor-amount">
                +Rs. {parseFloat(tunningCost).toFixed(2)}
              </span>
            </div>
          )}
          <div className="labor-section">
            <div className="summary-row">
              <span>Labor Cost (Rs.):</span>
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
              <span className="labor-amount">
                +Rs. {parseFloat(laborCost).toFixed(2)}
              </span>
            </div>
          )}

          <div className="summary-row total-row">
            <span>Total Amount:</span>
            <span>Rs. {calculateTotal().toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Payment Mode:</span>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="payment-select"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="customer-details-section">
            <div className="summary-row">
              <span>
                Customer Name:<span style={{ color: "red" }}>*</span>
              </span>
              <div className="input-group">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    clearError("customerName");
                  }}
                  className={`discount-input ${fieldErrors.customerName ? "input-error" : ""
                    }`}
                  placeholder="Enter customer name"
                />
                {fieldErrors.customerName && (
                  <span className="error-text">{fieldErrors.customerName}</span>
                )}
              </div>
            </div>

            <div className="summary-row">
              <span>
                Customer Phone:<span style={{ color: "red" }}>*</span>
              </span>
              <div className="input-group">
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    clearError("customerPhone");
                  }}
                  className={`discount-input ${fieldErrors.customerPhone ? "input-error" : ""
                    }`}
                  placeholder="Enter phone number"
                />
                {fieldErrors.customerPhone && (
                  <span className="error-text">
                    {fieldErrors.customerPhone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="summary-row">
            <span>Customer Pay:</span>
            <div className="input-group">
              <input
                type="number"
                value={customerPay}
                onChange={(e) => setCustomerPay(e.target.value)}
                className="discount-input"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="summary-row">
            <span>Change:</span>
            <span>Rs. {calculateChange().toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Remaining Amount:</span>
            <span>Rs. {calculateRemaining().toFixed(2)}</span>
          </div>
        </div>

        {globalError && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #ef4444",
              color: "#b91c1c",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "15px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: "500",
            }}
          >
            <AlertCircle size={20} />
            <span>{globalError}</span>
          </div>
        )}

        <button onClick={handleGenerateBill} className="btn-generate">
          Generate Bill
        </button>
      </div>

      {showBillPopup && billData && (
        <div className="bill-popup-overlay">
          <div className="bill-popup-container">
            <button
              onClick={() => setShowBillPopup(false)}
              className="btn-close-popup"
            >
              <X size={20} />
            </button>

            <div ref={billRef} className="bill-receipt">
              <div className="receipt-header">
                <img
                  src="/logoo.jpg"
                  alt="Company Logo"
                  className="company-logo"
                />
                <h2>Ibrahim Autos & Wholesale</h2>
                <p>Phone: 0307-8694372</p>
              </div>

              <div className="receipt-info">
                <div className="Bill-date">
                  <p>
                    <strong>Bill No:</strong> {billData.billNo}
                  </p>
                  <p>
                    <strong>Date:</strong> {billData.date}
                  </p>
                </div>
                <div className="Cashier-info">
                  <p>
                    <strong>Cashier:</strong> {billData.cashierName}
                  </p>
                  <p>
                    <strong>Shift:</strong>{" "}
                    {billData.shift.charAt(0).toUpperCase() +
                      billData.shift.slice(1)}
                  </p>
                  <p>
                    <strong>Payment:</strong>{" "}
                    {billData.paymentMode.toUpperCase()}
                  </p>
                </div>
                <div className="customer-info-section">
                  <p>
                    <strong>Customer:</strong> {billData.customerName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {billData.customerPhone}
                  </p>
                </div>
              </div>

              <table className="receipt-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {billData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productId}</td>
                      <td>{item.productName}</td>
                      <td>{item.quantity}</td>
                      <td>Rs. {item.salePrice.toFixed(2)}</td>
                      <td>Rs. {(item.salePrice * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>

              </table>

              <div className="receipt-summary">
                <div className="summary-line">
                  <span>Subtotal:</span>
                  <span>Rs. {billData.subtotal.toFixed(2)}</span>
                </div>
                {/* {billData.discount > 0 && (
                  <>
                    <div className="summary-line">
                      <span>
                        Discount (
                        {billData.discountType === "percentage"
                          ? `${billData.discountValue}%`
                          : `Rs. ${billData.discountValue}`}
                        ):
                      </span>
                      <span>-Rs. {billData.discount.toFixed(2)}</span>
                    </div>
                    <div className="summary-line savings-highlight">
                      <span>Discounted Amount (You Saved):</span>
                      <span>Rs. {billData.discount.toFixed(2)}</span>
                    </div>
                  </>
                )} */}
                {billData.tunningCost > 0 && (
                  <div className="summary-line labor-highlight">
                    <span>Tunning Cost:</span>
                    <span>+Rs. {billData.tunningCost.toFixed(2)}</span>
                  </div>
                )}
                {billData.laborCost > 0 && (
                  <div className="summary-line labor-highlight">
                    <span>Labor Cost:</span>
                    <span>+Rs. {billData.laborCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-line total">
                  <span>Total:</span>
                  <span>Rs. {billData.total.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Paid:</span>
                  <span>Rs. {billData.customerPaid.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Change:</span>
                  <span>Rs. {billData.change.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Remaining Amount:</span>
                  <span>Rs. {billData.remainingAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="receipt-footer">
                <p>Thank you for your purchase!</p>
                <p>Visit again</p>
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
