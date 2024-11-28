'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useRef } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Room } from '@/types';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import type { RoomIdParams } from '../../types';
import { TypographyH1 } from '@/components/ui/typography';
// import { useAuth } from '@/components/providers/auth-provider';
import type { User } from 'firebase/auth';
import { realtimeDb } from '@/lib/firebase';
import type { Player } from '@/types';
import {
  get,
  limitToLast,
  orderByChild,
  query as realtimeQuery,
  ref,
  set,
} from 'firebase/database';
import { useAuth } from '@/components/providers/auth-provider';
type UpdateRealtimeParams = {
  roomId: string;
  name: string;
};
// type Props = {
//   updateRealtime: (params: UpdateRealtimeParams) => Promise<void>;
// };
export const JoinRoomClientPage = () => {
  const { id } = useParams<RoomIdParams['params']>();
  const code = useSearchParams().get('code');
  const [roomCode, setRoomCode] = React.useState(code || '');
  const [username, setUserName] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { signInAnonymously, user, setUser } = useAuth();
  // console.log('user', user);
  const userIdRef = useRef('');
  const router = useRouter();

  const handleJoinRoom = async () => {
    setLoading(true);
    const canJoin = await canJoinRoom(roomCode);
    if (!canJoin) {
      setError('Room not found or not active');
      return;
    }

    let userToUse: User | null = null;

    if (!user) {
      const userCredentials = await signInAnonymously();

      if (!userCredentials.user) {
        setError('Failed to sign in');
        setLoading(false);
        return;
      }
      console.log('getting from userCredentials', userCredentials);
      userToUse = userCredentials.user;
    } else {
      console.log('getting from user', user);
      userToUse = user;
    }
    try {
      userIdRef.current = userToUse.uid;
      await updateRealtime({ roomId: id, name: username });

      setLoading(false);

      setUser(userToUse);
      router.replace(`/room/${id}/play`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      setLoading(false);
      console.log('a;lsdjfasdklj', error);
    }
  };

  const updateRealtime = async ({ roomId, name }: UpdateRealtimeParams) => {
    // get the max turn order
    const playersRef = ref(realtimeDb, `rooms/${roomId}/players`);

    const turnOrderRef = realtimeQuery(playersRef, orderByChild('turnOrder'), limitToLast(1));

    const maxTurnOrderSnapshot = await get(turnOrderRef);

    let maxTurnOrder: number | undefined = undefined;
    // biome-ignore lint/complexity/noForEach: <explanation>
    maxTurnOrderSnapshot.forEach((child) => {
      maxTurnOrder = (child.val() as Player).turnOrder;
    });

    // save the player
    // const playerRef = ref(realtimeDb, `rooms/${roomId}/players/${user!.uid}`);
    const playerRef = ref(realtimeDb, `rooms/${roomId}/players/${userIdRef.current}`);

    const player: Player = {
      name,
      id: userIdRef.current,
      // id: user!.uid,
      status: 'joined',
      turnOrder: maxTurnOrder === undefined ? 1 : maxTurnOrder + 1,
    };

    try {
      set(playerRef, player);
    } catch (error) {
      console.log('error', error);
    }
  };

  const canJoinRoom = async (roomCode: string): Promise<boolean> => {
    const docRef = collection(db, 'rooms');
    const q = query(docRef, where('id', '==', id), limit(1));

    const querySnapshot = await getDocs(q);
    const room = querySnapshot.docs[0].data() as Room | undefined;
    console.log('room', room);

    if (room?.active && room?.roomCode === roomCode) {
      return true;
    }

    return false;
  };

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <h1>{error}</h1>
      </div>
    );
  }

  return (
    <div className='h-screen flex flex-col justify-center p-3'>
      <div className='flex  w-full max-w-[500px]  mx-auto h-full flex-col gap-5 items-center justify-center'>
        <TypographyH1>Join Room</TypographyH1>
        <Input
          placeholder='Enter room code'
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <Input
          placeholder='Enter your username'
          value={username}
          autoComplete='off'
          onChange={(e) => setUserName(e.target.value)}
        />
        <Button onClick={handleJoinRoom} disabled={!roomCode || !username || loading}>
          {loading ? <Loader2 className='animate-spin' /> : null}
          Join room
        </Button>
      </div>
    </div>
  );
};
