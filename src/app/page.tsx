import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const frameMetadata = {
    version: "next",
    imageUrl: `${appUrl}/meme.png`,
    button: {
      label: "Vote Now",
      action: {
        type: "link",
        url: appUrl
      }
    }
  };

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
    other: {
      "fc:frame": JSON.stringify(frameMetadata),
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
