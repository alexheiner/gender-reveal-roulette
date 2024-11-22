'use client';
import { db, realtimeDb } from '@/lib/firebase';
import type { Player } from '@/types';
import { ref, update } from 'firebase/database';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doc, updateDoc } from 'firebase/firestore';
import { PlayerJoinedList } from './player-joined-list';
import { CopyButton } from '@/components/ui/copy-button';
import { TypographyLarge, TypographyP } from '@/components/ui/typography';

type Props = {
  roomCode: string;
};
const hostName = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://';
// const joinRoomLink = `${hostName}/room/${id}/join`;

export const AdminClientPage = ({ roomCode }: Props) => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

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

  const handleSetReady = async () => {
    const roomRef = ref(realtimeDb, `rooms/${id}/gameState`);

    await update(roomRef, {
      ready: true,
    });
  };

  return (
    <>
      <div className='mb-20'>
        <PlayerJoinedList>
          {({ players }) => {
            console.log('players', players);
            if (players.length === 0) {
              return <TypographyLarge>No players have joined yet</TypographyLarge>;
            }
            return (
              <ul>
                {players.map((player) => (
                  <PlayerJoined key={player.id} player={player} />
                ))}
              </ul>
            );
          }}
        </PlayerJoinedList>
      </div>
      <div className='flex gap-5 justify-center mb-10'>
        <CopyButton variant={'outline'} value={roomCode}>
          Copy room code
        </CopyButton>
        <CopyButton variant={'outline'} value={`${hostName}/room/${id}/join`}>
          Copy join link
        </CopyButton>
      </div>
      <div className='flex gap-5 justify-center mb-10'>
        <Button variant={'destructive'} onClick={handleCloseRoom}>
          Close room
        </Button>
        <Button variant={'default'} onClick={handleSetReady}>
          Start game
        </Button>
      </div>
    </>
  );
};

const PlayerJoined = ({ player }: { player: Player }) => {
  return (
    <div className='flex gap-5'>
      <p className='flex-1'>{player.name}</p>
      <PlayerReady ready={player.ready} />
      <PlayerTurnOrder turnOrder={player.turnOrder} />
    </div>
  );
};

const PlayerTurnOrder = ({ turnOrder }: { turnOrder: number }) => {
  return (
    <div>
      <TypographyP>Turn order: {turnOrder}</TypographyP>
    </div>
  );
};

const PlayerReady = ({ ready }: { ready: boolean }) => {
  if (ready) {
    return <Check size={24} strokeWidth={1.25} />;
  }
  return <Loader2 className='animate-spin' size={24} strokeWidth={1.25} />;
};
