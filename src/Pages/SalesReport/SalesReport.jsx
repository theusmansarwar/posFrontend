import React from "react";
import { useTable } from "../../Components/Models/useTable";

const SalesReport = () => {
 
   const attributes = [
    { id: "_id", label: "Product Id" },
    { id: "productName", label: "Product Name" },
    { id: "totalSold", label: "Total Sold" },
    { id: "lastSoldAt", label: "Last Sold Date" },
  ];

  const { tableUI } = useTable({
    attributes,
    tableType: "Sales Report", 
  });

  return <div>{tableUI}</div>;
};

export default SalesReport;