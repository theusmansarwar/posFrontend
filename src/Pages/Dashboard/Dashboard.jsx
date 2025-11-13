import React from 'react';
import './Dashboard.css';
import { PiExportLight } from "react-icons/pi";
import { FcSalesPerformance } from "react-icons/fc";
import { GiBorderedShield } from "react-icons/gi";
import { MdOutlineProductionQuantityLimits, MdOutlineSell } from "react-icons/md";


const Dashboard = () => {
  const box1 = [
    { 
        id: 1,
        icon: <MdOutlineSell />,
        Iconcolor: "#f9007cf9",
        title: "Total Sales",
        value: "$12,450",
        color: "#f9007c26"
    },
      { 
        id: 2,
        icon:<GiBorderedShield />,
        Iconcolor: "#b2f900f9",
        title: "Total Sales",
        value: "$12,450",
        color: "#b2f90025"
    },
      { 
        id: 3,
        icon: <MdOutlineProductionQuantityLimits />,
        Iconcolor: "#0008f9fb",
        title: "Total Sales",
        value: "$12,450",
        color: "#3200f923"
    },
      { 
        id: 4,
        icon:<FcSalesPerformance />,
        Iconcolor: "#c700f9ff",
        title: "Total Sales",
        value: "$12,450",
         color: "#c700f928"
    },
      { 
        id: 5,
        icon: <FcSalesPerformance />,
        Iconcolor: "#00c3f9ff",
        title: "Total Sales",
        value: "$12,450",
         color: "#00f5f91e"
    },

  ];
  const box2 = [
    { 
        id: 1,
        icon: <MdOutlineSell />,
        Iconcolor: "#f9007cf9",
        title: "Total Sales",
        value: "$12,450",
        color: "#f9007c26"
    },
      { 
        id: 2,
        icon:<GiBorderedShield />,
        Iconcolor: "#b2f900f9",
        title: "Total Sales",
        value: "$12,450",
        color: "#b2f90025"
    },
      { 
        id: 3,
        icon: <MdOutlineProductionQuantityLimits />,
        Iconcolor: "#0008f9fb",
        title: "Total Sales",
        value: "$12,450",
        color: "#3200f923"
    },
      { 
        id: 4,
        icon:<FcSalesPerformance />,
        Iconcolor: "#c700f9ff",
        title: "Total Sales",
        value: "$12,450",
         color: "#c700f928"
    },
      { 
        id: 5,
        icon: <FcSalesPerformance />,
        Iconcolor: "#00c3f9ff",
        title: "Total Sales",
        value: "$12,450",
         color: "#00f5f91e"
    },

  ];
  const box3 = [
    { 
        id: 1,
        icon: <MdOutlineSell />,
        Iconcolor: "#f9007cf9",
        title: "Total Sales",
        value: "$12,450",
        color: "#f9007c26"
    },
      { 
        id: 2,
        icon:<GiBorderedShield />,
        Iconcolor: "#b2f900f9",
        title: "Total Sales",
        value: "$12,450",
        color: "#b2f90025"
    },
      { 
        id: 3,
        icon: <MdOutlineProductionQuantityLimits />,
        Iconcolor: "#0008f9fb",
        title: "Total Sales",
        value: "$12,450",
        color: "#3200f923"
    },
      { 
        id: 4,
        icon:<FcSalesPerformance />,
        Iconcolor: "#c700f9ff",
        title: "Total Sales",
        value: "$12,450",
         color: "#c700f928"
    },
      { 
        id: 5,
        icon: <FcSalesPerformance />,
        Iconcolor: "#00c3f9ff",
        title: "Total Sales",
        value: "$12,450",
         color: "#00f5f91e"
    },

  ];

  return (
    <>
    <div className="dashboard">
      <div className="box">
        <div className="heading-area">
          <h4 className="heading">Today's Sales</h4>
          <p className="export"><PiExportLight /> Export</p>
        </div>
        <p className="subheading">Sales Summary</p>
      </div>
      <div className="box-area">
        {box1.map((box) => (
          <div
            key={box.id}
            className="box-item"

          >
            <p className='icon'  style={{ color: box.Iconcolor , backgroundColor:box.color}}>{box.icon}</p>
             <p className='value'>{box.value}</p>
            <p className='title' style={{ color: box.Iconcolor}}>{box.title}</p>
          
          </div>
        ))}
      </div>
    </div>
     <div className="dashboard">
      <div className="box">
        <div className="heading-area">
          <h4 className="heading">Today's Sales</h4>
          <p className="export"><PiExportLight /> Export</p>
        </div>
        <p className="subheading">Sales Summary</p>
      </div>
      <div className="box-area">
        {box2.map((box) => (
          <div
            key={box.id}
            className="box-item"

          >
            <p className='icon'  style={{ color: box.Iconcolor , backgroundColor:box.color}}>{box.icon}</p>
             <p className='value'>{box.value}</p>
            <p className='title' style={{ color: box.Iconcolor}}>{box.title}</p>
          
          </div>
        ))}
      </div>
    </div>
     <div className="dashboard">
      <div className="box">
        <div className="heading-area">
          <h4 className="heading">Today's Sales</h4>
          <p className="export"><PiExportLight /> Export</p>
        </div>
        <p className="subheading">Sales Summary</p>
      </div>
      <div className="box-area">
        {box3.map((box) => (
          <div
            key={box.id}
            className="box-item"

          >
            <p className='icon'  style={{ color: box.Iconcolor , backgroundColor:box.color}}>{box.icon}</p>
             <p className='value'>{box.value}</p>
            <p className='title' style={{ color: box.Iconcolor}}>{box.title}</p>
          
          </div>
        ))}
      </div>
    </div>
    </>
  );
};
export default Dashboard;
