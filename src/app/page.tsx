'use client';
import { Button } from '@/components/ui/button';
import { db, realtimeDb } from '@/lib/firebase';
import { ref, set } from 'firebase/database';
import { useState } from 'react';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { generateRandomString } from '@/lib/utils';
import { doc, setDoc } from 'firebase/firestore';
import type { Gender, RealtimeRoom } from '@/types';

type SelectedGender = Gender | '';

export default function Home() {
  const [gender, setGender] = useState<SelectedGender>('');
  const router = useRouter();

  const handleClick = async () => {
    const roomId = crypto.randomUUID();
    const roomCode = generateRandomString(6);

    await setDoc(doc(db, 'rooms', roomId), {
      maxPlayers: 10,
      id: roomId,
      active: true,
      roomCode,
    });

    if (gender === '') {
      return;
    }

    const room: RealtimeRoom = {
      id: roomId,
      gameState: {
        ready: false,
        active: true,
        currentTurn: null,
        genderRevealed: false,
        revealerId: null,
        gender,
      },
      players: {},
    };

    set(ref(realtimeDb, `rooms/${roomId}`), room);

    router.push(`/room/${roomId}/admin`);
  };
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='flex flex-col gap-5 justify-center'>
        <Select
          onValueChange={(value) => {
            setGender(value as Gender);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select the gender' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value='girl'>Girl</SelectItem>
              <SelectItem value='boy'>Boy</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button disabled={!gender} onClick={handleClick}>
          Create room
        </Button>
      </div>
    </div>
  );
}
