/**
 * Scales an image to fit within a 200x200 square, centers it,
 * and returns it as a PNG Blob or Data URI with transparency.
 *
 * @param {Blob} imageFile The image file (PNG or JPG) as a Blob.
 * @param {boolean} returnAsBlob If true, returns a Blob; otherwise, returns a Data URI.
 * @returns {Promise<Blob|string>} A Promise that resolves with the processed image as a Blob or Data URI.
 * Rejects if the image cannot be loaded or processed.
 */
export default function scaleLogoImg(imageFile, returnAsBlob) {
	const CANVAS_SIZE = 200; // Target square size

	return new Promise((resolve, reject) => {
		const img = new Image();
		const reader = new FileReader();

		reader.onload = (e) => {
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = CANVAS_SIZE;
				canvas.height = CANVAS_SIZE;
				const ctx = canvas.getContext('2d');

				if (!ctx) {
					return reject(new Error('Could not get 2D rendering context for canvas.'));
				}

				// Set image smoothing to true for better quality scaling
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = 'high';

				// Fill the canvas with a transparent background (default behavior of canvas)
				ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

				// Calculate scaling factor to fit image within 200x200
				const aspectRatio = img.width / img.height;
				let newWidth = CANVAS_SIZE;
				let newHeight = CANVAS_SIZE;

				if (img.width > img.height) {
					// Image is wider than it is tall (or square)
					newHeight = CANVAS_SIZE / aspectRatio;
				} else if (img.height > img.width) {
					// Image is taller than it is wide
					newWidth = CANVAS_SIZE * aspectRatio;
				}
				// If the original image is smaller than CANVAS_SIZE in both dimensions,
				// the calculated newWidth/newHeight will be larger than img.width/img.height.
				// We need to ensure it fits *within* 200x200, so we scale down if it exceeds.
				// The above logic effectively scales one dimension to CANVAS_SIZE and the other proportionally.
				// Now, ensure the scaled dimensions don't exceed CANVAS_SIZE if the original was very small.
				if (newWidth > CANVAS_SIZE) newWidth = CANVAS_SIZE;
				if (newHeight > CANVAS_SIZE) newHeight = CANVAS_SIZE;

				// Ensure the scaled dimensions maintain aspect ratio and fit
				const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
				const scaledWidth = img.width * scale;
				const scaledHeight = img.height * scale;

				// Calculate position to center the image
				const x = (CANVAS_SIZE - scaledWidth) / 2;
				const y = (CANVAS_SIZE - scaledHeight) / 2;

				// Draw the image onto the canvas
				// drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
				// sx, sy, sWidth, sHeight: source image coordinates and dimensions (entire image)
				// dx, dy, dWidth, dHeight: destination canvas coordinates and dimensions
				ctx.drawImage(img, 0, 0, img.width, img.height, x, y, scaledWidth, scaledHeight);

				if (returnAsBlob) {
					canvas.toBlob((blob) => {
						if (blob) {
							resolve(blob);
						} else {
							reject(new Error('Failed to create Blob from canvas.'));
						}
					}, 'image/png'); // Output as PNG
				} else {
					resolve(canvas.toDataURL('image/png')); // Output as Data URI
				}
			};

			img.onerror = () => {
				reject(new Error('Failed to load image.'));
			};

			img.src = e.target.result; // Use data URL from FileReader
		};

		reader.onerror = () => {
			reject(new Error('Failed to read file.'));
		};

		reader.readAsDataURL(imageFile); // Read the Blob as a Data URL
	});
}