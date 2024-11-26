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
import type { Gender, RealtimeRoom, Room } from '@/types';
import { Input } from '@/components/ui/input';
import { TypographyH1 } from '@/components/ui/typography';
import { useAuth } from '@/components/providers/auth-provider';

type SelectedGender = Gender | '';

export default function Home() {
  const [gender, setGender] = useState<SelectedGender>('');
  const { signInAnonymously } = useAuth();
  const [name, setName] = useState<string>('');
  const router = useRouter();

  const handleClick = async () => {
    const roomId = crypto.randomUUID();
    const roomCode = generateRandomString(6);
    const userCredential = await signInAnonymously();

    console.log('userCredential', userCredential);

    if (!userCredential.user) {
      return;
    }
    const room: Room = {
      maxPlayers: 10,
      currentPlayers: 0,
      id: roomId,
      active: true,
      roomCode,
    };

    await setDoc(doc(db, 'rooms', roomId), room);

    if (gender === '') {
      return;
    }

    const realtimeRoom: RealtimeRoom = {
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
      hostId: userCredential.user.uid,
      hostName: name,
    };

    set(ref(realtimeDb, `rooms/${roomId}`), realtimeRoom);

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
        <Button disabled={!gender || !name} onClick={handleClick}>
          Create room
        </Button>
      </div>
    </div>
  );
}
