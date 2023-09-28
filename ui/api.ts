import { Credentials, Material, Product, Scenario, User } from "./model";

export async function getMaterials(): Promise<Material[]> {
  const r = await fetch("/api/materials");
  const json = await r.json();
  return !json ? [] : json;
}

export async function putMaterial(m: Material): Promise<void> {
  const r = await fetch("/api/materials", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(m),
  });
  if (r.status !== 200) {
    const message = await r.text();
    throw new Error(`failed to put material: ${message}`);
  }
}

export async function getProcesses(): Promise<string[]> {
  const r = await fetch("/api/processes");
  const json = await r.json();
  return !json ? [] : json;
}

export async function getProducts(): Promise<Product[]> {
  const r = await fetch("/api/products");
  const json = await r.json();
  return !json ? [] : json;
}

export async function getProduct(id: string): Promise<Product> {
  const r = await fetch(`/api/products/${id}`);
  return r.json();
}

export async function putProduct(p: Product): Promise<void> {
  const r = await fetch("/api/products", {
    method: "PUT",
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

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/products/${id}`, {
    method: "DELETE",
  });

  if (response.status !== 200) {
    const message = await response.text();
    throw new Error(`Failed to delete product: ${message}`);
  }
}

export async function getScenarios(): Promise<Scenario[]> {
  const response = await fetch("/api/scenarios");
  const json = await response.json();
  return !json ? [] : json;
}

export async function getScenario(id: string): Promise<Scenario> {
  const response = await fetch(`/api/scenarios/${id}`);
  return response.json();
}

export async function putScenario(scenario: Scenario): Promise<void> {
  const response = await fetch("/api/scenarios", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scenario),
  });

  if (response.status !== 200) {
    const message = await response.text();
    throw new Error(`Failed to post scenario: ${message}`);
  }
}

export async function deleteScenario(id: string): Promise<void> {
  const response = await fetch(`/api/scenarios/${id}`, {
    method: "DELETE",
  });

  if (response.status !== 200) {
    const message = await response.text();
    throw new Error(`Failed to delete scenario: ${message}`);
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

export async function getCurrentUser(): Promise<User | null> {
  const r = await fetch("/api/users/current");
  return r.status === 200
    ? r.json()
    : null;
}
