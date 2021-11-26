import { createContext, useState } from "react";

const RunsContext = createContext({
  runs: [],
  totalRuns: 0,
  setRuns: (runs) => {},
  addRun: (run) => {}
});

export function RunsContextProvider({ children }) {
  const [runs, setRuns] = useState([]);

  function setRunsHandler(runs) {
    setRuns(runs);
  };

  function addRunHandler(run) {
    setRuns((prevFavourites) => prevFavourites.concat(run));
  };

  const context = {
    runs: runs,
    totalRuns: runs.length,
    setRuns: setRunsHandler,
    addRun: addRunHandler
  };

  return (
    <RunsContext.Provider value={context}>
      {children}
    </RunsContext.Provider>
  );
};

export default RunsContext;
