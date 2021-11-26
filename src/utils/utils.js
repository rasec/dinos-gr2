export const successRunFilter = (run) => {
  return (!run.includesHit);
};

export const calculateSuccessRate = ({ successfulRuns, totalRuns }) => {
  if(!successfulRuns || totalRuns.length === 0) {
    return 0;
  }
  return Math.round((successfulRuns.length / totalRuns.length) * 10000) / 100;
};

export const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
  }, {});
};