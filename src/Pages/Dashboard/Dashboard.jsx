"use client";

import React, { useEffect, useState } from "react";
import { Download, TrendingUp, Package, DollarSign } from "lucide-react";
import "./Dashboard.css";
import { fetchDashboard } from "../../DAL/fetch";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatPKR = (num) => {
    return num?.toLocaleString("en-PK", { style: "currency", currency: "PKR" });
  };

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetchDashboard(); 

        if (res) {
          setDashboardData(res);
        } else {
          setDashboardData(null);
        }
      } catch (err) {
        console.error("❌ Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    getDashboardData();
  }, []);

  if (loading)
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );

  if (!dashboardData)
    return <p className="dashboard-loading">No data available</p>;

  return (
    <main className="dashboard-container">
      <div className="dashboard-wrapper">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Business performance overview.</p>
          </div>

          <button className="export-button">
            <Download size={18} />
            Export Report
          </button>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards-grid">
          <div className="dashboard-card card-blue">
            <div className="card-header">
              <Package size={24} />
              <span>Total Products</span>
            </div>
            <div className="card-value">
              {dashboardData.products.totalProducts.quantity}
            </div>
            <div className="card-subvalue">
              {formatPKR(dashboardData.products.totalProducts.price)}
            </div>
          </div>

          <div className="dashboard-card card-emerald">
            <div className="card-header">
              <TrendingUp size={24} />
              <span>Total Sold</span>
            </div>
            <div className="card-value">
              {dashboardData.products.totalSold.quantity}
            </div>
            <div className="card-subvalue">
             Rs. {dashboardData.products.totalSold.sale}
            </div>
          </div>

          <div className="dashboard-card card-amber">
            <div className="card-header">
              <DollarSign size={24} />
              <span>Pending Amount</span>
            </div>
            <div className="card-value">
              {formatPKR(dashboardData.pendingAmount)}
            </div>
            <div className="card-subvalue">To be collected</div>
          </div>

          <div className="dashboard-card card-red">
            <div className="card-header">
              <TrendingUp size={24} />
              <span>Total Expense</span>
            </div>
            <div className="card-value">
              {formatPKR(dashboardData.expense.totalExpense)}
            </div>
          </div>
        </div>

        {/* Main Sections */}
        <div className="main-grid">

          {/* Product Overview */}
          <div className="section-products">
            <div className="section-header">
              <Package size={24} />
              <div>
                <h2>Products & Sales Overview</h2>
                <p>Track inventory and sales performance</p>
              </div>
            </div>

            <div className="metrics-grid">
              {[
                { label: "Today", data: dashboardData.products.today },
                { label: "Yesterday", data: dashboardData.products.yesterday },
                { label: "This Week", data: dashboardData.products.thisWeek },
                { label: "This Month", data: dashboardData.products.thisMonth },
              ].map((item) => (
                <div key={item.label} className="metric-card">
                  <div className="metric-label">{item.label}</div>
                  <div className="metric-value">{item.data.quantity}</div>
                  <div className="metric-subvalue">Rs. {item.data.sale}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses */}
          <div className="section-expenses">
            <div className="section-header">
              <DollarSign size={24} />
              <div>
                <h2>Expenses</h2>
                <p>Expense tracking</p>
              </div>
            </div>

            <div className="metrics-grid">
              {[
                { label: "Today", value: dashboardData.expense.today },
                { label: "Yesterday", value: dashboardData.expense.yesterday },
                { label: "This Week", value: dashboardData.expense.thisWeek },
                { label: "This Month", value: dashboardData.expense.thisMonth },
              ].map((item) => (
                <div key={item.label} className="metric-card">
                  <div className="metric-label">{item.label}</div>
                  <div className="metric-value">{formatPKR(item.value)}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Dashboard;
