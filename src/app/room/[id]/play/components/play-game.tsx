import { TypographyLarge } from '@/components/ui/typography';
import { realtimeDb } from '@/lib/firebase';
import type { Gender, RealtimeGameState, Turn } from '@/types';
import { equalTo, get, onValue, orderByChild, query, ref, update } from 'firebase/database';
import { useParams } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '../hooks/useWindowSize';
type Props = {
  isRevealer: boolean;
  userId: string;
  gender: Gender;
};

type BackgroundClass = 'bg-girl-background' | 'bg-boy-background' | 'bg-black' | 'bg-white';
const boyColors = ['#0056b3', '#0078d4', '#0095ff', '#00b0ff', '#00c7ff'];
const girlColors = ['#ff007f', '#ff2e8b', '#ff4d97', '#ff6ca3', '#ff8ab0'];

export const PlayGame = ({ userId, isRevealer, gender }: Props) => {
  const { id } = useParams<{ id: string }>();
  const [isUsersTurn, setIsUsersTurn] = React.useState(false);
  const [currentTurn, setCurrentTurn] = React.useState<Turn | null>(null);
  const [backgroundClass, setBackgroundClass] = React.useState<BackgroundClass>('bg-white');
  const [genderRevealed, setGenderRevealed] = React.useState(false);
  const metaRef = useRef<HTMLMetaElement | null>(null);

  useEffect(() => {
    if (!metaRef.current) {
      metaRef.current = document.querySelector('meta[name="theme-color"]');
    }
  }, []);
  const { width, height } = useWindowSize();
  if (process.env.NODE_ENV === 'development') {
    console.log('currentTurn', currentTurn);
  }

  useEffect(() => {
    const currentTurnRef = ref(realtimeDb, `rooms/${id}/gameState`);

    const unsubCurrentTurn = onValue(currentTurnRef, (snapshot) => {
      const gameState = snapshot.val() as RealtimeGameState;

      if (process.env.NODE_ENV === 'development') {
        console.log('--------- GAME STATE ---------', gameState);
      }

      if (gameState.currentTurn?.playerId === userId) {
        setIsUsersTurn(true);
        setCurrentTurn(gameState.currentTurn);
      }

      if (gameState.currentTurn?.playerId !== userId) {
        setIsUsersTurn(false);
        setCurrentTurn(gameState.currentTurn);
      }

      if (gameState.currentTurn?.playerId !== userId && gameState.genderRevealed) {
        if (gameState.genderRevealed) {
          setTimeout(() => {
            handleGenderRevealed();
          }, 1000);
        }
      }
    });
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('unsubbing from current turn ref');
      }
      unsubCurrentTurn();
    };
  }, [id, userId]);

  const handlePress = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();

    if (isUsersTurn && isRevealer) {
      handleGenderRevealed();

      const roomRef = ref(realtimeDb, `rooms/${id}/gameState`);

      const values: Partial<RealtimeGameState> = {
        genderRevealed: true,
      };

      await update(roomRef, values);
    } else if (isUsersTurn && !isRevealer) {
      setBackgroundClass('bg-black');

      setTimeout(async () => {
        setBackgroundClass('bg-white');
        await updateTurn();
      }, 5000);
    } else {
      console.log('Not your turn');
    }
  };

  const updateTurn = async () => {
    const nextTurn = await getNextTurn();

    if (!nextTurn) {
      return;
    }

    const roomRef = ref(realtimeDb, `rooms/${id}/gameState`);

    const values: Partial<RealtimeGameState> = {
      currentTurn: nextTurn,
    };

    await update(roomRef, values);
  };

  const getNextTurn = async (): Promise<Turn | undefined> => {
    const turnsRef = ref(realtimeDb, `rooms/${id}/turns`);

    const nextTurnRef = query(turnsRef, orderByChild('turnId'), equalTo(currentTurn!.turnId + 1));

    const nextTurns = await get(nextTurnRef);

    let nextTurn: Turn | undefined = undefined;
    // biome-ignore lint/complexity/noForEach: <explanation>
    nextTurns.forEach((turn) => {
      nextTurn = turn.val();
    });

    return nextTurn;
  };

  const handleGenderRevealed = () => {
    if (gender === 'boy') {
      setBackgroundClass('bg-boy-background');
      metaRef.current?.setAttribute('content', '#3b82f6');
    } else {
      setBackgroundClass('bg-girl-background');
      metaRef.current?.setAttribute('content', '#ec4899');
    }
    setGenderRevealed(true);
  };

  return (
    <div
      className={`absolute h-full w-screen top-0 bottom-0 right-0 left-0 bg-blue ${backgroundClass} p-3 transition-all duration-500`}
      onClick={handlePress}
    >
      {genderRevealed && (
        <Confetti
          width={width}
          height={height}
          colors={gender === 'boy' ? boyColors : girlColors}
        />
      )}
      {/* {isRevealer ? 'You are the revealer' : 'You are not the revealer'} */}
      {/* <TypographyH1>Play</TypographyH1> */}
      {/* <TypographyLarge>Turn Order: {turnOrder}</TypographyLarge> */}
      {currentTurn?.playerId === userId ? (
        <>
          <TypographyLarge className='text-center'>Your turn</TypographyLarge>
          <TypographyLarge className='text-center'>Tap anywhere on the screen</TypographyLarge>
        </>
      ) : (
        <TypographyLarge className='text-center'>
          Player {currentTurn?.playerId}'s turn
        </TypographyLarge>
      )}
    </div>
  );
};
//https://www.toptal.com/designers/colourcode/monochrome-color-builder
