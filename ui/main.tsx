import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { HomePanel } from "./home";

const App = () => {
  const nav =
    <nav>
      <ul>
        <li><a href="#"><img src="logo.png"></img></a></li>
        <li></li>
        <li><a href="#">Analyses</a></li>
        <li><a href="#">Products</a></li>
        <li><a href="#">Processes</a></li>
        <li><a href="#">Emission factors</a></li>
      </ul>
      <ul>
        <li><a href="#">Login</a></li>
      </ul>
    </nav>;
  return nav;
};

function main() {
  ReactDOM.render(<App />, document.getElementById("app"));
}
main();
