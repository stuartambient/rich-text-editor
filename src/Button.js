import React from "react";

const Button = ({ active, onMouseDown, children }) => {
  console.log("active: ", active);

  return (
    <button
      active={`${active}`}
      onMouseDown={onMouseDown}
      style={{ backgroundColor: active ? "red" : "gray" }}
    >
      {children}
    </button>
  );
};
export default Button;
