import * as React from "react";
import { Link } from "react-router-dom";

export const MainMenu = () => {
  return (
    <nav style={{marginBottom: 30}}>
      <ul>
        <li><Link to="/"><img src="/logo.png"></img></Link></li>
        <li></li>
        <li><Link to="/ui/analyses">Analyses</Link></li>
        <li><Link to="/ui/products">Products</Link></li>
        <li><Link to="/ui/processes">Processes</Link></li>
        <li><Link to="/ui/emission-factors">Emission factors</Link></li>
      </ul>
      <ul>
        <li><Link to="/ui/login">Login</Link></li>
      </ul>
    </nav>
  );
};
