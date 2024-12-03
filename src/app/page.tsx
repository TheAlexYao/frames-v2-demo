import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "vNext",
  image: {
    src: `${appUrl}/meme.png`,
    aspectRatio: "1.91:1"
  },
  buttons: [
    {
      label: "Vote $POPCAT",
      action: "post"
    },
    {
      label: "Vote $BRETT",
      action: "post"
    }
  ],
  postUrl: `${appUrl}/api/vote`
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "$POPCAT vs $BRETT - Meme vs Meme",
    description: "Vote for the next meme to moon and earn rewards! 🚀",
    openGraph: {
      title: "$POPCAT vs $BRETT - Which Meme Will Win?",
      description: "Vote for your favorite meme and participate to earn rewards! Join the ultimate meme showdown.",
      images: [{
        url: `${appUrl}/meme.png`,
        width: 1200,
        height: 630,
        alt: "$POPCAT vs $BRETT"
      }]
    },
    twitter: {
      card: "summary_large_image",
      title: "$POPCAT vs $BRETT - Which Meme Will Win?",
      description: "Vote for your favorite meme and participate to earn rewards! Join the ultimate meme showdown.",
      images: [`${appUrl}/meme.png`],
    },
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": `${appUrl}/meme.png`,
      "fc:frame:image:aspect_ratio": "1.91:1",
      "fc:frame:button:1": "Vote $POPCAT",
      "fc:frame:button:2": "Vote $BRETT",
      "fc:frame:post_url": `${appUrl}/api/vote`
    },
  };
}

export default function Home() {
  return (
    <App 
      title="$POPCAT vs $BRETT"
      description="Cast your vote and participate to earn rewards!"
    />
  );
}
