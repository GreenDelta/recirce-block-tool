import { Credentials, Material, Product, User } from "./model";

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

export async function postLogin(credentials: Credentials): Promise<User> {
  const r = await fetch("/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  if (r.status !== 200) {
    const message = await r.text();
    throw new Error(`failed to login: ${message}`);
  }
  return r.json();
}

export async function postLogout(): Promise<void> {
  const r = await fetch("/api/users/logout", { method: "POST" });
  if (r.status !== 200) {
    const message = await r.text();
    throw new Error(`failed to login: ${message}`);
  }
}
