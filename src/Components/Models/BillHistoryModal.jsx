import * as React from "react";
import { Box, Modal, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatDate } from "../../Utils/Formatedate";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxHeight: "80vh",
    overflowY: "auto",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: "12px",
};

export default function BillHistoryModal({ open, setOpen, Modeldata }) {
    const handleClose = () => setOpen(false);

    if (!Modeldata) return null;

    const { billId, createdAt, totalAmount, paymentMode, userPaidAmount, remainingAmount, status, staff, items } = Modeldata;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                {/* Close Button */}
                <IconButton
                    onClick={handleClose}
                    sx={{ position: "absolute", top: 10, right: 10 }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h6" gutterBottom>
                    Bill Details - {billId}
                </Typography>

                {/* Bill Info Table */}
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>Bill ID</TableCell>
                                <TableCell>{billId}</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Bill Generated At</TableCell>
                                <TableCell>{formatDate(createdAt)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>Total Amount</TableCell>
                                <TableCell>{totalAmount}</TableCell>

                                <TableCell sx={{ fontWeight: "bold" }}>Paid Amount</TableCell>
                                <TableCell>{userPaidAmount}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>Payment Mode</TableCell>
                                <TableCell>{paymentMode}</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                                <TableCell sx={{ color: status ? "green" : "red" }}>{status ? "Paid" : "Unpaid"}</TableCell>
                            </TableRow>
                            <TableRow>
                                
                                <TableCell sx={{ fontWeight: "bold" }}>Staff</TableCell>
                                <TableCell>{staff?.name}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Items Table */}
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                    Items
                </Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold" }}>Product Name</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Quantity</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Price</TableCell>
                                <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>{item.productName}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.salePrice}</TableCell>
                                    <TableCell>{item.total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Modal>
    );
}
