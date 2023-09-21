import React from "react"

interface Props {
  tooltip?: string;
  onClick?: () => void;
}

export const AddIcon = (props: Props) => {
  return <Icon {...props}
    path={<path d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/>} />;
};

export const ExpandMoreIcon = (props: Props) => {
  return <Icon {...props}
    path={<path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" />} />;
};

export const ExpandLessIcon = (props: Props) => {
  return <Icon {...props}
    path={<path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />} />;
};

export const DeleteIcon = (props: Props) => {
  return (
    <Icon {...props}
      path={<path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />} />
  );
}

const Icon = ({ tooltip, onClick, path, color }: {
  tooltip?: string;
  onClick?: () => void;
  color?: string;
  path: JSX.Element;
}) => {
  const style: React.CSSProperties = {
    color: color || "#258529"
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
    {path}
  </svg>;
};
