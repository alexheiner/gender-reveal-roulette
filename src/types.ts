export type Room = {
  id: string;
  maxPlayers: number;
  active: boolean;
  roomCode: string;
};

export type RealtimeRoom = {
  id: string;
  gameState: RealtimeGameState;
  players: Record<string, Player>;
};

export type RealtimeGameState = {
  ready: boolean;
  active: boolean;
  currentTurn: string | null;
  genderRevealed: boolean;
  revealerId: string | null;
  gender: Gender;
};

export type Gender = 'boy' | 'girl';

export type Player = {
  id: string;
  name: string;
  ready: boolean;
  turnOrder: number;
};
