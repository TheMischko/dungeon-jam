export interface Tag {
  title: string;
  color?: string;
}

export interface TagData extends Tag {
  id: string;
}
