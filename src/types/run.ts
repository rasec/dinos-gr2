export default interface Run {
  _id?: string,
  includesHit: boolean,
  splitHit?: number,
  order: number,
  selectedGame: number,
  partial: boolean,
  startSplit?: number,
  endSplit?: number,
  clip?: string,
  date?: Date
};

export interface DateRuns {
  date?: Date,
  runs: Run[]
};


export interface StatRuns {
  displayText: string,
  runs: Run[]
}

export type RunKeys = 'splitHit' | 'order' | 'selectedGame' | 'startSplit' | 'endSplit' | 'clip' | 'date';
