import React from "react";
import { useTable } from "../../Components/Models/useTable";

const Roles = () => {
 
  const attributes = [
  
    { id: "name", label: "Role Name" },
    { id: "roleId", label: "Role Id" },
    { id: "description", label: "Description" },
    { id: "status", label: "Status" },
  ];

  // custom render for modules array
  const customRender = {
    modules: (value) => value.join(", "), // join modules array into string
  };

  const { tableUI } = useTable({
    attributes,
    // pageData: rolesData,
    tableType: "Roles",
    customRender,
  });

  return <div>{tableUI}</div>;
};

export default Roles;
