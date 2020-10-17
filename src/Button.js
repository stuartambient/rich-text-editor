import React from "react";

const Button = ({ active, className, onMouseDown, children, style }) => {
  return (
    <button
      className={className}
      active={`${active}` || null}
      onMouseDown={onMouseDown}
      style={{ opacity: active ? 1 : 0.5 }}
    >
      {children}
    </button>
  );
};
export default Button;
