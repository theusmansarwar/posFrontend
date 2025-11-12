import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { MdOutlineDoubleArrow } from "react-icons/md";
import { IoIosReturnLeft } from "react-icons/io";

import { FaMoneyBillWave } from "react-icons/fa";

import { IoLogOut } from "react-icons/io5";
import {
  FaTachometerAlt,
  FaUsers,
  FaWarehouse,
  FaUserShield,
} from "react-icons/fa";
import "./App.css";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Users from "./Pages/Users/Users";
import StockM from "./Pages/Stock M/StockM";
import Roles from "./Pages/Roles/Roles";
import logo from "./Assets/imslogo.png";
import POSBillingSystem from "./Components/POS/Pos"
import ReturnManagement from "./Components/POS/Return"
import { Tooltip } from "@mui/material";

const App = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeitems, setActiveitems] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  // ✅ All sidebar items
  const allItems = [
    { id: 1, name: "Dashboard", route: "/dashboard", icon: <FaTachometerAlt /> },
    { id: 2, name: "Roles", route: "/rolesData", icon: <FaUserShield /> },
    { id: 3, name: "Users", route: "/usersData", icon: <FaUsers /> },
    { id: 4, name: "Stock Management", route: "/stockData", icon: <FaWarehouse /> },
    {id: 5, name:"Billing" , route:"/billData" , icon: <FaMoneyBillWave />},
    {id: 6, name:"Returns" , route:"/ReturnData" , icon: <IoIosReturnLeft />}
  ];

  // ✅ Update active item when route changes
  useEffect(() => {
    const currentItem = allItems.find((item) => item.route === location.pathname);
    setActiveitems(currentItem?.id || null);
  }, [location.pathname]);

  const handleitemsClick = (item) => {
    setActiveitems(item.id);
    navigate(item.route);
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("lastRoute", location.pathname);
  }, [location.pathname]);

  return (
    <div className="App">
      {/* Sidebar */}
      <div className={`app-side-bar ${isOpen ? "" : "closed"}`}>
        <div className="opencloseicon" onClick={toggleMenu}>
          <MdOutlineDoubleArrow className={isOpen ? "rotated" : ""} />
        </div>

        <img src={logo} className="logo" alt="ims Logo" />

        <ul>
          {allItems.map((item) => {
            const listItem = (
              <li
                key={item.id}
                className={activeitems === item.id ? "selected-item" : "unselected"}
                onClick={() => handleitemsClick(item)}
              >
                {item.icon}
                {isOpen && <span>{item.name}</span>}
              </li>
            );

            return !isOpen ? (
              <Tooltip title={item.name} placement="right" key={item.id} arrow>
                {listItem}
              </Tooltip>
            ) : (
              listItem
            );
          })}

          {/* Logout item */}
          {!isOpen ? (
            <Tooltip title="Logout" placement="right" arrow>
              <li className="unselected" onClick={onLogout}>
                <IoLogOut />
                {isOpen && <span>Logout</span>}
              </li>
            </Tooltip>
          ) : (
            <li className="unselected" onClick={onLogout}>
              <IoLogOut />
              {isOpen && <span>Logout</span>}
            </li>
          )}
        </ul>
      </div>

      {/* Right Side Content / Routes */}
      <div className="app-right">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rolesData" element={<Roles />} />
          <Route path="/usersData" element={<Users />} />
          <Route path="/stockData" element={<StockM />} />
          <Route path="/billData" element={<POSBillingSystem />} />
          <Route path="/ReturnData" element={<ReturnManagement />} />
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
