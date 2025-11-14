import React from "react";
import { useTable } from "../../Components/Models/useTable";

const BillHistory = () => {
  // Add all the fields you want to display
const attributes = [
  { id: "billId", label: "Bill Id" },
  { id: "createdAt", label: "Bill Generated At" },
  { id: "totalAmount", label: "Total Amount" },
  { id: "userPaidAmount", label: "Paid Amount" },
  { id: "paymentMode", label: "Payment Mode" },
  { id: "staff.name", label: "Cashier" },
];


  const { tableUI } = useTable({
    attributes,
    tableType: "Bill History",
  });

  return <div>{tableUI}</div>;
};

export default BillHistory;
