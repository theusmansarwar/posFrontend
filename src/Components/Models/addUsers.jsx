import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  FormHelperText,
} from "@mui/material";

import { createUser } from "../../DAL/create";
import { updateUser } from "../../DAL/edit";
import { fetchallActiveroleslist } from "../../DAL/fetch";

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

export default function AddUsers({ open, setOpen, Modeldata, onResponse }) {
  const [id, setId] = React.useState(Modeldata?._id || "");
  const [name, setName] = React.useState(Modeldata?.name || "");
  const [email, setEmail] = React.useState(Modeldata?.email || "");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState(Modeldata?.role?._id || Modeldata?.role || "");
  const [status, setStatus] = React.useState(
    typeof Modeldata?.status === "boolean" ? Modeldata.status : true
  );

  const [rolesList, setRolesList] = React.useState([]);
  const [errors, setErrors] = React.useState({});

  // ✅ Fetch roles when modal opens
  React.useEffect(() => {
    setErrors("")
    if (open) {
      (async () => {
        try {
          const res = await fetchallActiveroleslist();
          if (res?.data) setRolesList(res.data);
        } catch (err) {
          console.error("Error fetching roles:", err);
        }
      })();
    }
  }, [open]);

  // ✅ Sync Modeldata for edit mode
  React.useEffect(() => {
    setId(Modeldata?._id || "");
    setName(Modeldata?.name || "");
    setEmail(Modeldata?.email || "");
    setRole(Modeldata?.role?._id || Modeldata?.role || "");
    setStatus(typeof Modeldata?.status === "boolean" ? Modeldata.status : true);
    setPassword("");
    setErrors({});
  }, [Modeldata]);

  const handleClose = () => setOpen(false);

  // ✅ Reset form
  const resetForm = () => {
    setId("");
    setName("");
    setEmail("");
    setPassword("");
    setRole("");
    setStatus(true);
    setErrors({});
  };

  // ✅ Email validation
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = {};
    if (!name.trim()) fieldErrors.name = "Name is required";
    if (!email.trim()) fieldErrors.email = "Email is required";
    else if (!validateEmail(email.trim())) fieldErrors.email = "Invalid email format";

    if (!id && !password.trim()) fieldErrors.password = "Password is required";
    if (!role) fieldErrors.role = "Role is required";
    if (status === "" || status === null) fieldErrors.status = "Status is required";

    // Stop if validation fails
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      onResponse({
        messageType: "error",
        message: "Please fix the highlighted fields",
      });
      return;
    }

    const userData = { name, email, role, status };
    if (!id) userData.password = password;

    try {
      let response;
      if (id) {
        response = await updateUser(id, userData);
      } else {
        response = await createUser(userData);
      }

      // ✅ Success case
      if (response?.status === 200 || response?.status === 201) {
        onResponse({
          messageType: "success",
          message:
            response.message ||
            (id ? "User updated successfully!" : "User created successfully!"),
          refresh: true, // 👈 triggers parent refresh
        });

        resetForm();
        handleClose();
        return;
      }

      // ✅ Specific duplicate email case
      let message = response?.message || "Something went wrong!";
      if (message.toLowerCase().includes("exists")) {
        setErrors({ email: "This email already exists" });
        message = "This email already exists";
      }

      onResponse({ messageType: "error", message });
    } catch (error) {
      console.error("❌ API Error:", error);
      let errMsg = error.message || "Server error occurred!";
      if (errMsg.toLowerCase().includes("exists")) {
        setErrors({ email: "This email already exists" });
        errMsg = "This email already exists";
      }
      onResponse({ messageType: "error", message: errMsg });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          {id ? "Update" : "Create"} User
        </Typography>

        {/* Name + Email */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
        </Box>

        {/* Password (only for create) */}
        {!id && (
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
            />
          </Box>
        )}

        {/* Role + Status */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <FormControl fullWidth error={!!errors.role}>
            <InputLabel id="role-select-label">Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Role"
            >
              {rolesList.map((r) => (
                <MenuItem key={r._id} value={r._id}>
                  {r.name}
                </MenuItem>
              ))}
            </Select>
            {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id="status-select-label">Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
            {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
          </FormControl>
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
          <Button
            type="button"
            variant="contained"
            sx={{ backgroundColor: "#B1B1B1" }}
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
            }}
          >
            {id ? "Update" : "Create"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
