import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaWarehouse,
  FaBoxes,
  FaTools,
  FaUserShield,
  FaBuilding,
  FaRecycle,
  FaMapMarkerAlt,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { GiCardboardBox } from "react-icons/gi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";
import { fetchDashboard } from "../../DAL/fetch";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample data for charts
  const salesTrendData = [
    { month: "Jan", sales: 4200, revenue: 3800, orders: 245 },
    { month: "Feb", sales: 3900, revenue: 4200, orders: 268 },
    { month: "Mar", sales: 5100, revenue: 4900, orders: 312 },
    { month: "Apr", sales: 4600, revenue: 5300, orders: 289 },
    { month: "May", sales: 6200, revenue: 5800, orders: 356 },
    { month: "Jun", sales: 5800, revenue: 6400, orders: 398 },
  ];

  const stockDistribution = [
    { name: "In Stock", value: 65, color: "#334eac" },
    { name: "Low Stock", value: 20, color: "#f59e0b" },
    { name: "Out of Stock", value: 10, color: "#ef4444" },
    { name: "Reserved", value: 5, color: "#8b5cf6" },
  ];

  const monthlyPerformance = [
    { category: "Products", current: 85, previous: 70 },
    { category: "Orders", current: 92, previous: 88 },
    { category: "Revenue", current: 78, previous: 82 },
    { category: "Users", current: 88, previous: 75 },
  ];

  const getStats = async () => {
    try {
      const response = await fetchDashboard();
      console.log("DASHBOARD DATA IS ", response);
      setData(response);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  const StatCard = ({ icon, title, value, growth, cardColor }) => (
    <div className={`stat-card-compact ${cardColor}`}>
      <div className="stat-icon-compact">
        {icon}
      </div>
      <div className="stat-info-compact">
        <p className="stat-label-compact">{title}</p>
        <h3 className="stat-number-compact">{value?.toLocaleString() || 0}</h3>
        {growth !== undefined && (
          <span className={`growth-compact ${growth >= 0 ? "positive" : "negative"}`}>
            {growth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(growth)}%
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-compact">
        <div className="dashboard-header-compact">
          <h1 className="page-title-compact">Dashboard</h1>
        </div>
        <div className="stats-grid-compact">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="skeleton-compact"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-compact">
      {/* Header */}
      <div className="dashboard-header-compact">
        <div>
          <h1 className="page-title-compact">Dashboard Overview</h1>
          <p className="page-subtitle-compact">Real-time business analytics and insights</p>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="stats-grid-compact">
        <StatCard
          icon={<FaUserShield />}
          title="Roles"
          value={data?.totalRoles}
          cardColor="card-purple"
        />
        <StatCard
          icon={<FaUsers />}
          title="Users"
          value={data?.totalUsers}
          growth={12.5}
          cardColor="card-blue"
        />
        <StatCard
          icon={<FaBuilding />}
          title="Suppliers"
          value={data?.totalSuppliers}
          cardColor="card-green"
        />
        <StatCard
          icon={<GiCardboardBox />}
          title="Products"
          value={data?.totalProducts}
          growth={8.3}
          cardColor="card-red"
        />
        <StatCard
          icon={<FaWarehouse />}
          title="Stock"
          value={data?.totalStock}
          growth={-3.2}
          cardColor="card-orange"
        />
        <StatCard
          icon={<FaBoxes />}
          title="Assets"
          value={data?.totalAssets}
          cardColor="card-pink"
        />
        <StatCard
          icon={<FaTools />}
          title="Maintenance"
          value={data?.totalMaintenance}
          cardColor="card-indigo"
        />
        <StatCard
          icon={<FaRecycle />}
          title="Dead Products"
          value={data?.totalDeadProducts}
          cardColor="card-rose"
        />
        <StatCard
          icon={<FaMapMarkerAlt />}
          title="Locations"
          value={data?.totalAssetLocations}
          cardColor="card-yellow"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Sales Trend - Large Chart */}
        <div className="chart-card-large">
          <div className="chart-header-compact">
            <div>
              <h3 className="chart-title-compact">Sales & Revenue Trend</h3>
              <p className="chart-desc-compact">Last 6 months performance comparison</p>
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#334eac" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#334eac" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: "12px" }} />
                <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#334eac" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Distribution Pie Chart */}
        <div className="chart-card-medium">
          <div className="chart-header-compact">
            <div>
              <h3 className="chart-title-compact">Stock Distribution</h3>
              <p className="chart-desc-compact">Current inventory status</p>
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stockDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Performance Bar Chart */}
        <div className="chart-card-medium">
          <div className="chart-header-compact">
            <div>
              <h3 className="chart-title-compact">Monthly Performance</h3>
              <p className="chart-desc-compact">Current vs Previous month</p>
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#64748b" style={{ fontSize: "12px" }} />
                <YAxis stroke="#64748b" style={{ fontSize: "12px" }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                />
                <Legend />
                <Bar dataKey="current" fill="#334eac" radius={[8, 8, 0, 0]} />
                <Bar dataKey="previous" fill="#94a3b8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;