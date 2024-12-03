import { NextResponse } from "next/server";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjU4MSwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDZGMTY1QjZmZmFGM2FjZEYwOTc4YWUxNjI0NEVlRUZlNDBDMDkyYjIifQ",
      payload: "eyJkb21haW4iOiJ3d3cubWVtZXZzbWVtZS5mdW4ifQ",
      signature: "MHg4NzAwN2IxNjJhMjgxMDAyMmRkZDZhYzkzYTE4MTg5ZTEyOWMwODBkNDg0ZDBhZDc4NjhlODc3MjhkMmE0N2RkN2RlMmY4MGZjZDNjN2Y4ZDliYWRjMzJmZjhmODJkMjE1MGJlYTc4NDhkMzRlM2Q2ZTg4NDgzNjFjMjkwNDZjOTFi"
    },
    frame: {
      version: "0.0.0",
      name: "Meme vs Meme",
      homeUrl: appUrl,
      iconUrl: `${appUrl}/meme.png`,
      splashImageUrl: `${appUrl}/meme.png`,
      splashBackgroundColor: "#f7f7f7",
    }
  };

  return NextResponse.json(manifest);
}
