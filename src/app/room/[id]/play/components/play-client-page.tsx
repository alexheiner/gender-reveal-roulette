'use client';

import { TypographyH1, TypographyLarge } from '@/components/ui/typography';
import type { RealtimeGameState } from '@/types';
import React, { useEffect } from 'react';
import { onChildChanged, ref, update } from 'firebase/database';
import { useParams, useRouter } from 'next/navigation';
import { realtimeDb } from '@/lib/firebase';
import { WaitingForHost } from './waiting-for-host';
import { PlayGame } from './play-game';

type Props = {
  userId: string;
};

type GameState = 'waiting' | 'ready' | 'ended';

export const PlayClientPage = ({ userId }: Props) => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [gameState, setGameState] = React.useState<GameState>('waiting');

  useEffect(() => {
    const playersRef = ref(realtimeDb, `rooms/${id}/players/${userId}`);

    update(playersRef, {
      ready: true,
    });
  }, [id, userId]);

  useEffect(() => {
    const playersRef = ref(realtimeDb, `rooms/${id}/gameState`);

    const unsub = onChildChanged(playersRef, (snapshot) => {
      const gameState = snapshot.val() as RealtimeGameState;

      if (gameState.ready) {
        setGameState('ready');
      }

      if (!gameState.active) {
        setGameState('ended');
        setTimeout(() => {
          router.replace('/');
        }, 3000);
      }
    });

    return () => unsub();
  }, [id, router.replace]);

  if (gameState === 'ended') {
    return (
      <div className='h-screen flex flex-col justify-center items-center'>
        <TypographyH1>Game has ended</TypographyH1>
        <TypographyLarge>Redirecting to home page...</TypographyLarge>
      </div>
    );
  }

  if (gameState === 'waiting') {
    return <WaitingForHost />;
  }

  return <PlayGame />;
};
