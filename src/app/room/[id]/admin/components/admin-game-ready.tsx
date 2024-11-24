import { Button } from '@/components/ui/button';
import { TypographyH3, TypographyLarge } from '@/components/ui/typography';
import { db, realtimeDb } from '@/lib/firebase';
import type { RealtimeGameState, Turn } from '@/types';
import { onValue, ref, update } from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export const AdminGameReady = () => {
  const { id } = useParams<{ id: string }>();
  const [currentTurn, setCurrentTurn] = React.useState<Turn | null>(null);
  const [genderRevealed, setGenderRevealed] = React.useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    const currentTurnRef = ref(realtimeDb, `rooms/${id}/gameState`);

    const unsubCurrentTurn = onValue(currentTurnRef, (snapshot) => {
      const gameState = snapshot.val() as RealtimeGameState;

      if (gameState.currentTurn?.playerId !== currentTurn?.playerId) {
        setCurrentTurn(gameState.currentTurn);
      }

      if (gameState.genderRevealed) {
        setGenderRevealed(true);
      }
    });
    return () => {
      unsubCurrentTurn();
    };
  }, [id]);
  const handleCloseRoom = async () => {
    const roomDocRef = doc(db, 'rooms', id);

    await updateDoc(roomDocRef, {
      active: false,
    });

    const roomRef = ref(realtimeDb, `rooms/${id}/gameState`);

    await update(roomRef, {
      active: false,
    });

    router.replace('/');
  };
  return (
    <div>
      <TypographyH3>Game state</TypographyH3>
      <div className='mt-5'>
        <div className='flex items-center gap-3'>
          <TypographyH3>Current turn</TypographyH3>
          <TypographyH3>{currentTurn?.playerName}</TypographyH3>
        </div>
        {genderRevealed && <TypographyLarge>Gender has been revealed</TypographyLarge>}
      </div>
      <Button variant={'destructive'} onClick={handleCloseRoom}>
        Close room
      </Button>
    </div>
  );
};
