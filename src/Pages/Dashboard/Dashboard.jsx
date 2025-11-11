import React, { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaUsers,
  FaWarehouse,
  FaBoxes,
  FaTools,
  FaUserShield,
  FaBuilding,
  FaRecycle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { GiCardboardBox } from "react-icons/gi";
import "./Dashboard.css";
import { fetchDashboard } from "../../DAL/fetch";
import Areachart from "../../Components/Areachart";
import Skeleton from "../Skeleton/Skeleton";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const getStats = async () => {
  
    try {
      const response = await fetchDashboard();
      console.log("DASHBOARD DATA IS ", response);
      setData(response);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      
    }
  };

  useEffect(() => {
    getStats();
  }, []);

 



  return (
    <>
      <h2 className="dashboard-text">Dashboard</h2>

      {/* ✅ Only Render When Data is Available */}
      {data ? (
        <>
          <div className="cards">
            {/* 1️⃣ Roles */}
            <div className="card0">
              <FaUserShield className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalRoles}</h3>
                <p>Total Roles</p>
              </div>
            </div>

            {/* 2️⃣ Users */}
            <div className="card2">
              <FaUsers className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>

            {/* 3️⃣ Suppliers */}
            <div className="card3">
              <FaBuilding className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalSuppliers}</h3>
                <p>Total Suppliers</p>
              </div>
            </div>

            {/* 4️⃣ Products */}
            <div className="card4">
              <GiCardboardBox className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalProducts}</h3>
                <p>Total Products</p>
              </div>
            </div>

            {/* 5️⃣ Stock Management */}
            <div className="card5">
              <FaWarehouse className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalStock}</h3>
                <p>Total Stock</p>
              </div>
            </div>

            {/* 6️⃣ Asset Assignment */}
            <div className="card0">
              <FaBoxes className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalAssets}</h3>
                <p>Total Assets</p>
              </div>
            </div>

            {/* 7️⃣ Maintenance */}
            <div className="card2">
              <FaTools className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalMaintenance}</h3>
                <p>Total Maintenance</p>
              </div>
            </div>

            {/* 8️⃣ Dead Products */}
            <div className="card4">
              <FaRecycle className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalDeadProducts}</h3>
                <p>Total Dead Products</p>
              </div>
            </div>

            {/* 9️⃣ Asset Location */}
            <div className="card5">
              <FaMapMarkerAlt className="card-icon" />
              <div className="card-lower-section">
                <h3>{data.totalAssetLocations}</h3>
                <p>Total Asset Locations</p>
              </div>
            </div>
          </div>

          {/* ✅ Chart Area */}
          <div className="charts-areas">
            <Areachart />
          </div>
        </>
      ): (
<Skeleton/>
      )}
    </>
  );
};

export default Dashboard;
