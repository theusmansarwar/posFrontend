import * as React from "react";
import { Box, Modal, Typography, Table, TableBody, TableCell, TableContainer, TableRow, Paper, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatDate } from "../../Utils/Formatedate";  

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "60%",  
    maxHeight: "80vh",
    overflowY: "auto",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4, 
    borderRadius: "12px",
};

export default function SalesReportModal({ open, setOpen, Modeldata }) {
    const handleClose = () => setOpen(false);

    if (!Modeldata) return null;

    const { _id, productName, totalSold, lastSoldAt } = Modeldata;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                 
                <IconButton
                    onClick={handleClose}
                    sx={{ position: "absolute", top: 10, right: 10 }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h6" gutterBottom sx={{ color: "var(--primary-color)", fontWeight: "bold" }}>
                    Sales Summary
                </Typography>
 
                <TableContainer component={Paper} sx={{ mb: 2, boxShadow: "none", border: "1px solid #e0e0e0" }}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold", width: "30%", bgcolor: "#f5f5f5" }}>
                                    Product ID
                                </TableCell>
                                <TableCell>{_id}</TableCell>
                            </TableRow>
                            
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                                    Product Name
                                </TableCell>
                                <TableCell sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
                                    {productName}
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                                    Total Quantity Sold
                                </TableCell>
                                <TableCell>
                                    <span style={{ 
                                        backgroundColor: "var(--primary-color)", 
                                        color: "white", 
                                        padding: "4px 12px", 
                                        borderRadius: "12px",
                                        fontWeight: "bold"
                                    }}>
                                        {totalSold}
                                    </span>
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                                    Last Sold Date
                                </TableCell>
                                <TableCell>
                                    {formatDate(lastSoldAt)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Modal>
    );
}