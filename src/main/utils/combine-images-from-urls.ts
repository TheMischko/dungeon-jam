import sharp from 'sharp';

const Gravities2 = ['northwest', 'northeast'];
const Gravities = ['northwest', 'southwest', 'northeast', 'southeast'];

/**
 * Creates a single image combined from up to 4 other images.
 * @param imageUrls Paths to the image files
 * @param size Width and height of the final rectangular image
 */
export const combineImagesFromUrls = async (
  imageUrls: string[],
  size: number = 512
): Promise<string> => {
  const images = imageUrls.slice(0, 4).map((url: string) => {
    return sharp(url).autoOrient();
  });

  const resultImage = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const compositeBuffers: Buffer<ArrayBufferLike>[] = [];

  const length = images.length;
  for (let index = 0; index < length; index++) {
    // Length = 1 -> Width = 512
    // Length = 2 -> Width = 256
    // Length = 3 -> Width = 256
    // Length = 4 -> Width = 256
    const width = length >= 2 ? size / 2 : size;
    // Length = 1 -> Height 512
    // Length = 2 -> Height 512
    // Length = 3 && index != 2 -> 256
    // Length = 3 && index = 2 -> 512
    // Length = 4 -> 256
    const height =
      length === 4 || (length === 3 && index === 2) ? size / 2 : size;
    const resizedImageBuffer = await images[index]
      .resize(width, height, { fit: 'cover' })
      .toBuffer();
    compositeBuffers.push(resizedImageBuffer);
  }

  const compositeBuffer = await resultImage
    .composite(
      compositeBuffers.map((buffer, index) => {
        const gravities = length <= 2 ? Gravities2 : Gravities;
        return { input: buffer, gravity: gravities[index] };
      })
    )
    .jpeg({ quality: 70 })
    .toBuffer();
  const base64 = compositeBuffer.toString('base64');
  return `data:image/jpg;base64,${base64}`;
};
