import { useEffect, useCallback, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import {
  useAccount,
  useSignMessage,
  useDisconnect,
  useConnect,
} from "wagmi";

import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";

export default function Demo(
  { title }: { title?: string } = { title: "Frames v2 Demo" }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  const { address, isConnected } = useAccount();
  const {
    signMessage,
    error: signError,
    isError: isSignError,
    isPending: isSignPending,
  } = useSignMessage();

  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  useEffect(() => {
    const load = async () => {
      await sdk.context;
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  const signBrett = useCallback(() => {
    const message = "I voted for $BRETT to outperform $POPCAT. Participate in Meme vs Meme to earn rewards at https://memevsmeme.fun";
    signMessage(
      { message },
      {
        onSuccess: () => {
          const encodedText = encodeURIComponent(message);
          sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodedText}`);
        },
      }
    );
  }, [signMessage]);

  const signPopcat = useCallback(() => {
    const message = "I voted for $POPCAT to outperform $BRETT. Participate in Meme vs Meme to earn rewards at https://memevsmeme.fun";
    signMessage(
      { message },
      {
        onSuccess: () => {
          const encodedText = encodeURIComponent(message);
          sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodedText}`);
        },
      }
    );
  }, [signMessage]);

  const renderError = (error: Error | null) => {
    if (!error) return null;
    return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
  };

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>

      <div>
        {address && (
          <div className="my-2 text-xs">
            Address: <pre className="inline">{truncateAddress(address)}</pre>
          </div>
        )}

        <div className="mb-4">
          <Button
            onClick={() =>
              isConnected
                ? disconnect()
                : connect({ connector: config.connectors[0] })
            }
          >
            {isConnected ? "Disconnect" : "Connect"}
          </Button>
        </div>

        {isConnected && (
          <>
            <div className="mb-4">
              <Button
                onClick={signBrett}
                disabled={!isConnected || isSignPending}
                isLoading={isSignPending}
              >
                Vote $BRETT
              </Button>
              {isSignError && renderError(signError)}
            </div>
            <div className="mb-4">
              <Button
                onClick={signPopcat}
                disabled={!isConnected || isSignPending}
                isLoading={isSignPending}
              >
                Vote $POPCAT
              </Button>
              {isSignError && renderError(signError)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
