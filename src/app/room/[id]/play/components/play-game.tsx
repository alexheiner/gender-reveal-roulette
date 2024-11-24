import { TypographyLarge } from '@/components/ui/typography';
import { realtimeDb } from '@/lib/firebase';
import type { Gender, RealtimeGameState, Turn } from '@/types';
import {
  get,
  limitToFirst,
  onValue,
  orderByChild,
  query,
  ref,
  startAfter,
  update,
} from 'firebase/database';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';
// import { useGetTurnOrder } from '../hooks/useGetTurnOrder';
// import { Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from '../hooks/useWindowSize';
type Props = {
  isRevealer: boolean;
  userId: string;
  turnOrder: number;
  gender: Gender;
};

type BackgroundClass = 'bg-pink-600' | 'bg-blue-600' | 'bg-black' | 'bg-white';
const boyColors = ['#0056b3', '#0078d4', '#0095ff', '#00b0ff', '#00c7ff'];
const girlColors = ['#ff007f', '#ff2e8b', '#ff4d97', '#ff6ca3', '#ff8ab0'];

export const PlayGame = ({ userId, isRevealer, turnOrder, gender }: Props) => {
  const { id } = useParams<{ id: string }>();
  const [isUsersTurn, setIsUsersTurn] = React.useState(false);
  const [currentTurn, setCurrentTurn] = React.useState<Turn | null>(null);
  const [backgroundClass, setBackgroundClass] = React.useState<BackgroundClass>('bg-white');
  const [genderRevealed, setGenderRevealed] = React.useState(false);
  const { width, height } = useWindowSize();
  console.log('currentTurn', currentTurn);

  useEffect(() => {
    const currentTurnRef = ref(realtimeDb, `rooms/${id}/gameState`);

    const unsubCurrentTurn = onValue(currentTurnRef, (snapshot) => {
      const gameState = snapshot.val() as RealtimeGameState;

      console.log('--------- GAME STATE ---------', gameState);

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
      await updateTurn();

      setTimeout(() => {
        setBackgroundClass('bg-white');
      }, 1000);
    } else {
      console.log('Not your turn');
    }
  };

  const updateTurn = async () => {
    const nextTurn = await getNextTurn();

    const roomRef = ref(realtimeDb, `rooms/${id}/gameState`);

    const values: Partial<RealtimeGameState> = {
      currentTurn: nextTurn,
    };

    console.log('updateing turn with values', values);

    await update(roomRef, values);
  };

  const getNextTurn = async (): Promise<Turn> => {
    const turnsRef = ref(realtimeDb, `rooms/${id}/turns`);

    const nextTurnRef = query(
      turnsRef,
      orderByChild('turnId'),
      startAfter(currentTurn?.turnId!),
      limitToFirst(1),
    );

    const nextTurns = await get(nextTurnRef);

    console.log('nextTurns', nextTurns.val());

    console.log('--------------nextTurn-------------', nextTurns.val()[0]);

    return nextTurns.val()[0];
  };

  const handleGenderRevealed = () => {
    if (gender === 'boy') {
      setBackgroundClass('bg-blue-600');
    } else {
      setBackgroundClass('bg-pink-600');
    }
    setGenderRevealed(true);
  };

  return (
    <div
      className={`absolute h-screen w-screen top-0 bottom-0 right-0 left-0 bg-blue ${backgroundClass}`}
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
      <div>
        <TypographyLarge>
          {currentTurn?.playerId === userId
            ? 'Your turn'
            : `Player ${currentTurn?.playerName}'s turn`}
        </TypographyLarge>
      </div>
    </div>
  );
};
//https://www.toptal.com/designers/colourcode/monochrome-color-builder
