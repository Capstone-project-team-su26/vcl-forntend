/** URL tuyệt đối tới file trong `public/assets/` — không dùng `./assets/` (lỗi khi route nằm dưới `/pages/...`). */
export function assetUrl(filename) {
  const name = filename.replace(/^\.?\/?assets\//, "");
  return `/assets/${name}`;
}
