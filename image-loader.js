(() => {
  const decodeImage = async (image) => {
    const parts = image.dataset.imageParts.split(',');
    const responses = await Promise.all(parts.map((part) => fetch(part)));
    if (responses.some((response) => !response.ok)) return;

    const encoded = (await Promise.all(responses.map((response) => response.text()))).join('');
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);

    const objectUrl = URL.createObjectURL(new Blob([bytes], { type: image.dataset.imageType }));
    image.addEventListener('load', () => URL.revokeObjectURL(objectUrl), { once: true });
    image.loading = 'eager';
    image.src = objectUrl;
  };

  document.querySelectorAll('img[data-image-parts]').forEach((image) => {
    decodeImage(image).catch(() => {});
  });
})();
