
export enum GamePhase {
  LOBBY = 'LOBBY',
  CHAR_SELECT = 'CHAR_SELECT',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER'
}

export interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  specialAbility: string;
  initialCorruption: number;
  initialInfluence: number;
}

export interface GameState {
  votes: number;
  fakeVotes: number;
  money: number;
  corruptionLevel: number;
  publicSupport: number;
  day: number;
  activeCharacter: Character | null;
  newsLog: string[];
  timeLeft: number;
  hasWon: boolean | null;
}

export interface SatireDialogue {
  characterId: string;
  text: string;
  impact: {
    votes?: number;
    money?: number;
    corruption?: number;
    support?: number;
  };
}
