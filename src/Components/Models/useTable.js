import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Toolbar,
  Typography,
  Checkbox,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchallroleslist, fetchallStocklist, fetchalluserlist, fetchallExpenselist } from "../../DAL/fetch";
import { formatDate } from "../../Utils/Formatedate";
import truncateText from "../../truncateText";
import { useNavigate } from "react-router-dom";
import { deleteAllRoles, deleteAllStock, deleteAllUsers, deleteAllExpense } from "../../DAL/delete";
import { useAlert } from "../Alert/AlertContext";
import DeleteModal from "./confirmDeleteModel";
import AddUsers from "./addUsers";
import AddRoles from "./AddRoles";
import AddStock from "./addStockM";
import AddExpense from "./AddExpense";
import AddNewStock from "./AddNewStock";



export function useTable({ attributes, tableType, limitPerPage = 10 }) {
  const { showAlert } = useAlert(); // Since you created a custom hook
  const savedState =
    JSON.parse(localStorage.getItem(`${tableType}-tableState`)) || {};
  const [page, setPage] = useState(savedState.page || 1);
  const [rowsPerPage, setRowsPerPage] = useState(
    savedState.rowsPerPage || limitPerPage
  );
  const [searchQuery, setSearchQuery] = useState(savedState.searchQuery || "");
  const [selected, setSelected] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();
  const [openRolesModal, setOpenRolesModal] = useState(false);
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openStockModal, setOpenStockModal] = useState(false);
  const [openNewStockModal, setOpenNewStockModal] = useState(false);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [modeltype, setModeltype] = useState("Add");
  const [modelData, setModelData] = useState({});
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // delay in ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);
  useEffect(() => {
    localStorage.setItem(
      `${tableType}-tableState`,
      JSON.stringify({ page, rowsPerPage, searchQuery })
    );
  }, [page, rowsPerPage, searchQuery, tableType]);

  const fetchData = async () => {
    let response;
    setIsLoading(true)

    if (tableType === "Roles") {
      response = await fetchallroleslist(page, rowsPerPage, searchQuery);
      if (response.status == 400) {
        localStorage.removeItem("Token");
        navigate("/login");
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setData(response.data);
        setTotalRecords(response.totalRoles);

      }
    }

    else if (tableType === "Users") {
      response = await fetchalluserlist(page, rowsPerPage, searchQuery);
      if (response.status == 400) {
        localStorage.removeItem("Token");
        navigate("/login");
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setData(response.users);
        setTotalRecords(response.totalUsers);
      }
    }

    else if (tableType === "Stock") {
      response = await fetchallStocklist(page, rowsPerPage, searchQuery);
      if (response.status == 400) {
        localStorage.removeItem("Token");
        navigate("/login");
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setData(response.data);
        setTotalRecords(response.totalRecords);
      }
    }
    else if (tableType === "Expense") {
      response = await fetchallExpenselist(page, rowsPerPage, searchQuery);
      if (response.status == 400) {
        localStorage.removeItem("Token");
        navigate("/login");
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setData(response.data);
        setTotalRecords(response.totalRecords);
      }
    }
  };

  const handleSelectAllClick = (event) => {
    setSelected(event.target.checked ? data.map((row) => row._id) : []);
  };

  const isSelected = (id) => selected.includes(id);


  //  Fixed pagination handling
  const handleChangePage = (_, newPage) => {
    const nextPage = newPage + 1; // Convert MUI’s 0-based to API’s 1-based

    // Prevent going below page 1
    if (nextPage < 1) return;
    setPage(nextPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(1); // Always go to page 1 after changing rows per page
  };


  const handleviewClick = (category) => {
    if (tableType === "Roles") {
      setOpenRolesModal(true);
      setModelData(category);
      setModeltype("Update");
    }
    else if (tableType === "Users") {
      setOpenUserModal(true);
      setModelData(category);
      setModeltype("Update");
    }


    else if (tableType === "Stock") {
      setOpenStockModal(true);
      setModelData(category);
      setModeltype("Update");
    }
    else if (tableType === "Expense") {
      setOpenExpenseModal(true);
      setModelData(category);
      setModeltype("Update");
    }

  };
  const handleAddNew = (category) => {
    if (tableType === "Stock") {
      setOpenNewStockModal(true);
      setModelData(category);
    }
  }


  const handleDelete = async () => {
    if (selected.length === 0) {
      showAlert("warning", "No items selected for deletion");
      return;
    }
    try {
      let response;

      if (tableType === "Roles") {
        response = await deleteAllRoles({ ids: selected });
      }
      else if (tableType === "Users") {
        response = await deleteAllUsers({ ids: selected });
      }

      else if (tableType === "Stock") {
        response = await deleteAllStock({ ids: selected });
      }
      else if (tableType === "Expense") {
        response = await deleteAllExpense({ ids: selected });
      }

      if (response.status === 200) {
        showAlert("success", response.message || "Deleted successfully");
        fetchData();
        setSelected([]);
      } else {
        showAlert("error", response.message || "Failed to delete items");
      }
    } catch (error) {
      console.error("Error in delete request:", error);
      showAlert("error", "Something went wrong. Try again later.");
    }
  };

  const handleAddButton = () => {
    if (tableType === "Roles") {
      setOpenRolesModal(true);
      setModeltype("Add");
      setModelData();
    }
    else if (tableType === "Users") {
      setOpenUserModal(true);
      setModeltype("Add");
      setModelData();
    }


    else if (tableType === "Stock") {
      setOpenStockModal(true);
      setModeltype("Add");
      setModelData();
    }

    else if (tableType === "Expense") {
      setOpenExpenseModal(true);
      setModeltype("Add");
      setModelData();
    }
  };

  const getNestedValue = (obj, path) => {
    return path
      .split(".")
      .reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : "N/A"),
        obj
      );
  };

  const handleResponse = (response) => {
    showAlert(response.messageType, response.message);
    fetchData();
  };
  const handleDeleteClick = () => {
    setOpenDeleteModal(true);
  };

  return {
    tableUI: (
      <>
        {openRolesModal && (
          <AddRoles
            open={openRolesModal}
            setOpen={setOpenRolesModal}
            Modeltype={modeltype}
            Modeldata={modelData}
            onResponse={handleResponse}
          />
        )}
        {openUserModal && (
          <AddUsers
            open={openUserModal}
            setOpen={setOpenUserModal}
            Modeltype={modeltype}
            Modeldata={modelData}
            onResponse={handleResponse}
          />
        )}

        {openStockModal && (
          <AddStock
            open={openStockModal}
            setOpen={setOpenStockModal}
            Modeltype={modeltype}
            Modeldata={modelData}
            onResponse={handleResponse}
          />
        )}
        {openNewStockModal && (
          <AddNewStock
            open={openNewStockModal}
            setOpen={setOpenNewStockModal}
            Modeldata={modelData}
            onResponse={handleResponse}
          />
        )}
        {openExpenseModal && (
          <AddExpense
            open={openExpenseModal}
            setOpen={setOpenExpenseModal}
            Modeltype={modeltype}
            Modeldata={modelData}
            onResponse={handleResponse}
          />
        )}

        <DeleteModal
          open={openDeleteModal}
          setOpen={setOpenDeleteModal}
          onConfirm={handleDelete}
        />

        <Box sx={{ width: "100%" }}>
          <Paper sx={{ width: "100%", maxHeight: "95vh", boxShadow: "none" }}>
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h5" sx={{ color: "var(--primary-color)" }}>
                {tableType} List
              </Typography>

              <TextField
                size="small"
                placeholder="Search..."
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && setDebouncedSearch(searchQuery)}
                sx={{
                  minWidth: 200,
                  backgroundColor: "white",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "var(--background-color)",
                    },
                    "&:hover fieldset": {
                      borderColor: "var(--background-color)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "var(--background-color)",
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon
                        sx={{
                          cursor: "pointer",
                          color: "var(--background-color)",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              {selected.length > 0 ? (
                <IconButton onClick={handleDeleteClick} sx={{ color: "red" }}>
                  <DeleteIcon />
                </IconButton>
              ) : (
                tableType !== "CategoriesNames" && (
                  <Button
                    sx={{
                      background: "var(--horizontal-gradient)",
                      color: "var(--white-color)",
                      borderRadius: "var(--border-radius-secondary)",
                      "&:hover": { background: "var(--vertical-gradient)" },
                      textTransform: "none"
                    }}
                    onClick={handleAddButton}
                  >
                    Add New {tableType}
                  </Button>
                )
              )}
            </Toolbar>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      "& th": {
                        backgroundColor: "var(--primary-color)",
                        color: "white",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      },
                      minWidth: "1200px",

                      "& th:first-of-type, & td:first-of-type": {
                        minWidth: "60px", // checkbox column
                      },

                      // Default width for most columns
                      "& th, & td": {
                        minWidth: "80px",
                        whiteSpace: "nowrap",
                      },

                      //  Custom widths for columns 3, 8, 9, and 12
                      "& th:nth-of-type(3), & td:nth-of-type(3), \
                      & th:nth-of-type(8), & td:nth-of-type(8), \
                      & th:nth-of-type(9), & td:nth-of-type(9), \
                      & th:nth-of-type(12), & td:nth-of-type(12)": {
                        minWidth: "160px",
                      },
                    }}
                  >

                    <TableCell padding="checkbox">
                      <Checkbox
                        sx={{
                          color: "white",
                          "&.Mui-checked": { color: "white" },
                        }}
                        indeterminate={selected.length > 0 && selected.length < data.length}
                        checked={data.length > 0 && selected.length === data.length}
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>

                    {attributes.map((attr) => (
                      <TableCell key={attr._id}>{attr.label}</TableCell>
                    ))}

                    <TableCell>Action</TableCell>
                    {tableType === "Stock" && <TableCell>Add New Stock</TableCell>}

                  </TableRow>
                </TableHead>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={attributes.length + 2} align="center" sx={{ py: 8 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                          }}
                        >
                          <CircularProgress
                            size={45}
                            thickness={4}
                            sx={{ color: "var(--primary-color)" }}
                          />
                          <Typography
                            sx={{
                              color: "var(--secondary-color)",
                              fontSize: "15px",
                              fontWeight: 500,
                              letterSpacing: "0.5px",
                            }}
                          >
                            Loading {tableType}...
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    // No Data Found State
                    <TableRow>
                      <TableCell
                        colSpan={attributes.length + 2} // +2 for checkbox and Action columns
                        align="center"
                        sx={{ py: 3 }}
                      >
                        <Typography variant="body1" color="textSecondary">
                          No results found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((row) => {
                      const isItemSelected = isSelected(row._id);
                      return (
                        <TableRow key={row._id} selected={isItemSelected}>
                          {/* Checkbox column */}
                          <TableCell padding="checkbox">
                            <Checkbox
                              sx={{ color: "var(--primary-color)" }}
                              checked={isItemSelected}
                              onChange={() => {
                                setSelected((prev) =>
                                  isItemSelected
                                    ? prev.filter((id) => id !== row._id)
                                    : [...prev, row._id]
                                );
                              }}
                            />
                          </TableCell>

                          {/* Dynamic columns */}
                          {attributes.map((attr) => (
                            <TableCell
                              key={attr.id}
                              sx={{ color: "var(--black-color)", minWidth: "110px" }}
                            >
                              {attr.id === "createdAt" ||
                                attr.id === "publishedDate" ||
                                attr.id === "assignDate" ||
                                attr.id === "resolvedDate" ||
                                attr.id === "reportedDate" ||
                                attr.id === "expiryDate" ||
                                attr.id === "currentDate" ||
                                attr.id === "warrantyDate" ? (
                                formatDate(row[attr.id])
                              ) : attr.id === "published" ? (
                                <span
                                  style={{
                                    color: row[attr.id]
                                      ? "var(--success-color)"
                                      : "var(--warning-color)",
                                    background: row[attr.id]
                                      ? "var(--success-bgcolor)"
                                      : "var(--warning-bgcolor)",
                                    padding: "5px 10px",
                                    borderRadius: "var(--border-radius-secondary)",
                                  }}
                                >
                                  {row[attr.id] ? "Public" : "Private"}
                                </span>
                              ) : attr.id === "status" ? (
                                (() => {
                                  let bgColor = "#ffffff";
                                  let textColor = "#000000";
                                  let value = row[attr.id];
                                  if (value === true) value = "Active";
                                  if (value === false) value = "Inactive";

                                  switch (value) {
                                    case "Pending":
                                    case "Assigned":
                                      bgColor = "#cce5ff";
                                      textColor = "#004085";
                                      break;
                                    case "In Progress":
                                    case "Delay":
                                      bgColor = "#fff3cd";
                                      textColor = "#856404";
                                      break;
                                    case "Returned":
                                    case "Resolved":
                                    case "Active":
                                      bgColor = "#d4edda";
                                      textColor = "#155724";
                                      break;
                                    case "Damaged":
                                    case "Expired":
                                    case "Inactive":
                                      bgColor = "#f8d7da";
                                      textColor = "#721c24";
                                      break;
                                    default:
                                      bgColor = "#e2e3e5";
                                      textColor = "#383d41";
                                  }

                                  return (
                                    <span
                                      style={{
                                        color: textColor,
                                        background: bgColor,
                                        padding: "5px 10px",
                                        borderRadius: "var(--border-radius-secondary)",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {value}
                                    </span>
                                  );
                                })()
                              ) : row[attr.id] === 0 ? (
                                0
                              ) : typeof getNestedValue(row, attr.id) === "string" ? (
                                truncateText(getNestedValue(row, attr.id), 30)
                              ) : (
                                getNestedValue(row, attr.id)
                              )}
                            </TableCell>
                          ))}

                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleviewClick(row)}
                              sx={{
                                textTransform: "none",
                                borderColor: "var(--primary-color)",
                                color: "var(--primary-color)",
                                "&:hover": {
                                  backgroundColor: "var(--primary-color)",
                                  color: "#fff",
                                },
                              }}
                            >
                              View
                            </Button>
                          </TableCell>

                          {tableType === "Stock" && (
                            <TableCell>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleAddNew(row)}
                                sx={{
                                  textTransform: "none",
                                  background: "var(--primary-color)",
                                  color: "#fff",
                                  "&:hover": {
                                    background: "var(--secondary-color)",
                                  },
                                }}
                              >
                                Add Stock
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>

              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalRecords} //  Correct count from API
              rowsPerPage={rowsPerPage}
              page={page - 1} //  Convert to 0-based index for Material-UI
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Box>
      </>
    ),
  };
};

