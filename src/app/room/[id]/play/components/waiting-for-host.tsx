'use client';
import type { Player, RealtimeGameState } from '@/types';
import React, { useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { TypographyH2, TypographyLarge } from '@/components/ui/typography';
import { onChildChanged, ref } from 'firebase/database';
import { useParams, useRouter } from 'next/navigation';
import { realtimeDb } from '@/lib/firebase';
export const WaitingForHost = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = React.useState<string | undefined>(undefined);
  const [waiting, setWaiting] = React.useState(true);
  useEffect(() => {
    const playersRef = ref(realtimeDb, `rooms/${id}/gameState`);

    const unsub = onChildChanged(playersRef, (snapshot) => {
      const gameState = snapshot.val() as RealtimeGameState;

      if (gameState.active) {
        setWaiting(false);
      }

      if (!gameState.active) {
        setMessage('The host has ended the game');
        setTimeout(() => {
          router.replace('/');
        }, 3000);
      }
    });

    return () => unsub();
  }, [id, router.replace]);
  return (
    <div>
      {message !== undefined ? <TypographyLarge>{message}</TypographyLarge> : null}

      {waiting && message === undefined ? (
        <div className='flex gap-5 items-center'>
          <TypographyLarge>Waiting for host to start the game...</TypographyLarge>
          <Loader2 className='animate-spin' size={24} />
        </div>
      ) : null}
    </div>
  );
};
