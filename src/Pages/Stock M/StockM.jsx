import React from "react";
import { useTable } from "../../Components/Models/useTable";

const StockM = () => {


  // Sirf required attributes
  const attributes = [
    { id: "productId", label: "Product Id" },
    { id: "productName", label: "Product Name" },
    { id: "quantity", label: "Quantity" },
    { id: "unitPrice", label: "Unit Price" },
    { id: "salePrice", label: "Sale Price" },
    { id: "totalPrice", label: "Total Price" },
    { id: "supplier", label: "Supplier" },
    { id: "purchaseDate", label: "Purchase Date" },
    { id: "warranty", label: "Warranty" },
  ];

  const { tableUI } = useTable({
    attributes,
    tableType: "Stock",
  });

  return <div>{tableUI}</div>;
};

export default StockM;
