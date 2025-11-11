import React from "react";
import { useTable } from "../../Components/Models/useTable";

// Dummy products (dropdown ke liye)
// const productList = [
//   { id: 1, name: "Dell Laptop", warrantyExpiry: "2026-01-10" },
//   { id: 2, name: "HP Monitor", warrantyExpiry: "2025-02-15" },
//   { id: 3, name: "MS Office License", warrantyExpiry: "2025-03-05" },
// ];

// Dummy suppliers
// const suppliers = [
//   { id: 1, name: "Tech Supplier" },
//   { id: 2, name: "Digital Hub" },
//   { id: 3, name: "SoftMart" },
// ];

const StockM = () => {
  // const stockData = [
  //   {
  //     _id: 1,
  //     productId: 1,
  //     qty: 10,
  //     unitPrice: 1200,
  //     supplierId: 1,
  //     date: "2024-01-10",
  //   },
  //   {
  //     _id: 2,
  //     productId: 2,
  //     qty: 20,
  //     unitPrice: 250,
  //     supplierId: 2,
  //     date: "2024-02-15",
  //   },
  //   {
  //     _id: 3,
  //     productId: 3,
  //     qty: 50,
  //     unitPrice: 99,
  //     supplierId: 3,
  //     date: "2024-03-05",
  //   },
  // ];

  // Ids ko names me map karna + total/warranty add
  // const mappedData = stockData.map((item) => {
  //   const product = productList.find((p) => p.id === item.productId);
  //   const supplier = suppliers.find((s) => s.id === item.supplierId);

  //   return {
  //     ...item,
  //     productName: product ? product.name : "Unknown",
  //     supplierName: supplier ? supplier.name : "Unknown",
  //     totalPrice: item.qty * item.unitPrice,
  //     warrantyDate: product ? product.warrantyExpiry : "N/A",
  //   };
  // });

  // Sirf required attributes
  const attributes = [
    // { id: "_id", label: "Stock Id" },
    { id: "productName", label: "Product Name" },
    { id: "quantity", label: "Quantity" },
    { id: "unitPrice", label: "Unit Price" },
    { id: "totalPrice", label: "Total Price" },
    { id: "supplierName", label: "Supplier Name" },
    { id: "currentDate", label: "Current Date" },
    { id: "warrantyDate", label: "Warranty Date" },
  ];

  const { tableUI } = useTable({
    attributes,
    // pageData: mappedData,
    tableType: "Stock",
  });

  return <div>{tableUI}</div>;
};

export default StockM;
