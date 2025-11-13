import React from "react";
import { useTable } from "../../Components/Models/useTable";

const Roles = () => {
 
  const attributes = [
  
    { id: "name", label: "Role Name" },
    { id: "roleId", label: "Role Id" },
    { id: "description", label: "Description" },
    { id: "status", label: "Status" },
  ];

  const customRender = {
    modules: (value) => value.join(", "), 
  };

  const { tableUI } = useTable({
    attributes,
    tableType: "Roles",
    customRender,
  });

  return <div>{tableUI}</div>;
};

export default Roles;
