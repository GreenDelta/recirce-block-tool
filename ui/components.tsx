import React from "react";

export const ProgressPanel = (props: { message?: string }) => {
  const message = props.message ? props.message : "Loading...";
  return (
    <>
      <article>
        <p>{message}</p>
        <progress />
      </article>
    </>
  );
};

export const PanelLink = ({ onClick, label, sep }: {
  onClick: () => void;
  label: string;
  sep?: boolean;
}) => {
  const link = (
    <li className="re-panel-link">
      <a onClick={onClick} className="re-panel-link">
        {label}
      </a>
    </li>
  );
  return sep
    ? <>{link} <li className="re-panel-link">|</li></>
    : link;
};

export function numOf(
  e: React.ChangeEvent<HTMLInputElement>, f: (n: number) => void
) {
  const s = e?.target?.value;
  if (!s) {
    return;
  }
  try {
    const num = Number.parseFloat(s);
    f(num)
  } catch {
    // nothing
  }
}
