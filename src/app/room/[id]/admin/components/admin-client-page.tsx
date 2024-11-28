'use client';
import { db, realtimeDb } from '@/lib/firebase';
import type { Player, PlayerStatus, RealtimeGameState, Turn } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doc, updateDoc } from 'firebase/firestore';
import { CopyButton } from '@/components/ui/copy-button';
import { TypographyLarge } from '@/components/ui/typography';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { onChildAdded, onChildChanged, onValue, ref, set, update } from 'firebase/database';
import { useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { AdminGameReady } from './admin-game-ready';
type Props = {
  roomCode: string;
};

export const AdminClientPage = ({ roomCode }: Props) => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [revealerId, setRevealerId] = React.useState<string | null>(null);
  const [playersJoined, setPlayersJoined] = React.useState<Player[]>([]);
  const [ready, setReady] = React.useState(false);

  const hostName = window.location.origin;

  // useEffect(() => {
  //   const roomRef = ref(realtimeDb, `rooms/${id}/gameState`);
  //   onDisconnect(roomRef).update({
  //     active: false,
  //   });
  // }, [id]);

  useEffect(() => {
    const gameStateRef = ref(realtimeDb, `rooms/${id}/gameState/revealerId`);

    const unsub = onValue(gameStateRef, (snapshot) => {
      const revealerId = snapshot.val() as string;
      console.log('revealerId', revealerId);
      setRevealerId(revealerId);
    });

    return () => unsub();
  }, [id]);

  useEffect(() => {
    const playersRef = ref(realtimeDb, `rooms/${id}/players`);

    const unsub = onChildAdded(playersRef, (snapshot) => {
      const player = snapshot.val() as Player;
      console.log('player', player);
      setPlayersJoined((prev) => [...prev, player]);
    });

    return () => unsub();
  }, [id]);

  useEffect(() => {
    const playersRef = ref(realtimeDb, `rooms/${id}/players`);

    const unsub = onChildChanged(playersRef, (snapshot) => {
      const player = snapshot.val() as Player;
      setPlayersJoined((prev) => prev.map((p) => (p.id === player.id ? player : p)));
      console.log('player changed', player);
    });

    return () => unsub();
  }, [id]);

  const allPlayersReady = useMemo(() => {
    let allReady = true;
    for (const p of playersJoined) {
      if (p.status !== 'ready') {
        allReady = false;
        break;
      }
    }
    return allReady;
  }, [playersJoined]);

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
    const turns: Turn[] = [];
    let firstTurnIndex = 0;
    for (let i = 0; i < playersJoined.length; i++) {
      if (playersJoined[i].turnOrder === 1) {
        firstTurnIndex = i;
      }
      turns.push({
        playerName: playersJoined[i].name,
        playerId: playersJoined[i].id,
        turnId: playersJoined[i].turnOrder,
      });
    }

    console.log('turns', turns);
    console.log('firstTurnIndex', turns[firstTurnIndex]);

    const turnRef = ref(realtimeDb, `rooms/${id}/turns`);

    await set(turnRef, turns);

    const roomRef = ref(realtimeDb, `rooms/${id}/gameState`);

    await update(roomRef, {
      ready: true,
      currentTurn: turns[firstTurnIndex],
    });

    setReady(true);
  };

  const handleSetGenderRevealer = async (checked: CheckedState, playerId: string) => {
    const roomRef = ref(realtimeDb, `rooms/${id}/gameState`);

    const revealerId = checked ? playerId : null;

    const updateValues: Partial<RealtimeGameState> = {
      revealerId,
    };
    await update(roomRef, updateValues);
  };

  // const form = useForm({

  // })

  if (ready) {
    return <AdminGameReady />;
  }

  return (
    <>
      <div className='mb-20'>
        {playersJoined.length === 0 ? (
          <div className='text-center'>
            <TypographyLarge>No players have joined yet</TypographyLarge>
          </div>
        ) : (
          <ul className='space-y-7'>
            {playersJoined.map((player) => (
              <PlayerListItem
                roomId={id}
                revealerId={revealerId}
                onCheckRevealGender={handleSetGenderRevealer}
                key={player.id}
                allPlayersReady={allPlayersReady}
                player={player}
              />
            ))}
          </ul>
        )}
      </div>
      <div className='flex gap-5 justify-center mb-10'>
        <CopyButton variant={'outline'} value={`${hostName}/room/${id}/join?code=${roomCode}`}>
          Copy join link
        </CopyButton>
        <CopyButton variant={'outline'} value={roomCode}>
          Copy room code
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

type PlayerListItemProps = {
  onCheckRevealGender: (checked: CheckedState, playerId: string) => Promise<void>;
  roomId: string;
  player: Player;
  allPlayersReady: boolean;
  revealerId: string | null;
};
const PlayerListItem = ({
  player,
  allPlayersReady,
  onCheckRevealGender,
  revealerId,
  roomId,
}: PlayerListItemProps) => {
  console.log('revealerId', revealerId);
  return (
    <li className='flex gap-5 justify-center items-center'>
      <p className='flex-1'>{player.name}</p>
      <PlayerStatusIcon status={player.status} />
      <PlayerTurnOrder turnOrder={player.turnOrder} roomId={roomId} userId={player.id} />
      {allPlayersReady ? (
        <div className='flex gap-2 items-center'>
          <Checkbox
            checked={player.id === revealerId}
            onCheckedChange={(checked) => onCheckRevealGender(checked, player.id)}
            id={`reveal-gender-${player.turnOrder}`}
          />
          <Label className='cursor-pointer' htmlFor={`reveal-gender-${player.turnOrder}`}>
            Set as revealer
          </Label>
        </div>
      ) : null}
    </li>
  );
};

type PlayerTurnOrderProps = {
  roomId: string;
  userId: string;
  turnOrder: number;
};
const PlayerTurnOrder = ({ turnOrder, roomId, userId }: PlayerTurnOrderProps) => {
  const [updateTurnOrder, setUpdateTurnOrder] = React.useState(false);
  const [currentTurnOrder, setCurrentTurnOrder] = React.useState(turnOrder);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTurnOrder(Number.parseInt(e.target.value, 10));
  };
  const handleSave = async () => {
    console.log('updateTurnOrder', updateTurnOrder);
    if (currentTurnOrder === turnOrder) {
      setUpdateTurnOrder((prev) => !prev);
      return;
    }

    const playerRef = ref(realtimeDb, `rooms/${roomId}/players/${userId}`);
    await update(playerRef, {
      turnOrder: currentTurnOrder,
    });
    setUpdateTurnOrder(false);
  };

  const handleEditCancelPress = () => {
    if (updateTurnOrder === true) {
      setCurrentTurnOrder(turnOrder);
    }
    setUpdateTurnOrder((prev) => !prev);
  };

  return (
    <div className='flex gap-5 items-center'>
      <Label htmlFor='turn-order'>Turn order</Label>
      <Input
        type='number'
        className='w-14 disabled:opacity-85'
        id='turn-order'
        value={currentTurnOrder}
        onChange={handleInputChange}
        disabled={!updateTurnOrder}
      />
      {updateTurnOrder && (
        <Button variant='default' onClick={handleSave}>
          Save
        </Button>
      )}
      <Button variant='outline' onClick={handleEditCancelPress}>
        {updateTurnOrder ? 'Cancel' : 'Edit'}
      </Button>
    </div>
  );
};

const PlayerStatusIcon = ({ status }: { status: PlayerStatus }) => {
  if (status === 'joined') {
    return <Loader2 className='animate-spin' size={24} strokeWidth={1.25} />;
  }
  if (status === 'ready') {
    return <Check size={24} strokeWidth={1.25} />;
  }
  if (status === 'disconnected') {
    return <X size={24} strokeWidth={1.25} />;
  }

  return null;
};
