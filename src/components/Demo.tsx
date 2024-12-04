import { useEffect, useCallback, useState } from "react";
import sdk from "@farcaster/frame-sdk";
import Image from "next/image";
import { Button } from "~/components/ui/Button";
import { supabase } from "~/lib/supabase";

type VoteStats = {
  BRETT: number;
  POPCAT: number;
};

type Vote = {
  id?: string;
  choice: 'BRETT' | 'POPCAT';
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
  const [isInFrame, setIsInFrame] = useState(false);
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
      try {
        const { data: votes, error } = await supabase
          .from('votes')
          .select('choice')
          .throwOnError();
        
        if (error) {
          console.error('Error fetching votes:', error);
          return;
        }
        
        console.log('Raw votes:', votes);
        
        const stats = votes?.reduce((acc, vote) => {
          const choice = vote.choice as keyof VoteStats;
          if (choice === 'BRETT' || choice === 'POPCAT') {
            acc[choice]++;
          }
          return acc;
        }, { BRETT: 0, POPCAT: 0 } as VoteStats);
        
        console.log('Calculated stats:', stats);
        setVoteStats(stats || { BRETT: 0, POPCAT: 0 });
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };

    fetchVotes();

    const channel = supabase
      .channel('votes-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'votes'
        }, 
        () => {
          console.log('Vote change detected');
          fetchVotes();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUserVote = async () => {
      const context = await sdk.context;
      const fid = context?.user?.fid;
      
      if (fid) {
        const { data: existingVote } = await supabase
          .from('votes')
          .select()
          .eq('fid', fid)
          .single();
          
        if (existingVote) {
          setUserVote(existingVote);
        }
      }
    };

    fetchUserVote();
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'fc:frame:init') {
        setIsInFrame(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const voteFor = useCallback(async (choice: 'BRETT' | 'POPCAT') => {
    if (isVoting) return;
    setIsVoting(true);
    
    try {
      const context = await sdk.context;
      const fid = context?.user?.fid;
      
      if (!fid) {
        alert('Please open this in Warpcast to vote!');
        return;
      }

      const { data: existingVote, error: checkError } = await supabase
        .from('votes')
        .select()
        .eq('fid', fid)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing vote:', checkError);
        alert('Error checking your vote. Please try again.');
        return;
      }
        
      if (existingVote) {
        alert('You have already voted!');
        return;
      }

      const message = choice === 'BRETT' 
        ? "https://memevsmeme.fun\n\nI voted for $BRETT to outperform $POPCAT. Participate in Meme vs Meme to earn rewards!"
        : "https://memevsmeme.fun\n\nI voted for $POPCAT to outperform $BRETT. Participate in Meme vs Meme to earn rewards!";

      const { data: vote, error: insertError } = await supabase
        .from('votes')
        .insert({
          choice,
          fid: context.user.fid,
          username: context.user.username,
          display_name: context.user.displayName,
          pfp_url: context.user.pfpUrl
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting vote:', insertError);
        alert('Error submitting your vote. Please try again.');
        return;
      }
          
      console.log('Vote submitted successfully:', vote);
      setUserVote(vote);
      const encodedText = encodeURIComponent(message);
      sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodedText}`);
    } catch (error) {
      console.error('Error voting:', error);
      alert('An error occurred while voting. Please try again.');
    } finally {
      setIsVoting(false);
    }
  }, [isVoting]);

  const resendWarpcastMessage = useCallback((choice: 'BRETT' | 'POPCAT') => {
    const message = choice === 'BRETT' 
      ? "https://memevsmeme.fun\n\nI voted for $BRETT to outperform $POPCAT. Participate in Meme vs Meme to earn rewards!"
      : "https://memevsmeme.fun\n\nI voted for $POPCAT to outperform $BRETT. Participate in Meme vs Meme to earn rewards!";
    
    const encodedText = encodeURIComponent(message);
    sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodedText}`);
  }, []);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center w-[300px] mx-auto py-2">
      {!isInFrame && (
        <p className="text-sm text-gray-500 mb-2 text-center">
          ⚡️ Open in Warpcast to participate in the vote!
        </p>
      )}
      <div className="mb-2">
        <Image
          src="/meme.png"
          alt={title}
          width={300}
          height={169}
          className="rounded-xl"
          priority
        />
      </div>

      <div className="text-center mb-4 space-y-1">
        <h2 className="text-xl font-bold">{title}</h2>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="bg-purple-600 h-2.5 rounded-full transition-all"
            style={{ 
              width: `${voteStats.POPCAT + voteStats.BRETT === 0 ? 50 : 
                (voteStats.POPCAT / (voteStats.POPCAT + voteStats.BRETT)) * 100}%` 
            }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span>POPCAT: {voteStats.POPCAT}</span>
          <span>BRETT: {voteStats.BRETT}</span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cast your vote for the next meme to moon!
        </p>
        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
          Participate to receive rewards! 🎁
        </p>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Time remaining:
          <div className="font-mono text-sm">
            {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col items-center space-y-2">
        <Button
          onClick={() => userVote?.choice === 'POPCAT' ? resendWarpcastMessage('POPCAT') : voteFor('POPCAT')}
          disabled={isVoting}
          isLoading={isVoting}
          className={`w-full ${userVote?.choice === 'POPCAT' ? 'bg-green-500' : ''}`}
        >
          {userVote?.choice === 'POPCAT' ? 'Share $POPCAT Vote' : 'Vote $POPCAT'}
        </Button>
        
        <Button
          onClick={() => userVote?.choice === 'BRETT' ? resendWarpcastMessage('BRETT') : voteFor('BRETT')}
          disabled={isVoting}
          isLoading={isVoting}
          className={`w-full ${userVote?.choice === 'BRETT' ? 'bg-green-500' : ''}`}
        >
          {userVote?.choice === 'BRETT' ? 'Share $BRETT Vote' : 'Vote $BRETT'}
        </Button>
      </div>
    </div>
  );
}
