import { createContext, useState } from "react";

const GamesContext = createContext({
  games: [],
  totalGames: 0,
  setGames: (games) => {}
});

export function GamesContextProvider({ children }) {
  const [games, setGames] = useState([]);

  function setGamesHandler(games) {
    setGames(games);
  };

  const context = {
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
