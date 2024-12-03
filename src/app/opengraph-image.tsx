import { ImageResponse } from "next/og";

export const alt = "$POPCAT vs $BRETT - Meme vs Meme";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center items-center relative bg-gradient-to-r from-purple-500 to-blue-500">
        <div tw="absolute inset-0 bg-black/10" />
        <div tw="flex flex-col items-center text-white z-10">
          <div tw="text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-300 to-pink-500 text-transparent bg-clip-text">
            MEME vs MEME
          </div>
          <h1 tw="text-6xl font-bold mb-4">$POPCAT vs $BRETT</h1>
          <p tw="text-3xl mb-6">Which Meme Will Outperform? 🚀</p>
          <div tw="flex items-center gap-4 mt-4">
            <p tw="text-xl px-4 py-2 bg-white/10 rounded-full">Vote & Earn Rewards</p>
            <p tw="text-xl px-4 py-2 bg-white/10 rounded-full">Join Now! 🎁</p>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
