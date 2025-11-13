import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
} from "@mui/material";
import { createStockM } from "../../DAL/create";
import { updateStock } from "../../DAL/edit";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "70%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
};

export default function AddStock({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onResponse,
}) {
  const [productName, setProductName] = useState(Modeldata?.productName || "");
  const [supplier, setSupplier] = useState(Modeldata?.supplier || "");
  const [rackNo, setRackNo] = useState(Modeldata?.rackNo || "");
  const [quantity, setQuantity] = useState(Modeldata?.quantity || "");
  const [unitPrice, setUnitPrice] = useState(Modeldata?.unitPrice || "");
  const [salePrice, setSalePrice] = useState(Modeldata?.salePrice || "");
  const [totalPrice, setTotalPrice] = useState(Modeldata?.totalPrice || "");
  const [purchaseDate, setPurchaseDate] = useState(Modeldata?.createdAt || "");
  const [warranty, setWarranty] = useState(Modeldata?.warranty || "");
  const [id, setId] = useState(Modeldata?._id || "");
  const [errors, setErrors] = useState({});

  // Auto-calc total price
  useEffect(() => {
    if (quantity && unitPrice) {
      setTotalPrice(quantity * unitPrice);
    }
  }, [quantity, unitPrice]);

  // Populate data when editing
  useEffect(() => {
    if (Modeldata) {
      setProductName(Modeldata?.productName || "");
      setSupplier(Modeldata?.supplier || "");
      setRackNo(Modeldata?.rackNo || "");
      setQuantity(Modeldata?.quantity || "");
      setUnitPrice(Modeldata?.unitPrice || "");
      setSalePrice(Modeldata?.salePrice || "");
      setTotalPrice(Modeldata?.totalPrice || "");
      setPurchaseDate(
        Modeldata?.createdAt ? Modeldata.createdAt.split("T")[0] : ""
      );
      setWarranty(Modeldata?.warranty || "");
      setId(Modeldata?._id || "");
    }
  }, [Modeldata]);

  const handleClose = () => {
    setOpen(false);
    setErrors({});
  };

  // Handle Unit Price change and auto-calc Total
  const handleUnitPriceChange = (e) => {
    const value = e.target.value;
    setUnitPrice(value);

    if (!value || value === "") {
      setTotalPrice("");
      return;
    }

    if (quantity && value) {
      setTotalPrice(quantity * value);
    }
  };

  // Handle Total Price change and auto-calc Unit Price
  const handleTotalPriceChange = (e) => {
    const value = e.target.value;
    setTotalPrice(value);

    if (!value || value === "") {
      setUnitPrice("");
      return;
    }

    if (quantity && value) {
      setUnitPrice(value / quantity);
    }
  };

  // Handle Quantity change and auto-update totals accordingly
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);

    if (!value || value === "") {
      setTotalPrice("");
      setUnitPrice("");
      return;
    }

    if (unitPrice && value) {
      setTotalPrice(value * unitPrice);
    } else if (totalPrice && value) {
      setUnitPrice(totalPrice / value);
    }
  };


  // Submit form with validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    const newErrors = {};

    // Validate required fields
    if (!productName?.trim())
      newErrors.productName = "Product name is required";
    if (!quantity || quantity <= 0)
      newErrors.quantity = "Quantity must be greater than 0";
    if (!unitPrice || unitPrice <= 0)
      newErrors.unitPrice = "Unit price must be greater than 0";
    if (!salePrice || salePrice <= 0)
      newErrors.salePrice = "Sale price must be greater than 0";
    if (!totalPrice || totalPrice <= 0)
      newErrors.totalPrice = "Total price must be greater than 0";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const stockData = {
      productName,
      supplier,
      rackNo,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      salePrice: Number(salePrice),
      totalPrice: Number(totalPrice),
      purchaseDate,
      warranty,
    };

    try {
      let response;
      if (Modeltype === "Add") {
        response = await createStockM(stockData);
      } else {
        response = await updateStock(id, stockData);
      }

      if (response?.status === 201 || response?.status === 200) {
        const successMessage = Modeltype === "Add"
          ? "Stock added successfully"
          : "Stock updated successfully";

        onResponse({
          messageType: "success",
          message: response.message || successMessage
        });

        // Reset form only on Add
        if (Modeltype === "Add") {
          setProductName("");
          setSupplier("");
          setRackNo("");
          setQuantity("");
          setUnitPrice("");
          setSalePrice("");
          setTotalPrice("");
          setPurchaseDate("");
          setWarranty("");
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
          message: response?.message || "Operation failed"
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
          {Modeltype} Stock
        </Typography>

        {/* Product + Supplier */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            error={!!errors.productName}
            helperText={errors.productName}
          />

          <TextField
            fullWidth
            label="Supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            error={!!errors.supplier}
            helperText={errors.supplier}
          />
        </Box>



        {/* Purchase Date + Warranty */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            type="date"
            label="Purchase Date"
            InputLabelProps={{ shrink: true }}
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            error={!!errors.purchaseDate}
            helperText={errors.purchaseDate}
          />
          <TextField
            fullWidth
            label="Warranty"
            value={warranty}
            onChange={(e) => setWarranty(e.target.value)}
            error={!!errors.warranty}
            helperText={errors.warranty}
          />
        </Box>
        {/* Rack No + Quantity */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Rack No."
            value={rackNo}
            onChange={(e) => setRackNo(e.target.value)}
            error={!!errors.rackNo}
            helperText={errors.rackNo}
          />
          <TextField
            fullWidth
            type="number"
            label="Quantity"
            value={quantity}
            onChange={handleQuantityChange}
            inputProps={{ min: 1 }}
            error={!!errors.quantity}
            helperText={errors.quantity}
          />
        </Box>

        {/* Prices */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="Unit Price"
            value={unitPrice}
            onChange={handleUnitPriceChange}
            inputProps={{ min: 1 }}
            error={!!errors.unitPrice}
            helperText={errors.unitPrice}
          />
          <TextField
            fullWidth
            type="number"
            label="Sale Price"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            inputProps={{ min: 1 }}
            error={!!errors.salePrice}
            helperText={errors.salePrice}
          />
          <TextField
            fullWidth
            label="Total Price"
            value={totalPrice}
            onChange={handleTotalPriceChange}
            inputProps={{ min: 1 }}
            error={!!errors.totalPrice}
            helperText={errors.totalPrice}
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