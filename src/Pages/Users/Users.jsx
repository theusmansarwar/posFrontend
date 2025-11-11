import React from 'react'
import { useTable } from '../../Components/Models/useTable'

const Users = () => {
//   const userData = [
//     {
//       _id: 1,
//       name: "Ali Khan",
//       email: "ali.khan@example.com",
//       password: "Ali@123",
//       role: "Admin",
//       status: "Active"
//     },
//     {
//       _id: 2,
//       name: "Sara Ahmed",
//       email: "sara.ahmed@example.com",
//       password: "Sara@123",
//       role: "Manager",
//       status: "Active"
//     },
//     {
//       _id: 3,
//       name: "Bilal Hussain",
//       email: "bilal.hussain@example.com",
//       password: "Bilal@123",
//       role: "Employee",
//       status: "Inactive"
//     },
//     {
//       _id: 4,
//       name: "Zain Ali",
//       email: "zain.ali@example.com",
//       password: "Zain@123",
//       role: "Employee",
//       status: "Active"
//     },
//     {
//       _id: 5,
//       name: "Fatima Noor",
//       email: "fatima.noor@example.com",
//       password: "Fatima@123",
//       role: "Manager",
//       status: "Active"
//     },
//     {
//       _id: 6,
//       name: "Omar Siddiqui",
//       email: "omar.siddiqui@example.com",
//       password: "Omar@123",
//       role: "Employee",
//       status: "Inactive"
//     },
//     {
//       _id: 7,
//       name: "Hira Malik",
//       email: "hira.malik@example.com",
//       password: "Hira@123",
//       role: "Employee",
//       status: "Active"
//     },
//     {
//       _id: 8,
//       name: "Ahmed Raza",
//       email: "ahmed.raza@example.com",
//       password: "Ahmed@123",
//       role: "Manager",
//       status: "Active"
//     },
//     {
//       _id: 9,
//       name: "Ayesha Khan",
//       email: "ayesha.khan@example.com",
//       password: "Ayesha@123",
//       role: "Employee",
//       status: "Inactive"
//     },
//     {
//       _id: 10,
//       name: "Usman Tariq",
//       email: "usman.tariq@example.com",
//       password: "Usman@123",
//       role: "Employee",
//       status: "Active"
//     }
//   ];

  const attributes = [
    // { id: "_id", label: "User Id" },
    { id: "name", label: "Name" },
     { id: "userId", label: "User Id" },
    { id: "email", label: "Email" },
    // { id: "password", label: "Password" },
    { id: "role.name", label: "Role" },
    { id: "status", label: "Status" },
  ];

  const { tableUI } = useTable({
    attributes,
    // pageData: userData,
    tableType: "Users"
  });

  return <div>{tableUI}</div>;
};

export default Users;
