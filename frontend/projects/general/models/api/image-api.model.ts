export type ImageApiWindow = Window &
  typeof globalThis & {
    IMAGE_API: {
      openPicker: () => Promise<string | null>;
      processAndSave: (
        imagePath: string,
        entityType: string
      ) => Promise<string>;
      deleteImage: (imagePath: string) => Promise<void>;
      fetchImage: (imagePath: string) => Promise<string | null>;
    };
  };
