import { createContext, useState, Context, ReactNode } from "react";
import Game from "../types/game";

export interface GamesContextType {
  games: Game[] | [],
  totalGames: number,
  setGames?: (games: Game[]) => void
};

const GamesContext: Context<GamesContextType> = createContext({
  games: [] as Game[],
  totalGames: 0
});

export function GamesContextProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState([] as Game[]);

  function setGamesHandler(games: Game[]) {
    setGames(games);
  };

  const context: GamesContextType = {
    games: games,
    totalGames: games.length,
    setGames: setGamesHandler
  };

  return (
    <GamesContext.Provider value={context}>
      {children}
    </GamesContext.Provider>
  );
};

export default GamesContext;
