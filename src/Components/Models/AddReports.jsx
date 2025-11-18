import React, { useState, useEffect } from "react";
import { 
  Box, 
  Button, 
  MenuItem, 
  TextField, 
  Typography, 
  CircularProgress,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { 
  fetchAllBillReports,
  fetchAllExpenseReports,
  fetchAllStockReports
} from "../../DAL/fetch";

const reportTypes = ["Stock", "Bills", "Expenses"];

// Fields to exclude from table display
const excludeFields = ['_id', 'id', '__v', 'password', 'token', 'createdAt', 'updatedAt', '__typename'];

// Specific field configurations for each report type
const reportFieldConfig = {
  Stock: [
    { key: 'productId', label: 'Product ID', paths: ['productId', 'id'] },
    { key: 'productName', label: 'Product Name', paths: ['productName', 'name'] },
    { key: 'unitPrice', label: 'Unit Price', type: 'currency', paths: ['unitPrice', 'price'] },
    { key: 'salePrice', label: 'Sale Price', type: 'currency', paths: ['salePrice'] },
    { key: 'quantity', label: 'Quantity', paths: ['quantity', 'stock', 'availableStock'] },
  ],
  Bills: [
    { key: 'billId', label: 'Bill No', paths: ['billId', 'billNo', 'invoiceNo'] },
    { key: 'date', label: 'Date', type: 'date', paths: ['date', 'createdAt', 'billDate'] },
    { key: 'customerName', label: 'Customer Name', paths: ['customerName', 'customerName'] },
    { key: 'customerPhone', label: 'Customer Phone', paths: ['customerPhone', 'customerPhone'] },
    { key: 'totalAmount', label: 'Total Amount', type: 'currency', paths: ['totalAmount', 'total'] },
    { key: 'discount', label: 'Discount', type: 'currency', paths: ['discount'] },
    { key: 'labourCost', label: 'Labour Cost', type: 'currency', paths: ['labourCost', 'laborCost'] },
    { key: 'userPaidAmount', label: 'Paid Amount', type: 'currency', paths: ['userPaidAmount', 'paidAmount'] },
    { key: 'remainingAmount', label: 'Remaining', type: 'currency', paths: ['remainingAmount', 'pending'] },
    { key: 'paymentMode', label: 'Payment Mode', paths: ['paymentMode', 'paymentMethod'] },
    { key: 'shift', label: 'Shift', paths: ['shift'] },
    { key: 'cashier', label: 'Cashier', paths: ['staff.name', 'cashier', 'staff'] }
  ],
  Expenses: [
    { key: 'expenseId', label: 'Expense ID', paths: ['expenseId', 'ExpenseId', 'id'] },
    { key: 'expenseName', label: 'Expense Name', paths: ['expenseName', 'name', 'title'] },
    { key: 'amount', label: 'Amount', type: 'currency', paths: ['amount', 'expenseAmount'] },
    { key: 'date', label: 'Date', type: 'date', paths: ['date', 'expenseDate', 'createdAt'] },
    { key: 'description', label: 'Description', paths: ['description', 'remarks', 'notes'] },
  ]
};

// Function to get nested value from object with multiple path attempts
const getNestedValue = (obj, paths) => {
  if (!paths) return obj;
  
  const pathArray = Array.isArray(paths) ? paths : [paths];
  
  for (const path of pathArray) {
    const keys = path.split('.');
    let value = obj;
    let found = true;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        found = false;
        break;
      }
    }
    
    if (found && value !== null && value !== undefined && value !== '') {
      return value;
    }
  }
  
  return undefined;
};

// Function to extract meaningful info from nested objects
const extractInfo = (value, field) => {
  if (!value) return null;
  
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'object') {
    if (field === 'cashier' || field === 'paidBy') {
      if (value.name) return value.name;
      if (value.firstName && value.lastName) return `${value.firstName} ${value.lastName}`;
      if (value.firstName) return value.firstName;
    }
    
    if (field === 'category') {
      if (value.name) return value.name;
      if (value.categoryName) return value.categoryName;
    }
    
    if (value.name) return value.name;
    if (value.title) return value.title;
  }
  
  return null;
};

