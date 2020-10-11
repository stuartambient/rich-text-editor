import React from "react";

const Button = ({ active, onMouseDown, children }) => {
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
