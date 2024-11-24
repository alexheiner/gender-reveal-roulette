'use client';

import { TypographyH1, TypographyLarge } from '@/components/ui/typography';
import type { Gender, Player, RealtimeGameState } from '@/types';
import React, { useEffect, useRef } from 'react';
import { onValue, ref, update } from 'firebase/database';
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
  const isRevealerRef = useRef(false);
  const turnOrderRef = useRef(0);
  const hasSetStatusRef = useRef(false);
  const genderRef = useRef<Gender>();

  // useEffect(() => {
  //   const playersRef = ref(realtimeDb, `rooms/${id}/players/${userId}`);
  //   onDisconnect(playersRef).update({
  //     status: 'disconnected',
  //   });
  // }, [id, userId]);

  useEffect(() => {
    const playersRef = ref(realtimeDb, `rooms/${id}/players/${userId}`);

    const unsub = onValue(playersRef, (snapshot) => {
      const player = snapshot.val() as Player;

      if (player.turnOrder !== turnOrderRef.current) {
        console.log('setting turn order', player.turnOrder);
        turnOrderRef.current = player.turnOrder;
      }
    });

    if (hasSetStatusRef.current === false) {
      update(playersRef, {
        status: 'ready',
      });
      hasSetStatusRef.current = true;
    }

    return () => unsub();
  }, [id, userId]);

  useEffect(() => {
    const gameStateRef = ref(realtimeDb, `rooms/${id}/gameState`);

    const unsub = onValue(gameStateRef, (snapshot) => {
      const gameState = snapshot.val() as RealtimeGameState;

      genderRef.current = gameState.gender;

      if (gameState.revealerId === userId) {
        isRevealerRef.current = true;
      }
      if (gameState.revealerId !== userId) {
        isRevealerRef.current = false;
      }

      console.log('game state', gameState);

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
  }, [id, userId, router.replace]);

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

  if (gameState === 'ready' && turnOrderRef.current !== 0) {
    console.log('mounting play game');
    console.log('turn order', turnOrderRef.current);
    console.log('is revealer', isRevealerRef.current);
    return (
      <PlayGame
        turnOrder={turnOrderRef.current}
        userId={userId}
        gender={genderRef.current!}
        isRevealer={isRevealerRef.current}
      />
    );
  }

  return <div>Error...</div>;
};
