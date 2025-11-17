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
  FaReceipt
} from "react-icons/fa";
import "./App.css";

import Dashboard from "./Pages/Dashboard/Dashboard";
import Users from "./Pages/Users/Users";
import StockM from "./Pages/Stock M/StockM";
import Roles from "./Pages/Roles/Roles";
import logo from "./Assets/IbrahimMotors.png";
import POSBillingSystem from "./Components/POS/Pos";
import ReturnManagement from "./Components/POS/Return";
import { Tooltip } from "@mui/material";
import ExpenseM from "./Pages/Expense/Expense";
import BillHistory from "./Pages/BillHistory/BillHistory";

const App = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeitems, setActiveitems] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [userModules, setUserModules] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  // ✅ All sidebar items (complete list)
  const allItems = [
    { id: 1, name: "Dashboard", route: "/dashboard", icon: <FaTachometerAlt />, module: "Dashboard" },
    { id: 2, name: "Roles", route: "/rolesData", icon: <FaUserShield />, module: "Roles" },
    { id: 3, name: "Users", route: "/usersData", icon: <FaUsers />, module: "Users" },
    { id: 4, name: "Stock Management", route: "/stockData", icon: <FaWarehouse />, module: "Stock Management" },
    { id: 5, name: "Expense", route: "/ExpenseData", icon: <FaReceipt />, module: "Expense" },
    { id: 6, name: "Billing", route: "/billData", icon: <FaMoneyBillWave />, module: "Billing" },
    { id: 7, name: "Returns", route: "/ReturnData", icon: <IoIosReturnLeft />, module: "Returns" },
    { id: 8, name: "Bill History", route: "/bill-history", icon: <FaReceipt />  , module: "Bill History" }
  ];

  // ✅ Get user modules from localStorage on component mount
  useEffect(() => {
    try {
      const userDataString = localStorage.getItem("userData");
      console.log("🔍 Raw userData from localStorage:", userDataString);

      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log("📌 Parsed User Data:", userData);
        console.log("📌 User Role:", userData?.role);

        // ✅ Try multiple possible locations for modules
        let modules = [];

        // Check different possible structures
        if (userData?.role?.Modules && Array.isArray(userData.role.Modules)) {
          modules = userData.role.Modules;
          console.log("✅ Found modules in role.Modules:", modules);
        } else if (userData?.role?.modules && Array.isArray(userData.role.modules)) {
          modules = userData.role.modules;
          console.log("✅ Found modules in role.modules (lowercase):", modules);
        } else if (userData?.Modules && Array.isArray(userData.Modules)) {
          modules = userData.Modules;
          console.log("✅ Found modules in userData.Modules:", modules);
        } else if (userData?.modules && Array.isArray(userData.modules)) {
          modules = userData.modules;
          console.log("✅ Found modules in userData.modules:", modules);
        } else {
          console.warn("⚠️ No modules found in userData structure");
          console.log("userData structure:", JSON.stringify(userData, null, 2));
        }

        console.log("📌 Final User Modules:", modules);
        setUserModules(modules);
      } else {
        console.warn("⚠️ No userData found in localStorage");
      }
    } catch (error) {
      console.error("❌ Error parsing user data:", error);
    }
  }, []);

  // ✅ Filter menu items based on user modules
  useEffect(() => {
    console.log("🔄 Filtering items. User modules:", userModules);

    if (userModules.length > 0) {
      const filtered = allItems.filter(item => {
        // Show item if user has access OR it's Bill History
        const hasModule = userModules.includes(item.module) || item.module === "Bill History";
        return hasModule;
      });


      console.log("📌 Filtered Items:", filtered.map(i => i.name));
      setFilteredItems(filtered);

      // ✅ If current route is not accessible, redirect to first available module
      const currentItem = filtered.find(item => item.route === location.pathname);
      if (!currentItem && filtered.length > 0 && location.pathname !== "/") {
        console.log("🔀 Redirecting to:", filtered[0].route);
        navigate(filtered[0].route);
      }
    } else {
      console.warn("⚠️ No modules found - showing all items (fallback)");
      setFilteredItems(allItems);
    }
  }, [userModules, location.pathname]);

  // ✅ Update active item when route changes
  useEffect(() => {
    if (filteredItems.length > 0) {
      const currentItem = filteredItems.find(item => item.route === location.pathname);

      if (currentItem) {
        setActiveitems(currentItem.id);
      } else {
        // If no active route found, select first allowed route (Dashboard)
        setActiveitems(filteredItems[0].id);
      }
    }
  }, [location.pathname, filteredItems]);


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

  // ✅ Check if user has access to current route
  const hasAccess = (route) => {
    // If no modules are set (empty array), allow access (fallback for admin or errors)
    if (userModules.length === 0) return true;

    const hasIt = filteredItems.some(item => item.route === route);
    console.log(`🔐 Access check for ${route}:`, hasIt);
    return hasIt;
  };

  return (
    <div className="App">
      {/* Sidebar */}
      <div className={`app-side-bar ${isOpen ? "" : "closed"}`}>
        <div className="opencloseicon" onClick={toggleMenu}>
          <MdOutlineDoubleArrow className={isOpen ? "rotated" : ""} />
        </div>

        <img src={logo} className="logo" alt="ims Logo" />

        <ul>
          {/* ✅ Show only filtered items based on user role */}
          {filteredItems.map((item) => {
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
          {/* ✅ Protected routes - only render if user has access */}
          <Route
            path="/dashboard"
            element={hasAccess("/dashboard") ? <Dashboard /> : <Navigate to={filteredItems[0]?.route || "/dashboard"} replace />}
          />
          <Route
            path="/rolesData"
            element={hasAccess("/rolesData") ? <Roles /> : <Navigate to={filteredItems[0]?.route || "/dashboard"} replace />}
          />
          <Route
            path="/usersData"
            element={hasAccess("/usersData") ? <Users /> : <Navigate to={filteredItems[0]?.route || "/dashboard"} replace />}
          />
          <Route
            path="/stockData"
            element={hasAccess("/stockData") ? <StockM /> : <Navigate to={filteredItems[0]?.route || "/dashboard"} replace />}
          />
          <Route
            path="/billData"
            element={hasAccess("/billData") ? <POSBillingSystem /> : <Navigate to={filteredItems[0]?.route || "/dashboard"} replace />}
          />
          <Route
            path="/ReturnData"
            element={hasAccess("/ReturnData") ? <ReturnManagement /> : <Navigate to={filteredItems[0]?.route || "/dashboard"} replace />}
          />
          <Route
            path="/ExpenseData"
            element={hasAccess("/ExpenseData") ? <ExpenseM /> : <Navigate to={filteredItems[0]?.route || "/dashboard"} replace />}
          />
          <Route
            path="/bill-history"
            element={hasAccess("/bill-history") ? <BillHistory /> : <Navigate to={filteredItems[0]?.route || "/dashboard"} replace />}
          />

          {/* ✅ Default redirect to first available module */}
          <Route
            path="*"
            element={
              <Navigate
                to={filteredItems.length > 0 ? filteredItems[0].route : "/dashboard"}
                replace
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;