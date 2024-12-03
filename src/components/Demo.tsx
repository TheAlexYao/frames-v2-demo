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
import { supabase } from "~/lib/supabase";

type VoteStats = {
  BRETT: number;
  POPCAT: number;
};

type Vote = {
  id?: string;
  choice: 'BRETT' | 'POPCAT';
  wallet_address?: string;
  fid: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  created_at?: string;
};

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

export default function Demo({ title = "$POPCAT vs $BRETT" }: DemoProps) {
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

  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [voteStats, setVoteStats] = useState<VoteStats>({ BRETT: 0, POPCAT: 0 });
  const [isVoting, setIsVoting] = useState(false);

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

  useEffect(() => {
    const fetchVotes = async () => {
      const { data: votes } = await supabase
        .from('votes')
        .select('choice')
        .throwOnError();
      
      const stats = votes?.reduce((acc, vote) => {
        acc[vote.choice as keyof VoteStats]++;
        return acc;
      }, { BRETT: 0, POPCAT: 0 } as VoteStats);
      
      setVoteStats(stats || { BRETT: 0, POPCAT: 0 });
    };

    fetchVotes();

    const subscription = supabase
      .channel('votes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, 
        () => fetchVotes())
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signBrett = useCallback(async () => {
    if (isVoting) return;
    setIsVoting(true);
    
    try {
      const context = await sdk.context;
      const fid = context?.user?.fid;
      
      if (fid) {
        const { data: existingVote } = await supabase
          .from('votes')
          .select()
          .eq('fid', fid)
          .single();
          
        if (existingVote) {
          alert('You have already voted!');
          return;
        }
      }

      const message = "I voted for $BRETT to outperform $POPCAT.\nParticipate in Meme vs Meme to earn rewards at https://memevsmeme.fun";
      
      signMessage(
        { message },
        {
          onSuccess: async () => {
            const { data: vote } = await supabase
              .from('votes')
              .insert({
                choice: 'BRETT',
                wallet_address: address || '',
                fid: context?.user?.fid,
                username: context?.user?.username,
                display_name: context?.user?.displayName,
                pfp_url: context?.user?.pfpUrl,
              } satisfies Omit<Vote, 'id' | 'created_at'>)
              .select()
              .single();
              
            setUserVote(vote);
            const encodedText = encodeURIComponent(message);
            sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodedText}`);
          },
        }
      );
    } finally {
      setIsVoting(false);
    }
  }, [signMessage, address, isVoting]);

  const signPopcat = useCallback(async () => {
    if (isVoting) return;
    setIsVoting(true);
    
    try {
      const context = await sdk.context;
      const fid = context?.user?.fid;
      
      if (fid) {
        const { data: existingVote } = await supabase
          .from('votes')
          .select()
          .eq('fid', fid)
          .single();
          
        if (existingVote) {
          alert('You have already voted!');
          return;
        }
      }

      const message = "I voted for $POPCAT to outperform $BRETT. Participate in Meme vs Meme to earn rewards at https://memevsmeme.fun";
      
      signMessage(
        { message },
        {
          onSuccess: async () => {
            const { data: vote } = await supabase
              .from('votes')
              .insert({
                choice: 'POPCAT',
                wallet_address: address || '',
                fid: context?.user?.fid,
                username: context?.user?.username,
                display_name: context?.user?.displayName,
                pfp_url: context?.user?.pfpUrl,
              } satisfies Omit<Vote, 'id' | 'created_at'>)
              .select()
              .single();
              
            setUserVote(vote);
            const encodedText = encodeURIComponent(message);
            sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodedText}`);
          },
        }
      );
    } finally {
      setIsVoting(false);
    }
  }, [signMessage, address, isVoting]);

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
        
        {isConnected && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div 
                className="bg-purple-600 h-2.5 rounded-full transition-all"
                style={{ 
                  width: `${voteStats.POPCAT + voteStats.BRETT === 0 ? 50 : 
                    (voteStats.POPCAT / (voteStats.POPCAT + voteStats.BRETT)) * 100}%` 
                }}
              />
            </div>
            
            <div className="flex justify-between text-sm mb-2">
              <span>POPCAT: {voteStats.POPCAT}</span>
              <span>BRETT: {voteStats.BRETT}</span>
            </div>
          </>
        )}

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cast your vote for the next meme to moon!
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
          Sign a message with your wallet and share your vote on Warpcast to participate
        </p>
      </div>

      <div className="w-full flex flex-col items-center">
        {!isConnected && (
          <div className="w-full">
            <Button
              onClick={() => connect({ connector: config.connectors[0] })}
              className="w-full"
            >
              Connect
            </Button>
          </div>
        )}

        {isConnected && (
          <div className="w-full space-y-4">
            <div>
              <Button
                onClick={signPopcat}
                disabled={!isConnected || isSignPending || isVoting || userVote !== null}
                isLoading={isSignPending || isVoting}
                className={`w-full ${userVote?.choice === 'POPCAT' ? 'bg-green-500' : ''}`}
              >
                {userVote?.choice === 'POPCAT' ? '✓ Voted $POPCAT' : 'Vote $POPCAT'}
              </Button>
              {isSignError && renderError(signError)}
            </div>
            
            <div>
              <Button
                onClick={signBrett}
                disabled={!isConnected || isSignPending || isVoting || userVote !== null}
                isLoading={isSignPending || isVoting}
                className={`w-full ${userVote?.choice === 'BRETT' ? 'bg-green-500' : ''}`}
              >
                {userVote?.choice === 'BRETT' ? '✓ Voted $BRETT' : 'Vote $BRETT'}
              </Button>
              {isSignError && renderError(signError)}
            </div>

            <div className="mt-8 space-y-2">
              {address && (
                <div className="text-xs text-center">
                  Address: <pre className="inline">{truncateAddress(address)}</pre>
                </div>
              )}
              <Button
                onClick={() => disconnect()}
                className="w-full"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
