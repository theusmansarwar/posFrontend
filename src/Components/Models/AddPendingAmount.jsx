import React, { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatDate } from "../../Utils/Formatedate";
import { updatePendingAmount } from "../../DAL/edit";
;

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

export default function AddPendingPayModal({
  open,
  setOpen,
  Modeldata,
  onResponse,
}) {
  const [payAmount, setPayAmount] = useState("");
  const [errors, setErrors] = useState({});

  if (!Modeldata) return null;

  const {
    billId,
    customerName,
    customerPhone,
    totalAmount,
    userPaidAmount,
    remainingAmount,
    createdAt,
  } = Modeldata;

  const handleClose = () => {
    setOpen(false);
    setPayAmount("");
    setErrors({});
  };

  const handleSubmit = async () => {
    setErrors({});

    if (!payAmount || Number(payAmount) <= 0) {
      setErrors({ payAmount: "Enter valid amount" });
      return;
    }

    const payload = { payAmount: Number(payAmount) };

    try {
      const response = await updatePendingAmount(billId, payload);

      if (response?.status == 200) {
        onResponse({
          messageType: "success",
          message: "Payment updated successfully",
        });

        handleClose();
      } else {
        onResponse({
          messageType: "error",
          message: response?.message || "Operation failed",
        });
      }
    } catch (err) {
      onResponse({
        messageType: "error",
        message: err.response?.data?.message || "Server error occurred",
      });
    }
  };

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
          Pending Payment - {billId}
        </Typography>

        {/* Bill Details */}
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Bill ID</TableCell>
                <TableCell>{billId}</TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                <TableCell>{formatDate(createdAt)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Customer</TableCell>
                <TableCell>{customerName}</TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                <TableCell>{customerPhone}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Total Amount</TableCell>
                <TableCell>{totalAmount}</TableCell>

                <TableCell sx={{ fontWeight: "bold" }}>Paid</TableCell>
                <TableCell>{userPaidAmount}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Remaining</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "red" }}>
                  {remainingAmount}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pay Amount */}
        <Typography
          variant="subtitle1"
          sx={{ mb: 1, fontWeight: "bold" }}
        >
          Pay Pending Amount
        </Typography>

        <TextField
          fullWidth
          type="number"
          label="Enter Pay Amount"
          value={payAmount}
          onChange={(e) => setPayAmount(e.target.value)}
          error={!!errors.payAmount}
          helperText={errors.payAmount}
        />

        {/* Buttons */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#B1B1B1" }}
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              background: "var(--horizontal-gradient)",
              color: "white",
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Submit
          </Button>
        </Box>

      </Box>
    </Modal>
  );
}
