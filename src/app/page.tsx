import { Metadata } from "next";
import App from "./app";

const appUrl = process.env.NEXT_PUBLIC_URL;

const frame = {
  version: "next",
  imageUrl: `${appUrl}/meme.png`,
  button: {
    title: "Launch Frame",
    action: {
      type: "launch_frame",
      name: "Meme vs Meme",
      url: appUrl,
      splashImageUrl: `${appUrl}/meme.png`,
      splashBackgroundColor: "#f7f7f7",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "$POPCAT vs $BRETT",
    openGraph: {
      title: "$POPCAT vs $BRETT",
      description: "Cast your vote and participate to earn rewards!",
      images: [`${appUrl}/meme.png`],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
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
