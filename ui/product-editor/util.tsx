import React from "react";

export const PanelLink = ({ onClick, label, sep }: {
  onClick: () => void;
  label: string;
  sep?: boolean;
}) => {
  const link = (
    <li>
      <a onClick={onClick} style={{ fontSize: "0.8em" }}>
        {label}
      </a>
    </li>
  );
  return sep
    ? <>{link} <li>|</li></>
    : link;
};
