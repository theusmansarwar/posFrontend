import React from 'react';
import './DashboardData.css';
import { PiExportLight } from "react-icons/pi";
import { FcSalesPerformance } from "react-icons/fc";
import { GiBorderedShield } from "react-icons/gi";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";


const DashboardData = () => {
  const boxes = [
    { 
        id: 1,
        icon: <FcSalesPerformance />,
        Iconcolor: "blue",
        title: "Total Sales",
        value: "$12,450",
        color: "#FFB6C1"
    },
      { 
        id: 2,
        icon:<GiBorderedShield />,
        Iconcolor: "orange",
        title: "Total Sales",
        value: "$12,450",
        color: "yellow"
    },
      { 
        id: 3,
        icon: <MdOutlineProductionQuantityLimits />,
        Iconcolor: "green",
        title: "Total Sales",
        value: "$12,450",
        color: "purple"
    },
      { 
        id: 4,
        icon:<FcSalesPerformance />,
        Iconcolor: "pink",
        title: "Total Sales",
        value: "$12,450",
        color: "red"
    },
      { 
        id: 5,
        icon: <FcSalesPerformance />,
        Iconcolor: "black",
        title: "Total Sales",
        value: "$12,450",
        color: "aqua"
    },

  ];

  return (
    <div className="dashboard0">
      {/* Header Section */}
      <div className="box">
        <div className="sale">
          <p className="sales">Today's Sales</p>
          <p className="export"><PiExportLight /> Export</p>
        </div>
        <p className="saleSummary">Sales Summary</p>
      </div>
      <div className="box1">
        {boxes.map((box) => (
          <div
            key={box.id}
            className="box-1"
            style={{ backgroundColor: box.color }}
          >
            <div className='boxData'>
            <p className='icon0'  style={{ backgroundColor: box.Iconcolor }}>{box.icon}</p>
             <p className='value'>{box.value}</p>
            <p className='title'>{box.title}</p>
          </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DashboardData;
