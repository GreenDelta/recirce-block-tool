import { Material } from "./model";

export async function getNextId(): Promise<string> {
  const r = await fetch("/api/next-id");
  return r.text();
}

export async function getMaterials(): Promise<Material[]> {
  const r = await fetch("/api/materials");
  return r.json();
}
