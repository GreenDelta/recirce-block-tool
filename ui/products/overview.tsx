import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, Product } from "../model";
import * as api from "../api";
import { ProgressPanel } from "../components";
import { AddIcon, CopyIcon, DeleteIcon } from "../icons";

export const ProductsOverview = () => {

  const [isLoading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = async () => {
    try {
      const ps = await api.getProducts();
      setProducts(ps);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    loadProducts();
  }, []);

  const onDelete = async (product: Product) => {
    setLoading(true);
    await api.deleteProduct(product.id);
    loadProducts();
  };

  const onCopy = async (product: Product) => {
    setLoading(true);
    const copy = Copy.ofProduct(product);
    copy.name = `${copy.name} - Copy`;
    await api.putProduct(copy);
    loadProducts();
  }

  if (isLoading) {
    return <ProgressPanel />;
  }

  products.sort((p1, p2) => p1.name.localeCompare(p2.name));
  return <>
    <p>
      <strong>Products</strong>
    </p>
    <ProductTable products={products} onCopy={onCopy} onDelete={onDelete} />
  </>;
};

const ProductTable = ({ products, onCopy, onDelete }: {
  products: Product[],
  onCopy: (product: Product) => void,
  onDelete: (product: Product) => void,
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
          <CopyIcon
            onClick={() => onCopy(product)}
            tooltip="Copy this product" />
          <DeleteIcon
            onClick={() => onDelete(product)}
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
