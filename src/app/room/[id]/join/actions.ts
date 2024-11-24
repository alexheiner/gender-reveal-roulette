'use server';

import { realtimeDb } from '@/lib/firebase';
import type { Player } from '@/types';
import { get, limitToLast, orderByChild, query, ref, set } from 'firebase/database';
import { cookies } from 'next/headers';

export type UpdateRealtimeParams = {
  roomId: string;
  userId: string;
  name: string;
};
export const updateRealtime = async ({ roomId, userId, name }: UpdateRealtimeParams) => {
  // get the max turn order
  const playersRef = ref(realtimeDb, `rooms/${roomId}/players`);

  const turnOrderRef = query(playersRef, orderByChild('turnOrder'), limitToLast(1));

  const maxTurnOrderSnapshot = await get(turnOrderRef);

  let maxTurnOrder: number | undefined = undefined;
  // biome-ignore lint/complexity/noForEach: <explanation>
  maxTurnOrderSnapshot.forEach((child) => {
    maxTurnOrder = (child.val() as Player).turnOrder;
  });

  // save the player
  const playerRef = ref(realtimeDb, `rooms/${roomId}/players/${userId}`);

  const player: Player = {
    name,
    id: userId,
    status: 'joined',
    turnOrder: maxTurnOrder === undefined ? 1 : maxTurnOrder + 1,
  };

  set(playerRef, player);

  const oneDay = 24 * 60 * 60 * 1000;
  cookies().set('userId', userId, { expires: Date.now() + oneDay, httpOnly: true });
};
