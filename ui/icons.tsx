import React from "react"

export const ExpandIcon = ({ tooltip, onClick }: {
  tooltip?: string;
  onClick?: () => void;
}) => {
  const style: React.CSSProperties = {
    color: "#258529"
  };
  if (onClick) {
    style.cursor = "pointer";
  }
  return <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 -960 960 960"
    width="24"
    onClick={onClick}
    style={style}>
    <title>{tooltip}</title>
    <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" />
  </svg>;
};
