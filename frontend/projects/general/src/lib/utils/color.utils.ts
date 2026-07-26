/**
 * Relative luminance is the relative brightness of any point in a colorspace, normalized to 0 for darkest black and 1 for lightest white.
 * @param rgb
 */
export function calculateRelativeLuminance(rgb: {
  r: number;
  g: number;
  b: number;
}): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((color) => {
    const v = color / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function hexToRGB(hexColor: string): {
  r: number;
  g: number;
  b: number;
} {
  if (hexColor.length < 6 || hexColor.length > 7) {
    throw Error('Invalid hex color value');
  }
  let colorString = hexColor;
  if (hexColor.startsWith('#')) {
    colorString = colorString.slice(1);
  }

  return {
    r: Number(`0x${colorString[0]}${colorString[1]}`),
    g: Number(`0x${colorString[2]}${colorString[3]}`),
    b: Number(`0x${colorString[4]}${colorString[5]}`),
  };
}
