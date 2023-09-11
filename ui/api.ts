import { Material, Product } from "./model";

export async function getMaterials(): Promise<Material[]> {
  const r = await fetch("/api/materials");
  const json = await r.json();
  return !json ? [] : json;
}

export async function getProducts(): Promise<Product[]> {
  const r = await fetch("/api/products");
  const json = await r.json();
  return !json ? [] : json;
}

export async function getProduct(id: string): Promise<Product[]> {
  const r = await fetch(`/api/product/${id}`);
  return r.json();
}

export async function postProduct(p: Product): Promise<void> {
  const r = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(p),
  });
  if (r.status !== 200) {
    const message = await r.text();
    throw new Error(`failed to post product: ${message}`);
  }
}
