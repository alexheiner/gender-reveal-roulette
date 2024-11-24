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
import type { UpdateRealtimeParams } from '../actions';
import { TypographyH1 } from '@/components/ui/typography';

type Props = {
  updateRealtime: (params: UpdateRealtimeParams) => Promise<void>;
};
export const JoinRoomClientPage = ({ updateRealtime }: Props) => {
  const { id } = useParams<RoomIdParams['params']>();
  const code = useSearchParams().get('code');
  const [roomCode, setRoomCode] = React.useState(code || '');
  const [username, setUserName] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const userIdRef = useRef('');
  const router = useRouter();

  const handleJoinRoom = async () => {
    setLoading(true);
    const canJoin = await canJoinRoom(roomCode);
    if (!canJoin) {
      setError('Room not found or not active');
      return;
    }

    const userId = crypto.randomUUID();
    userIdRef.current = userId;
    await updateRealtime({ roomId: id, userId, name: username });

    setLoading(false);

    router.replace(`/room/${id}/play`);
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
    <div className='min-h-screen flex flex-col justify-center p-3'>
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
