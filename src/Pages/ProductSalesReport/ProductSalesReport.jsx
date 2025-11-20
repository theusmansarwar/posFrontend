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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

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
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 2, sm: 0 },
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
              width: { xs: "100%", sm: "300px", md: "350px" },
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
                          {/* APPLYING STYLE TO TYPOGRAPHY */}
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