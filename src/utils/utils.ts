import Run from '../types/run';

export const successRunFilter = (run: Run): boolean => {
  return (!run.includesHit);
};

export const calculateSuccessRate = ({ successfulRuns, totalRuns }: { successfulRuns: Run[], totalRuns: Run[] }): number => {
  if (!successfulRuns || totalRuns.length === 0) {
    return 0;
  }
  return Math.round((successfulRuns.length / totalRuns.length) * 10000) / 100;
};

/* 
  input: 
   - xs: [{ date: 11-02-2021 }, { date: 11-02-2021 }, { date: 12-02-2021 }, { date: 13-02-2021 }, { date: 13-02-2021 }]
   - key: 'splitHit'
  output: {"11-02-2021":[{"date":"11-02-2021"},{"date":"11-02-2021"}],"12-02-2021":[{"date":"12-02-2021"}],"13-02-2021":[{"date":"13-02-2021"},{"date":"13-02-2021"}]}
*/
export const groupBy = function (xs: [], key: string) {
  return xs.reduce(function (rv, x) {
    ((rv[x[key]] = rv[x[key]] || []) as []).push(x);
    return rv;
  }, {});
};


