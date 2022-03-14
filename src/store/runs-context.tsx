import { createContext, Context, useState, ReactNode } from "react";

import Run from "../types/run";

export type RunContextType = {
  runs: Run[],
  totalRuns: number,
  setRuns?: (runs: Run[]) => void
  addRun?: (run: Run) => void
};

const RunsContext: Context<RunContextType> = createContext({
  runs: [] as Run[],
  totalRuns: 0
});

export function RunsContextProvider({ children }: { children: ReactNode }) {
  const [runs, setRuns] = useState<Run[]>([] as Run[]);

  function setRunsHandler(runs: Run[]) {
    setRuns(runs);
  };

  function addRunHandler(run: Run) {
    setRuns((preRuns: Run[]) => preRuns.concat(run));
  };

  const context: RunContextType = {
    runs: runs,
    totalRuns: runs ? runs.length : 0,
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
