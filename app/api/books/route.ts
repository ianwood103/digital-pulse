export const revalidate = 3600;

import { fetchBooks } from "../../lib/books";

export async function GET() {
  const result = await fetchBooks();
  return Response.json(result);
}
