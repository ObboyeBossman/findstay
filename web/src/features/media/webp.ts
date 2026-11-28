import { MAX_UPLOAD_BYTES } from './validation';

export type WebpConversionOptions = {
  maxDimension?: number;
  quality?: number;
};

/**
 * Converts a browser image File (JPEG/PNG/WebP) to an optimised WebP File via Canvas (`S1-09-T6`,
 * `NFR-17`) so mobile 3G uploads stay compact while remaining under the 5 MB hard cap.
 */
export async function convertImageToWebp(
  file: File,
  options: WebpConversionOptions = {},
): Promise<File> {
  const maxDimension = options.maxDimension ?? 1600;
  const quality = options.quality ?? 0.82;

  // If already a compact WebP, keep original bytes to avoid re-encoding artifacts.
  if (file.type === 'image/webp' && file.size <= 350 * 1024) {
    return file;
  }

  const bitmap = await loadImageElement(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.naturalWidth, bitmap.naturalHeight, 1));
  const width = Math.max(1, Math.round(bitmap.naturalWidth * scale));
  const height = Math.max(1, Math.round(bitmap.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  const webpBlob = await canvasToBlob(canvas, 'image/webp', quality);
  if (!webpBlob || webpBlob.type !== 'image/webp') {
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo';
  const converted = new File([webpBlob], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });

  if (converted.size > MAX_UPLOAD_BYTES) {
    const compressedBlob = await canvasToBlob(canvas, 'image/webp', 0.65);
    if (compressedBlob) {
      return new File([compressedBlob], `${baseName}.webp`, {
        type: 'image/webp',
        lastModified: Date.now(),
      });
    }
  }

  return converted;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Unable to read image "${file.name}".`));
    };
    img.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}
