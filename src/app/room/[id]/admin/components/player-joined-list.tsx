'use client';

import { realtimeDb } from '@/lib/firebase';
import type { Player } from '@/types';
import { onChildAdded, onChildChanged, ref } from 'firebase/database';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';

type Props = {
  children: (props: { players: Player[] }) => React.ReactNode;
};
export const PlayerJoinedList = ({ children }: Props) => {
  const [playersJoined, setPlayersJoined] = React.useState<Player[]>([]);
  const { id } = useParams<{ id: string }>();

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

  return children({ players: playersJoined });
};
