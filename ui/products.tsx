import * as React from "react";
import { Link } from "react-router-dom";
import { MainMenu } from "./menu";

export const ProductsOverview = () => {
  return <>
    <MainMenu />
    <nav aria-label="breadcrumb">
      <ul>
        <li><Link to="/ui/products">Products</Link></li>
      </ul>
    </nav>
    <p>
      There are currently no products available. You can{" "}
      <Link to="/ui/products/create">create</Link> a new product or{" "}
      <Link to="/ui/products/upload">upload</Link> a digital product
      pass.
    </p>
  </>;
};
