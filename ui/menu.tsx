import * as React from "react";
import { Link } from "react-router-dom";

export const MainMenu = (props: { disabled?: boolean }) => {
  if (props.disabled) {
    return <DisabledMenu />;
  }

  return (
    <nav style={{ marginBottom: 30 }}>
      <ul>
        <li>
          <Link to="/">
            <img src="/logo.png"></img>
          </Link>
        </li>
        <li></li>
        <li>
          <Link to="/ui/analyses">Analyses</Link>
        </li>
        <li>
          <Link to="/ui/products">Products</Link>
        </li>
        <li>
          <Link to="/ui/processes">Processes</Link>
        </li>
        <li>
          <Link to="/ui/materials">Materials</Link>
        </li>
        <li>
          <Link to="/ui/emission-factors">Emission factors</Link>
        </li>
      </ul>
      <ul>
        <li>
          <Link to="/ui/login">Login</Link>
        </li>
      </ul>
    </nav>
  );
};

const DisabledMenu = () => {
  return (
    <nav style={{ marginBottom: 30 }}>
      <ul>
        <li>
          <img src="/logo.png"></img>
        </li>
        <li></li>
        <li>Analyses</li>
        <li>Products</li>
        <li>Processes</li>
        <li>Emission factors</li>
      </ul>
      <ul>
        <li>Login</li>
      </ul>
    </nav>
  );
};
