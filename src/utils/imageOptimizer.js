/**
 * Client-side utility to scale down and compress images before uploading.
 * 
 * @param {File} file - The original File object from the file input
 * @param {number} maxDimension - The maximum width or height in pixels
 * @param {number} quality - Compression quality between 0.0 and 1.0 (only applies to lossy formats)
 * @returns {Promise<File>} A Promise that resolves to the resized File object, or the original file if resizing is skipped/fails.
 */
export const resizeImage = (file, maxDimension = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    // If it's not an image, resolve with the original file
    if (!file || !file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Skip resizing if image is already within the dimensions
        if (width <= maxDimension && height <= maxDimension) {
          console.log(`[ImageOptimizer] Image ${file.name} is already within limits (${width}x${height}). Skipping resize.`);
          return resolve(file);
        }

        // Calculate aspect-ratio preserving dimensions
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            console.warn('[ImageOptimizer] Failed to get canvas 2d context. Falling back to original file.');
            return resolve(file);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Use the original type, or default to JPEG for optimal space saving
          // We preserve PNG and WebP because they support transparency (important for logos)
          let outputType = file.type;
          if (file.type !== 'image/png' && file.type !== 'image/webp') {
            outputType = 'image/jpeg';
          }

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.warn('[ImageOptimizer] Canvas toBlob returned null. Falling back to original file.');
                return resolve(file);
              }

              const resizedFile = new File([blob], file.name, {
                type: outputType,
                lastModified: Date.now()
              });

              console.log(
                `[ImageOptimizer] Resized ${file.name} (${img.width}x${img.height}, ${(file.size / 1024 / 1024).toFixed(2)} MB) ` +
                `to (${width}x${height}, ${(resizedFile.size / 1024).toFixed(1)} KB)`
              );
              resolve(resizedFile);
            },
            outputType,
            quality
          );
        } catch (canvasErr) {
          console.error('[ImageOptimizer] Canvas resizing failed:', canvasErr);
          resolve(file); // Fallback to original file
        }
      };

      img.onerror = (imgErr) => {
        console.error('[ImageOptimizer] Image loading failed:', imgErr);
        resolve(file); // Fallback to original file
      };

      img.src = event.target.result;
    };

    reader.onerror = (readerErr) => {
      console.error('[ImageOptimizer] FileReader failed:', readerErr);
      resolve(file); // Fallback to original file
    };

    reader.readAsDataURL(file);
  });
};
