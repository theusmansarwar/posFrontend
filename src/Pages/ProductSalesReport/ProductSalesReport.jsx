import { fetchProductSalesReport } from "../../DAL/fetch";
import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TAB_FILTERS = [
  { label: "All", filter: "all" },
  { label: "Today", filter: "today" },
  { label: "Yesterday", filter: "yesterday" },
  { label: "This Week", filter: "thisWeek" },
  { label: "This Month", filter: "thisMonth" },
  { label: "Last Month", filter: "lastMonth" },
];

const getProfitStyles = (profit) => {
  if (profit > 0) {
    return {
      color: "#1b5e20",
      backgroundColor: "rgba(76, 175, 80, 0.1)",
    };
  } else if (profit < 0) {
    return {
      color: "#b71c1c",
      backgroundColor: "rgba(244, 67, 54, 0.1)",
    };
  }
  return {
    color: "#616161",
    backgroundColor: "transparent",
  };
};

const ProductSalesReports = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(4);
  const [generating, setGenerating] = useState(false);

  const fetchDataFromAPI = useCallback(
    async (tabIndex, currentKeyword) => {
      setLoading(true);
      const apiPage = 1;
      const currentLimit = 99999;
      const filterValue = TAB_FILTERS[tabIndex]?.filter || "thisMonth";

      try {
        const response = await fetchProductSalesReport(
          filterValue,
          apiPage,
          currentLimit,
          currentKeyword
        );

        if (response?.status === false) {
          console.error("API call failed:", response);
          setReportData([]);
        } else {
          const report = response?.report || [];
          setReportData(report);
        }
      } catch (error) {
        console.error("Error fetching product sales report:", error);
        setReportData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchDataFromAPI(activeTab, searchQuery);
  }, [activeTab, searchQuery, fetchDataFromAPI]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    
    const currentTabLabel = TAB_FILTERS[activeTab]?.label || "Report";
    const currentDate = new Date().toLocaleString();
    
    // Calculate totals
    const totalQuantity = reportData.reduce((sum, row) => sum + row.totalQuantity, 0);
    const totalCost = reportData.reduce((sum, row) => sum + row.totalCost, 0);
    const totalSale = reportData.reduce((sum, row) => sum + row.totalSale, 0);
    const totalProfit = reportData.reduce((sum, row) => sum + row.profit, 0);

    // Create HTML content for the report
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 40px; background: white; max-width: 1200px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 3px solid #1976d2; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #1976d2; margin: 0 0 10px 0; font-size: 32px;">Ibrahim Autos & Wholesale</h1>
          <h2 style="color: #424242; margin: 0 0 10px 0; font-size: 22px; font-weight: 500;">Product Sales Report - ${currentTabLabel}</h2>
          <p style="color: #757575; margin: 5px 0; font-size: 14px;">Generated on: ${currentDate}</p>
          ${searchQuery ? `<p style="color: #757575; margin: 5px 0; font-size: 14px;">Search Filter: "${searchQuery}"</p>` : ''}
        </div>

        ${reportData.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 500; opacity: 0.9;">Total Products</h3>
              <p style="margin: 0; font-size: 28px; font-weight: 700;">${reportData.length}</p>
            </div>
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 500; opacity: 0.9;">Total Cost</h3>
              <p style="margin: 0; font-size: 28px; font-weight: 700;">PKR ${totalCost.toLocaleString()}</p>
            </div>
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 500; opacity: 0.9;">Total Sale</h3>
              <p style="margin: 0; font-size: 28px; font-weight: 700;">PKR ${totalSale.toLocaleString()}</p>
            </div>
            <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 500; opacity: 0.9;">Total Profit</h3>
              <p style="margin: 0; font-size: 28px; font-weight: 700;">PKR ${totalProfit.toLocaleString()}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead style="background: #1976d2; color: white;">
              <tr>
                <th style="padding: 15px; text-align: left; font-weight: 600; font-size: 14px;">Product Name</th>
                <th style="padding: 15px; text-align: right; font-weight: 600; font-size: 14px;">Quantity</th>
                <th style="padding: 15px; text-align: right; font-weight: 600; font-size: 14px;">Total Cost</th>
                <th style="padding: 15px; text-align: right; font-weight: 600; font-size: 14px;">Total Sale</th>
                <th style="padding: 15px; text-align: right; font-weight: 600; font-size: 14px;">Profit/Loss</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map((row, index) => {
                const profitClass = row.profit > 0 ? 'profit-positive' : row.profit < 0 ? 'profit-negative' : 'profit-zero';
                const profitColor = row.profit > 0 ? '#1b5e20' : row.profit < 0 ? '#b71c1c' : '#616161';
                const profitBg = row.profit > 0 ? 'rgba(76, 175, 80, 0.1)' : row.profit < 0 ? 'rgba(244, 67, 54, 0.1)' : 'transparent';
                const rowBg = index % 2 === 0 ? '#fafafa' : 'white';
                
                return `
                  <tr style="background-color: ${rowBg};">
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; font-size: 13px;">
                      <span style="font-weight: 600; color: #212121;">${row.name || 'N/A'}</span>
                      <span style="color: #9e9e9e; font-size: 11px; display: block; margin-top: 3px;">ID: ${row.productId || 'N/A'}</span>
                    </td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; font-size: 13px; text-align: right;">${row.totalQuantity}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; font-size: 13px; text-align: right;">PKR ${row.totalCost.toLocaleString()}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; font-size: 13px; text-align: right;">PKR ${row.totalSale.toLocaleString()}</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #e0e0e0; font-size: 13px; text-align: right;">
                      <span style="color: ${profitColor}; background-color: ${profitBg}; padding: 4px 8px; border-radius: 4px; font-weight: 600; display: inline-block;">PKR ${row.profit.toLocaleString()}</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : `
          <div style="text-align: center; padding: 40px; color: #757575; font-size: 16px;">
            <p>No sales data available for the selected period.</p>
          </div>
        `}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center; color: #757575; font-size: 12px;">
          <p style="margin: 5px 0;">Ibrahim Autos & Wholesale - Product Sales Report</p>
          <p style="margin: 5px 0;">Software Powered by Zemalt PVT LTD | Contact: 03285522005</p>
        </div>
      </div>
    `;

    // Create a temporary container
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '1200px';
    document.body.appendChild(tempContainer);

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      const fileName = `Product_Sales_Report_${currentTabLabel}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      // Remove temporary container
      document.body.removeChild(tempContainer);
      setGenerating(false);
    }
  };

  const dataToDisplay = reportData;

  return (
    <Box
      sx={{
        width: "95%",
        height: "95vh",
        p: { xs: 1, sm: 2, md: 3 },
        overflow: "hidden",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          height: "100%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            p: { xs: 2, sm: 2.5, md: 3 },
            borderBottom: "1px solid #e0e0e0",
            flexShrink: 0,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "var(--primary-color, #1976d2)",
              fontWeight: 600,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Product Sales Report
          </Typography>

          <TextField
            size="small"
            placeholder="Search by Product Name or ID..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearch}
            autoComplete="off"
            sx={{
              width: { xs: "100%", sm: "350px", md: "400px" },
              backgroundColor: "white",
              borderRadius: "8px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "& fieldset": {
                  borderColor: "#e0e0e0",
                },
                "&:hover fieldset": {
                  borderColor: "var(--primary-color, #1976d2)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--primary-color, #1976d2)",
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ color: "#9e9e9e" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
            onClick={handleGenerateReport}
            disabled={loading || dataToDisplay.length === 0 || generating}
            sx={{
              backgroundColor: "var(--primary-color, #1976d2)",
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              padding: "8px 24px",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(25, 118, 210, 0.3)",
              "&:hover": {
                backgroundColor: "#1565c0",
                boxShadow: "0 4px 10px rgba(25, 118, 210, 0.4)",
              },
              "&:disabled": {
                backgroundColor: "#e0e0e0",
                color: "#9e9e9e",
              },
            }}
          >
            {generating ? "Generating..." : "Generate Report"}
          </Button>
        </Box>

        {/* Tabs Section */}
        <Box
          sx={{
            borderBottom: "1px solid #e0e0e0",
            px: { xs: 1, sm: 2, md: 3 },
            flexShrink: 0,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: { xs: "13px", sm: "14px" },
                minWidth: { xs: "auto", sm: "auto" },
                px: { xs: 2, sm: 3 },
                py: 1.5,
              },
              "& .Mui-selected": {
                color: "var(--primary-color, #1976d2) !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "var(--primary-color, #1976d2)",
              },
            }}
          >
            {TAB_FILTERS.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* Loading State / No Data */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              gap: 2,
            }}
          >
            <CircularProgress
              size={45}
              thickness={4}
              sx={{ color: "var(--primary-color, #1976d2)" }}
            />
            <Typography
              sx={{
                color: "#757575",
                fontSize: "15px",
                fontWeight: 500,
              }}
            >
              Loading sales report...
            </Typography>
          </Box>
        ) : dataToDisplay.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
              gap: 2,
              p: 2,
            }}
          >
            <Typography
              sx={{
                color: "#757575",
                fontSize: { xs: "16px", sm: "18px" },
                fontWeight: 600,
              }}
            >
              No Sales Data Found
            </Typography>
            <Typography
              sx={{
                color: "#9e9e9e",
                fontSize: { xs: "13px", sm: "14px" },
                textAlign: "center",
              }}
            >
              {searchQuery
                ? `No products match "${searchQuery}" in this period.`
                : `No sales recorded for the selected period (${TAB_FILTERS[activeTab]?.label}).`}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Table */}
            <TableContainer
              sx={{
                flex: 1,
                overflow: "auto",
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#616161",
                        width: "30%",
                        minWidth: "250px",
                      }}
                    >
                      Product Name
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color: "#616161",
                        width: "10%",
                        minWidth: "100px",
                      }}
                    >
                      Quantity
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color: "#616161",
                        width: "15%",
                        minWidth: "120px",
                      }}
                    >
                      Total Cost
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color: "#616161",
                        width: "15%",
                        minWidth: "120px",
                      }}
                    >
                      Total Sale
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color: "#616161",
                        width: "20%",
                        minWidth: "150px",
                      }}
                    >
                      Profit/Loss
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataToDisplay.map((row, index) => {
                    const profitStyles = getProfitStyles(row.profit);
                    return (
                      <TableRow
                        key={row._id || index}
                        sx={{
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.02)",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 500,
                              fontSize: { xs: "13px", sm: "14px" },
                            }}
                          >
                            {row.name || "N/A"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#9e9e9e", fontSize: "10px" }}
                          >
                            ID: {row.productId || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              color: "#424242",
                              fontSize: { xs: "13px", sm: "14px" },
                            }}
                          >
                            {row.totalQuantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              color: "#616161",
                              fontSize: { xs: "13px", sm: "14px" },
                            }}
                          >
                            PKR {row.totalCost.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              color: "#616161",
                              fontSize: { xs: "13px", sm: "14px" },
                            }}
                          >
                            PKR {row.totalSale.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              color: profitStyles.color,
                              backgroundColor: profitStyles.backgroundColor,
                              fontWeight: 600,
                              fontSize: { xs: "13px", sm: "14px" },
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "4px",
                            }}
                          >
                            PKR {row.profit.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ProductSalesReports;