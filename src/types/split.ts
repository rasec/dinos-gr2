export default interface Split {
  id: number,
  name: string,
  order: number
};

export type SplitHit = { 
  name: string,
  clip?: string,
  date?: Date 
};