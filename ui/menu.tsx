import * as React from "react";
import { Link } from "react-router-dom";

export const MainMenu = () => {
  const menu =
    <nav>
      <ul>
        <li><Link to="/"><img src="logo.png"></img></Link></li>
        <li></li>
        <li><Link to="/analyses">Analyses</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/processes">Processes</Link></li>
        <li><Link to="/emission-factors">Emission factors</Link></li>
      </ul>
      <ul>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>;
  return menu;
};
