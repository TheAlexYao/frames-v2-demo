import { useEffect, useCallback, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import Image from "next/image";
import {
  useAccount,
  useSignMessage,
  useDisconnect,
  useConnect,
} from "wagmi";

import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";

const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
};

interface DemoProps {
  title?: string;
  description?: string;
}

export default function Demo({ title = "$POPCAT vs $BRETT", description }: DemoProps) {
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

  // Set end date to December 6, 2024 6:00 PM IST (12:30 PM UTC)
  const endDate = new Date("2024-12-06T12:30:00Z");
  const timeLeft = useCountdown(endDate);

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
    <div className="flex flex-col items-center w-[300px] mx-auto py-4 px-2">
      <div className="mb-4">
        <Image
          src="/meme.png"
          alt={title}
          width={300}
          height={169}
          className="rounded-xl"
          priority
        />
      </div>

      <div className="text-center mb-6 space-y-2">
        <h2 className="text-xl font-bold">{title}</h2>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cast your vote for the next meme to moon! 🚀
        </p>
        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
          Participate to receive rewards! 🎁
        </p>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Time remaining:
          <div className="font-mono text-sm mt-1">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sign with your wallet and share on Warpcast to participate
        </p>
      </div>

      <div className="w-full flex flex-col items-center">
        {address && (
          <div className="my-2 text-xs">
            Address: <pre className="inline">{truncateAddress(address)}</pre>
          </div>
        )}

        <div className="w-full">
          <Button
            onClick={() =>
              isConnected
                ? disconnect()
                : connect({ connector: config.connectors[0] })
            }
            className="w-full"
          >
            {isConnected ? "Disconnect" : "Connect"}
          </Button>
        </div>

        {isConnected && (
          <div className="w-full space-y-4 mt-4">
            <div>
              <Button
                onClick={signPopcat}
                disabled={!isConnected || isSignPending}
                isLoading={isSignPending}
                className="w-full"
              >
                Vote $POPCAT
              </Button>
              {isSignError && renderError(signError)}
            </div>
            <div>
              <Button
                onClick={signBrett}
                disabled={!isConnected || isSignPending}
                isLoading={isSignPending}
                className="w-full"
              >
                Vote $BRETT
              </Button>
              {isSignError && renderError(signError)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
