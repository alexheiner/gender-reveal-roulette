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
import { Input } from '@/components/ui/input';
import { TypographyH1 } from '@/components/ui/typography';

type SelectedGender = Gender | '';

export default function Home() {
  const [gender, setGender] = useState<SelectedGender>('');
  const [name, setName] = useState<string>('');
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
      turns: {},
      hostId: crypto.randomUUID(),
      hostName: name,
    };

    set(ref(realtimeDb, `rooms/${roomId}`), room);

    router.push(`/room/${roomId}/admin`);
  };
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-10'>
      <TypographyH1>Reveal Roulette</TypographyH1>
      <div className='flex flex-col gap-5 justify-center'>
        <Input
          placeholder='Enter your name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
              <SelectItem value='girl'>
                <div className='flex items-center gap-5'>
                  <span className='bg-pink-600 w-3 h-3 rounded-md' />
                  <p>Girl</p>
                </div>
              </SelectItem>
              <SelectItem value='boy'>
                <div className='flex items-center gap-5'>
                  <span className='bg-blue-600 w-3 h-3 rounded-md' />
                  <p>Boy</p>
                </div>
              </SelectItem>
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
