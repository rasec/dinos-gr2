import Split from './split';

export default interface Game {
  id: number,
  name: string,
  acronym: string,
  splits: Split[]
};
