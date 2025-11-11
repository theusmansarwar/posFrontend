import React from "react";
import "./Skeleton.css";

 const Skeleton = () => {
  return (
    <div className="cards">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="card-skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-text">
            <div className="skeleton-line short"></div>
            <div className="skeleton-line long"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
