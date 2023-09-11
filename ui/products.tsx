import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MainMenu } from "./menu";
import { Product } from "./model";
import * as api from "./api";
import { ProgressPage } from "./progress";

export const ProductsOverview = () => {

  const [products, setProducts] = useState<Product[] | null>(null);
  useEffect(() => {
    api.getProducts().then(setProducts);
  }, []);
  if (!products) {
    return <ProgressPage message="Loading products" />;
  }
  products.sort((p1, p2) => p1.name.localeCompare(p2.name));

  return <>
    <MainMenu />
    <nav>
      <ul>
        <li><strong>Products</strong></li>
      </ul>
      <ul>
        <li><Link to="/ui/products/create">Create a new product</Link></li>
        <li>|</li>
        <li><Link to="/ui/products/upload">Upload a product pass</Link></li>
      </ul>
    </nav>
    <ProductTable products={products} />
  </>;
};

const ProductTable = ({ products }: { products: Product[] }) => {

  if (products.length === 0) {
    return <p>No products available yet.</p>;
  }
  const rows = [];
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    rows.push(
      <tr>
        <td>{i + 1}</td>
        <td>
          <Link to={`/ui/products/${product.id}`}>
            {product.name}
          </Link>
        </td>
      </tr>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Product</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );
};
