import React from "react";
import { useTable } from "../../Components/Models/useTable";

const PendingAmountPage = () => {
  // ✅ Dummy Data for Pending Amount Table
  // const data = [
  //   {
  //     id: 1,
  //     name: "Ali Khan",
  //     roleId: "CUST-001",
  //     description: "Customer outstanding payment",
  //     status: "Pending",
  //     pendingAmount: 15000,
  //   },
  //   {
  //     id: 2,
  //     name: "Sara Ahmed",
  //     roleId: "CUST-002",
  //     description: "Late payment for invoice #4521",
  //     status: "Pending",
  //     pendingAmount: 8200,
  //   },
  //   {
  //     id: 3,
  //     name: "Hamza Tariq",
  //     roleId: "CUST-003",
  //     description: "Remaining dues for subscription",
  //     status: "Overdue",
  //     pendingAmount: 23000,
  //   },
  //   {
  //     id: 4,
  //     name: "Fatima Noor",
  //     roleId: "CUST-004",
  //     description: "Balance amount for last month",
  //     status: "Pending",
  //     pendingAmount: 5600,
  //   },
  //   {
  //     id: 5,
  //     name: "Usman Malik",
  //     roleId: "CUST-005",
  //     description: "Unpaid Invoice #8762",
  //     status: "Overdue",
  //     pendingAmount: 12900,
  //   },
  // ];

  // ✅ Table Columns
  const attributes = [
    { id: "billId", label: "Bill Id" },
    { id: "customerName", label: "Customer Name" },
    {id: "customerPhone", label: "Customer Phone" },
     { id: "remainingAmount", label: "Remaining Amount" },
    { id: "totalAmount", label: "Total Amount" },
    { id: "userPaidAmount", label: "User Paid Amount" },
   
  ];

  // For custom formatting (optional)
  const customRender = {
    pendingAmount: (value) => `PKR ${value.toLocaleString()}`,
  };

  // Using the custom table hook
  const { tableUI } = useTable({
    attributes,
    tableType: "Pending Amount",
    customRender,
  });

  return <div>{tableUI}</div>;
};

export default PendingAmountPage;
