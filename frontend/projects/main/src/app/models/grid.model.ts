export interface GridItemSizeConfig {
  imageSize: number;
  titleSize: number;
  titleBold?: boolean;
  showTags?: boolean;
}

export const HugeSizeGridItemConfig: GridItemSizeConfig = {
  imageSize: 250,
  titleSize: 18,
  titleBold: true,
  showTags: true,
};

export const BigSizeGridItemConfig: GridItemSizeConfig = {
  imageSize: 175,
  titleSize: 16,
  titleBold: true,
  showTags: true,
};

export const MediumSizeGridItemConfig: GridItemSizeConfig = {
  imageSize: 150,
  titleSize: 14,
  titleBold: true,
  showTags: false,
};

export const SmallSizeGridItemConfig: GridItemSizeConfig = {
  imageSize: 100,
  titleSize: 12,
  titleBold: false,
  showTags: false,
};
