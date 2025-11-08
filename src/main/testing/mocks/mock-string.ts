import { v4 as uuid } from 'uuid';

export const mockTestString = (): string => uuid().slice(0, 6);
