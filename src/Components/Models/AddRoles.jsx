import * as React from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { createRole } from "../../DAL/create";
import { updateRole } from "../../DAL/edit";

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

export default function AddRoles({
  open,
  setOpen,
  Modeltype,
  Modeldata,
  onResponse,
}) {
  const [name, setName] = React.useState(Modeldata?.name || "");
  const [description, setDescription] = React.useState(
    Modeldata?.description || ""
  );
  const [modules, setModules] = React.useState(Modeldata?.Modules || []);
  const [status, setStatus] = React.useState(
    typeof Modeldata?.status === "boolean" ? Modeldata.status : true
  );

  const [errors, setErrors] = React.useState({});
  const [id, setId] = React.useState(Modeldata?._id || "");

  // <-- added "Reports" here
  const allModules = [
    "Dashboard",
    "Users",
    "Roles",
    "Stock Management",
    "Expense",
    "Billing",
    "Returns",
    "Bill History",
    "Reports",
    "Sales Report"
  ];

  React.useEffect(() => {
    setName(Modeldata?.name || "");
    setDescription(Modeldata?.description || "");
    setModules(Modeldata?.Modules || []);
    setStatus(typeof Modeldata?.status === "boolean" ? Modeldata.status : true);
    setId(Modeldata?._id || "");
  }, [Modeldata]);

  const handleClose = () => setOpen(false);

  const handleModuleChange = (module) => {
    setModules((prev) =>
      prev.includes(module)
        ? prev.filter((m) => m !== module)
        : [...prev, module]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const roleData = {
      name,
      description,
      modules,
      status,
    };
    try {
      console.log("🔹 Role Form Data:", roleData);

      let response;
      if (Modeltype === "Add") {
        response = await createRole(roleData);
      } else {
        response = await updateRole(id, roleData);
      }

      if (response?.status === 201 || response?.status === 200) {
        onResponse({ messageType: "success", message: response.message });

        setName("");
        setDescription("");
        setModules([]);
        setStatus(true);
        setId("");
        setErrors({});

        setOpen(false);
      } else if (response?.status === 400 && response?.missingFields) {
        const fieldErrors = {};
        response.missingFields.forEach((f) => {
          fieldErrors[f.name] = f.message;
        });
        setErrors(fieldErrors);
      } else {
        onResponse({ messageType: "error", message: response?.message });
      }
    } catch (err) {
      console.error("❌ Error:", err);
      onResponse({
        messageType: "error",
        message: err.response?.data?.message || "Server error",
      });
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" gutterBottom sx={{ textTransform: "none" }}>
          {Modeltype} Role
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Role Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
            />
          </Box>

          <Typography variant="subtitle1" mt={3}>
            Assign Modules:
          </Typography>
          <FormGroup row sx={{ display: "flex", flexWrap: "wrap" }}>
            {allModules.map((module) => (
              <FormControlLabel
                key={module}
                control={
                  <Checkbox
                    checked={modules.includes(module)}
                    onChange={() => handleModuleChange(module)}
                  />
                }
                label={module}
                sx={{ width: "45%" }}
              />
            ))}
          </FormGroup>

          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
              >
                {/* use boolean values */}
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
            {errors.modules && (
              <FormHelperText sx={{ color: "red" }}>
                {errors.modules}
              </FormHelperText>
            )}
          </Box>

          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: "var(--horizontal-gradient)",
                color: "white",
                "&:hover": { background: "var(--vertical-gradient)" },
                textTransform: "none",
              }}
            >
              {id ? "Update Role" : "Add Role"}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
