import React from "react";
import { useTable } from "../../Components/Models/useTable";

const ExpenseM = () => {
   
  const attributes = [
    { id: "expenseId", label: "Expense Id" },
    { id: "expenseName", label: "Expense Name" },
    { id: "comment", label: "Comment" },
    { id: "amount", label: "Amount" },
    { id: "createdAt", label: "Created At" },
  ];

  const { tableUI } = useTable({
    attributes,
    tableType: "Expense",
  });

  return <div>{tableUI}</div>;
};

export default ExpenseM;