// Function to format field names nicely
const formatFieldName = (field) => {
  const customLabels = {
    productId: 'Product ID',
    productName: 'Product Name',
    unitPrice: 'Unit Price',
    salePrice: 'Sale Price',
    billId: 'Bill No',
    customerName: 'Customer Name',
    customerPhone: 'Customer Phone',
    totalAmount: 'Total Amount',
    userPaidAmount: 'Paid Amount',
    remainingAmount: 'Remaining',
    paymentMode: 'Payment Mode',
    labourCost: 'Labour Cost',
    expenseId: 'Expense ID',
    expenseName: 'Expense Name',
    paidBy: 'Paid By'
  };

  if (customLabels[field]) return customLabels[field];

  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
};

// Function to format values nicely
const formatValue = (value, type = null, field = null) => {
  if (value && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
    const extracted = extractInfo(value, field);
    if (extracted !== null) {
      value = extracted;
    } else {
      return '';
    }
  }
  
  if (value === null || value === undefined || value === '') return '';
  
  if (type === 'currency') {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      return `Rs. ${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    return '';
  }

  if (type === 'date' || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
      }
    } catch (e) {
      return '';
    }
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'object' && !(value instanceof Date)) {
    return '';
  }
  
  const strValue = value.toString().trim();
  return strValue || '';
};

// Function to filter and clean data for display
const cleanDataForDisplay = (data, reportType) => {
  if (!data || data.length === 0) return { headers: [], rows: [] };
  
  const config = reportFieldConfig[reportType];
  
  if (config) {
    const headers = config.map(field => ({
      key: field.key,
      label: field.label,
      type: field.type
    }));

    const rows = data.map(item => {
      const row = {};
      config.forEach(field => {
        const paths = field.paths || [field.key];
        let value = getNestedValue(item, paths);
        
        if ((!value || (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date))) && value !== 0) {
          const extracted = extractInfo(value || item, field.key);
          if (extracted !== null && extracted !== undefined && extracted !== '') {
            value = extracted;
          }
        }
        
        row[field.key] = value;
      });
      return row;
    });

    return { headers, rows, config };
  } else {
    const firstItem = data[0];
    const headers = [];
    
    Object.keys(firstItem).forEach(key => {
      if (!excludeFields.includes(key) && !key.includes('Id') && key !== 'id') {
        headers.push({
          key,
          label: formatFieldName(key),
          type: null
        });
      }
    });

    const rows = data.map(item => {
      const row = {};
      headers.forEach(header => {
        row[header.key] = item[header.key];
      });
      return row;
    });

    return { headers, rows, config: null };
  }
};

const POSReports = () => {
  const [reportType, setReportType] = useState("");
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [savedReports, setSavedReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // All data from backend
  const [stockData, setStockData] = useState([]);
  const [billsData, setBillsData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState("");

  
  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({ 
    open: false, 
    reportId: null, 
    reportTitle: "" 
  });
  const [deleting, setDeleting] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchAllData();
    loadSavedReports();
  }, []);

const fetchAllData = async (type) => {
  setDataLoading(true);

  try {
    let stockRes = [];
    let billsRes = [];
    let expensesRes = [];

    if (type === "bills") {
      billsRes = await fetchAllBillReports(1, 1000, "");
      setBillsData(billsRes?.data || billsRes || []);
    }

    if (type === "expenses") {
      expensesRes = await fetchAllExpenseReports(1, 1000, "");
      setExpensesData(expensesRes?.data || expensesRes || []);
    }

    if (type === "stock") {
      stockRes = await fetchAllStockReports(1, 1000, "");
      setStockData(stockRes?.data || stockRes || []);
    }

    if (type === "all") {
      const [exp, bills, stock] = await Promise.all([
        fetchAllExpenseReports(1, 1000, ""),
        fetchAllBillReports(1, 1000, ""),
        fetchAllStockReports(1, 1000, ""),
      ]);
      setExpensesData(exp?.data || exp || []);
      setBillsData(bills?.data || bills || []);
      setStockData(stock?.data || stock || []);
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    setSnackbar({
      open: true,
      message: "Error loading data. Please refresh the page.",
      severity: "error"
    });
  } finally {
    setDataLoading(false);
  }
};



  const loadSavedReports = () => {
    const saved = localStorage.getItem('posReports');
    if (saved) {
      setSavedReports(JSON.parse(saved));
    }
  };

  const saveReportsToStorage = (reports) => {
    localStorage.setItem('posReports', JSON.stringify(reports));
  };

const handleGenerate = async () => {
  if (!reportType) {
    setSnackbar({
      open: true,
      message: "Please select a report type",
      severity: "warning",
    });
    return;
  }

  const type = reportType.toLowerCase();
  await fetchAllData(type);

  let selectedData = [];

  switch (reportType) {
    case "Stock":
      selectedData = [...stockData];
      break;
    case "Bills":
      selectedData = [...billsData];
      break;
    case "Expenses":
      selectedData = [...expensesData];
      break;
  }

  console.log("Generated data:", selectedData);
  setData(selectedData);
  setShowForm(true);
};

  const handleSubmit = async () => {
    if (!title || !reportType) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields",
        severity: "warning"
      });
      return;
    }

    const newReport = {
      id: Date.now().toString(),
      reportType,
      title,
      description,
      generatedBy: localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).name || "Admin" : "Admin",
      data,
      createdAt: new Date().toISOString()
    };

    setLoading(true);
    try {
      const updatedReports = [...savedReports, newReport];
      setSavedReports(updatedReports);
      saveReportsToStorage(updatedReports);
      
      setSnackbar({
        open: true,
        message: "Report saved successfully!",
        severity: "success"
      });
      setTitle("");
      setDescription("");
      setReportType("");
      setData([]);
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      setSnackbar({
        open: true,
        message: "Error saving report. Please try again.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (report) => {
    setViewingReport(report);
  };

  const handleCloseReport = () => {
    setViewingReport(null);
  };

  const handleDeleteClick = (e, report) => {
    e.stopPropagation();
    setDeleteDialog({
      open: true,
      reportId: report.id,
      reportTitle: report.title
    });
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const updatedReports = savedReports.filter(r => r.id !== deleteDialog.reportId);
      setSavedReports(updatedReports);
      saveReportsToStorage(updatedReports);
      
      setSnackbar({
        open: true,
        message: "✓ Report deleted successfully!",
        severity: "success"
      });
      setDeleteDialog({ open: false, reportId: null, reportTitle: "" });
    } catch (error) {
      console.error("Error deleting report:", error);
      setSnackbar({
        open: true,
        message: "Error deleting report. Please try again.",
        severity: "error"
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, reportId: null, reportTitle: "" });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Paid': 'rgba(0, 128, 0, 0.15)',
      'Unpaid': 'rgba(255, 0, 0, 0.15)',
      'Pending': 'rgba(255, 255, 0, 0.15)',
      'Active': 'rgba(0, 255, 0, 0.1)',
      'Inactive': 'rgba(128, 128, 128, 0.1)',
      'In Stock': 'rgba(0, 128, 0, 0.15)',
      'Out of Stock': 'rgba(255, 0, 0, 0.15)',
      'Low Stock': 'rgba(255, 165, 0, 0.15)'
    };
    return statusColors[status] || '#f0f0f0';
  };

  const renderTable = (tableData, reportType) => {
    const { headers, rows } = cleanDataForDisplay(tableData, reportType);
    
    if (!rows || rows.length === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No data available
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ 
        overflowX: "auto", 
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}>
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse",
          fontSize: "0.875rem"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
              <th style={{ 
                border: "1px solid #1565c0", 
                padding: "14px 16px",
                textAlign: "left",
                fontWeight: 600,
                fontSize: "0.9rem",
                minWidth: "50px"
              }}>
                #
              </th>
              {headers.map((header) => (
                <th 
                  key={header.key} 
                  style={{ 
                    border: "1px solid #1565c0", 
                    padding: "14px 16px",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    minWidth: "120px"
                  }}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? "#fff" : "#f8f9fa",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e3f2fd")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#f8f9fa")
                }
              >
                <td
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "12px 16px",
                    color: "#424242",
                    fontWeight: 500,
                  }}
                >
                  {idx + 1}
                </td>
                {headers.map((header, i) => (
                  <td
                    key={i}
                    style={{
                      border: "1px solid #e0e0e0",
                      padding: "12px 16px",
                      color: "#616161",
                      maxWidth: "300px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={formatValue(item[header.key], header.type, header.key)}
                  >
                    {header.key === "status" ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontWeight: "600",
                          backgroundColor: getStatusColor(item.status),
                          color: ["Unpaid", "Rejected", "Out of Stock"].includes(item.status) ? "darkred" : "black",
                          textAlign: "center",
                          minWidth: "70px",
                        }}
                      >
                        {item.status}
                      </span>
                    ) : (
                      formatValue(item[header.key], header.type, header.key)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  if (dataLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">Loading data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, margin: "0 auto", p: 4 }}>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Report?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the report <strong>"{deleteDialog.reportTitle}"</strong>? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleDeleteCancel} 
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Viewing Report Modal */}
      {viewingReport && (
        <>
          <Paper 
            elevation={3} 
            sx={{ 
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 1200,
              maxHeight: "90vh",
              overflow: "auto",
              zIndex: 1300,
              p: 4
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  {viewingReport.title}
                </Typography>
                <Box display="flex" gap={1} mb={1}>
                  <Chip 
                    label={viewingReport.reportType} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    label={viewingReport.generatedBy} 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`${viewingReport.data?.length || 0} records`} 
                    size="small" 
                    color="success"
                    variant="outlined"
                  />
                </Box>
                {viewingReport.description && (
                  <Typography variant="body2" color="text.secondary">
                    {viewingReport.description}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Generated on {new Date(viewingReport.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {new Date(viewingReport.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleCloseReport}
                sx={{ textTransform: "none" }}
              >
                Close
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {renderTable(viewingReport.data, viewingReport.reportType)}
          </Paper>

          <Box
            onClick={handleCloseReport}
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1200
            }}
          />
        </>
      )}

      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Generate Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select a report type and generate detailed reports for your records
        </Typography>
      </Box>

      {/* Report Type Selection */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" gap={2} alignItems="flex-end">
          <TextField
            select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            sx={{ flex: 1 }}
            variant="outlined"
          >
            {reportTypes.map((type, idx) => (
              <MenuItem key={idx} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGenerate} 
            disabled={!reportType}
            sx={{ 
              px: 4, 
              py: 1.5,
              textTransform: "none",
              fontSize: "1rem"
            }}
          >
            Generate Report
          </Button>
        </Box>
      </Paper>

      {/* Form and Preview */}
      {showForm && (
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            Report Details
          </Typography>
          
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            <TextField
              label="Report Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              variant="outlined"
              placeholder="Enter report title"
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Optional description"
              multiline
              rows={4}
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" mb={3}>
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleSubmit}
              disabled={loading || !title}
              sx={{ 
                px: 4, 
                py: 1.2,
                textTransform: "none",
                fontSize: "1rem"
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Report"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Typography variant="h6" fontWeight={600}>
              Preview
            </Typography>
            <Chip 
              label={`${data.length} records`} 
              color="primary" 
              size="small" 
            />
          </Box>
          
          {renderTable(data, reportType)}
        </Paper>
      )}

      {/* Saved Reports */}
      <Box>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Saved Reports
        </Typography>
        
        {savedReports.length === 0 ? (
          <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No saved reports yet. Generate your first report above.
            </Typography>
          </Paper>
        ) : (
          <Box display="grid" gap={2}>
            {savedReports.map((r, idx) => (
              <Card 
                key={idx} 
                elevation={2}
                sx={{ 
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    elevation: 4,
                    transform: "translateY(-2px)",
                    boxShadow: 3
                  }
                }}
                onClick={() => handleViewReport(r)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {r.title}
                      </Typography>
                      <Box display="flex" gap={1} mb={1}>
                        <Chip 
                          label={r.reportType} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          label={r.generatedBy} 
                          size="small" 
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Generated on {new Date(r.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} at {new Date(r.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        onClick={(e) => { e.stopPropagation(); handleViewReport(r); }}
                        sx={{
                          color: "primary.main",
                          border: "2px solid",
                          borderColor: "primary.main",
                          padding: "8px",
                          "&:hover": {
                            backgroundColor: "primary.main",
                            color: "white"
                          }
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => handleDeleteClick(e, r)}
                        sx={{
                          color: "error.main",
                          border: "2px solid",
                          borderColor: "error.main",
                          padding: "8px",
                          "&:hover": {
                            backgroundColor: "error.main",
                            color: "white"
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Snackbar for Messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: "100%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            fontSize: "15px",
            fontWeight: 500
          }}
          icon={snackbar.severity === "success" ? <CheckCircleIcon fontSize="inherit" /> : undefined}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default POSReports;