import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "../model";
import * as api from "../api";
import { ProgressPanel } from "../components";
import { AddIcon, DeleteIcon } from "../icons";

export const ProductsOverview = () => {

  const [isLoading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);
  if (!products) {
    return <ProgressPanel message="Loading products" />;
  }
  products.sort((p1, p2) => p1.name.localeCompare(p2.name));

  const onDelete = async (productId: string) => {
    setLoading(true); // Show loading indicator
    try {
      await api.deleteProduct(productId);
      const nextProducts = await api.getProducts();
      setProducts(nextProducts);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <ProgressPanel />;
  }

  return <>
    <p>
      <strong>Products</strong>
    </p>
    <ProductTable products={products} onDelete={onDelete}/>
  </>;
};

const ProductTable = ({ products, onDelete }: {
  products: Product[],
  onDelete: (productId: string) => void,
}) => {

  const navigate = useNavigate();

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
          <Link to={`/ui/products/edit/${product.id}`}>
            {product.name}
          </Link>
        </td>
        <td>
          <DeleteIcon
            onClick={() => onDelete(product.id)}
            tooltip="Delete this product" />
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
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        {rows}
        <tr>
          <td>
            <AddIcon tooltip="Create a new product"
              onClick={() => {
                navigate("/ui/products/edit");
              }} />
          </td>
          <td />
          <td />
        </tr>
      </tbody>
    </table>
  );
};
