export function shuffleList<T>(list: T[]): T[] {
  let shuffledList = [...list];
  for (let i = list.length - 1; i > 0; i--) {
    const j = randomIntegerFromInterval(0, i);
    shuffledList = swap(shuffledList, i, j);
  }
  return shuffledList;
}

const randomIntegerFromInterval = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const swap = <T>(list: T[], i: number, j: number): T[] => {
  const temp = list[i];
  list[i] = list[j];
  list[j] = temp;
  return list;
}
