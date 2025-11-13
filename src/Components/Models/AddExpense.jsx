import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
} from "@mui/material";
import { createExpense } from "../../DAL/create";
import { updateExpense } from "../../DAL/edit";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "60%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
};

export default function AddExpense({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onResponse,
}) {
  const [name, setname] = useState(Modeldata?.name || "");
  const [comment, setComment] = useState(Modeldata?.comment || "");
  const [amount, setAmount] = useState(Modeldata?.amount || "");
  const [createdAt, setCreatedAt] = useState(Modeldata?.createdAt || "");
  const [id, setId] = useState(Modeldata?._id || "");
  const [errors, setErrors] = useState({});

  // Populate fields when editing
  useEffect(() => {
    if (Modeldata) {
      setname(Modeldata?.name || "");
      setComment(Modeldata?.comment || "");
      setAmount(Modeldata?.amount || "");
      setCreatedAt(Modeldata?.createdAt ? Modeldata.createdAt.split("T")[0] : "");
      setId(Modeldata?._id || "");
    }
  }, [Modeldata]);

  const handleClose = () => {
    setOpen(false);
    setErrors({});
  };

  // Submit form with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};

    if (!name?.trim()) newErrors.name = "Expense name is required";
    if (!amount || amount <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!createdAt) newErrors.createdAt = "Date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const expenseData = {
      name,
      comment,
      amount: Number(amount),
      createdAt,
    };

    try {
      let response;
      if (Modeltype === "Add") {
        response = await createExpense(expenseData);
      } else {
        response = await updateExpense(id, expenseData);
      }

      if (response?.status === 201 || response?.status === 200) {
        const successMessage =
          Modeltype === "Add"
            ? "Expense added successfully"
            : "Expense updated successfully";

        onResponse({
          messageType: "success",
          message: response.message || successMessage,
        });

        if (Modeltype === "Add") {
          setname("");
          setComment("");
          setAmount("");
          setCreatedAt("");
        }

        setErrors({});
        setOpen(false);
      } else if (response?.status === 400 && response?.missingFields) {
        const fieldErrors = {};
        response.missingFields.forEach((f) => {
          fieldErrors[f.name] = f.message;
        });
        setErrors(fieldErrors);
      } else {
        onResponse({
          messageType: "error",
          message: response?.message || "Operation failed",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      onResponse({
        messageType: "error",
        message: err.response?.data?.message || "Server error occurred",
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          {Modeltype} Expense
        </Typography>

        {/* Expense Name + Amount */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Expense Name"
            value={name}
            onChange={(e) => setname(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            fullWidth
            type="number"
            label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 1 }}
            error={!!errors.amount}
            helperText={errors.amount}
          />
        </Box>

        {/* Comment */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            error={!!errors.comment}
            helperText={errors.comment}
          />
        </Box>

        {/* Date */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            type="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            error={!!errors.createdAt}
            helperText={errors.createdAt}
          />
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
          <Button
            type="button"
            variant="contained"
            sx={{
              backgroundColor: "#B1B1B1",
              textTransform: "none",
            }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            type="submit"
            variant="contained"
            sx={{
              background: "var(--horizontal-gradient)",
              color: "var(--white-color)",
              borderRadius: "var(--border-radius-secondary)",
              "&:hover": { background: "var(--vertical-gradient)" },
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
