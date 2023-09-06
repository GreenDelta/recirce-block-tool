
export async function getNextId(): Promise<string> {
  var r = await fetch("/api/next-id");
  return r.text();
}
