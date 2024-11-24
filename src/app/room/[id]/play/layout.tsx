import { TypographyH1 } from '@/components/ui/typography';
import { realtimeDb } from '@/lib/firebase';
import { get, ref } from 'firebase/database';
import React from 'react';
import type { RoomIdParams } from '../types';
type Props = RoomIdParams & {
  children: React.ReactNode;
};
const RoomPlayLayout = async ({ children, params }: Props) => {
  const hostNameRef = ref(realtimeDb, `rooms/${params.id}/hostName`);

  const roomNameSnapshot = await get(hostNameRef);
  console.log('roomNameSnapshot', roomNameSnapshot.val());
  const roomName = roomNameSnapshot.val() as string;

  return (
    <div className='min-h-screen p-4'>
      <TypographyH1 className='text-center'>{roomName}'s Room</TypographyH1>
      <main>{children}</main>
    </div>
  );
};

export default RoomPlayLayout;
