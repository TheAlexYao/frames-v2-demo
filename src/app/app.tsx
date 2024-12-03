"use client";

import Demo from "~/components/Demo";

interface AppProps {
  title?: string;
  description?: string;
}

export default function App({ title, description }: AppProps) {
  return <Demo title={title} description={description} />;
}
