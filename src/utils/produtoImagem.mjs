export async function prepararFotoProduto(foto) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(foto.type) || foto.size > 20 * 1024 * 1024) {
    throw new Error("A foto deve ser JPG, PNG ou WebP e ter até 20 MB.");
  }
  const bitmap = await createImageBitmap(foto);
  // ponytail: 2048 px é o teto do catálogo; ampliar caso fotos de impressão precisem de mais detalhe.
  const escala = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let imagem = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
  if (!imagem || imagem.size > 5 * 1024 * 1024) {
    imagem = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.75));
  }
  if (!imagem || !["image/webp", "image/png", "image/jpeg"].includes(imagem.type) || imagem.size > 5 * 1024 * 1024) {
    throw new Error("Não foi possível preparar a foto com até 5 MB.");
  }
  return imagem;
}
