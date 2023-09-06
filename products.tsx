import * as React from "react";
import { Link } from "react-router-dom";
import { MainMenu } from "./ui/menu";

export const ProductsOverview = () => {

  return <>
    <MainMenu />
    <nav aria-label="breadcrumb">
      <ul>
        <li><Link to="/products">Products</Link></li>
      </ul>
    </nav>
    <p>
      There are currently no products available. You can{" "}
      <Link to="/products/create">create</Link> a new product or{" "}
      <Link to="/products/upload">upload</Link> a digital product
      pass.
    </p>
  </>;

};

export const ProductEditor = () => {
  return <>
    <MainMenu />
    <nav aria-label="breadcrumb">
      <ul>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/products/create">New product</Link></li>
      </ul>
    </nav>

    <p>
      Please define the product composition below.
    </p>

    <article>
      <header style={{ padding: "15px" }}>
        <div className="grid">
          <label>
            Product
            <input type="text" />
          </label>
          <label>
            Mass [kg]
            <input type="number" />
          </label>
        </div>

      </header>
      <article>
        <header style={{ padding: "15px" }}>
          <label>
            Component
            <input type="text" />
          </label>
        </header>
      </article>
      <a href="#">+ Add a component</a>
    </article>

  </>;

}
