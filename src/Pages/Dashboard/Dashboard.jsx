import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { PiExportLight } from "react-icons/pi";
import { FcSalesPerformance } from "react-icons/fc";
import { GiBorderedShield } from "react-icons/gi";
import { MdOutlineProductionQuantityLimits, MdOutlineSell } from "react-icons/md";
import { fetchDashboard } from '../../DAL/fetch';
import { exportPDF } from '../../Utils/ExportPdf';
import { Box, CircularProgress, Typography } from '@mui/material';


const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetchDashboard();
        setDashboardData(res);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    getDashboardData();
  }, []);

  if (loading) {
    return (
      <Box className="loading-dashboard">
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  if (!dashboardData) {
    return <p>No data available</p>;
  }


  // Map your API data into boxes
  const box1 = [
    {
      id: 1,
      icon: <MdOutlineSell />,
      Iconcolor: "#f9007cf9",
      title: "Today's Sales",
      value: `Rs.${dashboardData.sales.today}`,
      color: "#f9007c26"
    },
    {
      id: 2,
      icon: <GiBorderedShield />,
      Iconcolor: "#b2f900f9",
      title: "Yesterday's Sales",
      value: `Rs.${dashboardData.sales.yesterday}`,
      color: "#b2f90025"
    },
    {
      id: 3,
      icon: <MdOutlineProductionQuantityLimits />,
      Iconcolor: "#0008f9fb",
      title: "This Week Sales",
      value: `Rs.${dashboardData.sales.thisWeek}`,
      color: "#3200f923"
    },
    {
      id: 4,
      icon: <FcSalesPerformance />,
      Iconcolor: "#c700f9ff",
      title: "This Month Sales",
      value: `Rs.${dashboardData.sales.thisMonth}`,
      color: "#c700f928"
    },
    {
      id: 5,
      icon: <FcSalesPerformance />,
      Iconcolor: "#00c3f9ff",
      title: "Pending Amount",
      value: `Rs.${dashboardData.pendingAmount}`,
      color: "#00f5f91e"
    },
  ];

  const box2 = [
    {
      id: 1,
      icon: <MdOutlineSell />,
      Iconcolor: "#f9007cf9",
      title: "Total Products",
      value: dashboardData.products.totalProducts,
      color: "#f9007c26"
    },
    {
      id: 2,
      icon: <GiBorderedShield />,
      Iconcolor: "#b2f900f9",
      title: "Products Sold Today",
      value: dashboardData.products.todaySold,
      color: "#b2f90025"
    },
    {
      id: 3,
      icon: <MdOutlineProductionQuantityLimits />,
      Iconcolor: "#0008f9fb",
      title: "Products Sold Yesterday",
      value: dashboardData.products.yesterdaySold,
      color: "#3200f923"
    },
    {
      id: 4,
      icon: <FcSalesPerformance />,
      Iconcolor: "#c700f9ff",
      title: "Products Sold This Week",
      value: dashboardData.products.thisWeekSold,
      color: "#c700f928"
    },
    {
      id: 5,
      icon: <FcSalesPerformance />,
      Iconcolor: "#00c3f9ff",
      title: "Products Sold This Month",
      value: dashboardData.products.thisMonthSold,
      color: "#00f5f91e"
    },
  ];

  const box3 = [
    {
      id: 1,
      icon: <MdOutlineSell />,
      Iconcolor: "#f9007cf9",
      title: "Today's Expense",
      value: `Rs.${dashboardData.expense.today}`,
      color: "#f9007c26"
    },
    {
      id: 2,
      icon: <GiBorderedShield />,
      Iconcolor: "#b2f900f9",
      title: "Yesterday's Expense",
      value: `Rs.${dashboardData.expense.yesterday}`,
      color: "#b2f90025"
    },
    {
      id: 3,
      icon: <MdOutlineProductionQuantityLimits />,
      Iconcolor: "#0008f9fb",
      title: "This Week Expense",
      value: `Rs.${dashboardData.expense.thisWeek}`,
      color: "#3200f923"
    },
    {
      id: 4,
      icon: <FcSalesPerformance />,
      Iconcolor: "#c700f9ff",
      title: "This Month Expense",
      value: `Rs.${dashboardData.expense.thisMonth}`,
      color: "#c700f928"
    },
    {
      id: 5,
      icon: <FcSalesPerformance />,
      Iconcolor: "#00c3f9ff",
      title: "Last Month Expense",
      value: `Rs.${dashboardData.expense.lastMonth}`,
      color: "#00f5f91e"
    },
  ];

  const renderBoxes = (boxes) =>
    boxes.map(box => (
      <div key={box.id} className="box-item">
        <p className='icon' style={{ color: box.Iconcolor, backgroundColor: box.color }}>{box.icon}</p>
        <p className='value'>{box.value}</p>
        <p className='title' style={{ color: box.Iconcolor }}>{box.title}</p>
      </div>
    ));

  return (
    <>
      <div className="dashboard">
        <div className="box">
          <div className="heading-area">
            <h4 className="heading">Sales Overview</h4>
            <p className="export" onClick={() => exportPDF('Sales Overview', box1)}>
              <PiExportLight /> Export
            </p>
          </div>
          <p className="subheading">Sales Summary</p>
        </div>
        <div className="box-area">{renderBoxes(box1)}</div>
      </div>

      <div className="dashboard">
        <div className="box">
          <div className="heading-area">
            <h4 className="heading">Product Overview</h4>
            <p className="export" onClick={() => exportPDF('Product Overview', box2)}>
              <PiExportLight /> Export
            </p>
          </div>
          <p className="subheading">Products Summary</p>
        </div>
        <div className="box-area">{renderBoxes(box2)}</div>
      </div>

      <div className="dashboard">
        <div className="box">
          <div className="heading-area">
            <h4 className="heading">Expense Overview</h4>
            <p className="export" onClick={() => exportPDF('Expense Overview', box3)}>
              <PiExportLight /> Export
            </p>
          </div>
          <p className="subheading">Expense Summary</p>
        </div>
        <div className="box-area">{renderBoxes(box3)}</div>
      </div>
    </>
  );
};

export default Dashboard;
