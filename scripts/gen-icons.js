// 生成 PWA 占位图标
const fs = require("fs");

[192, 512].forEach((size) => {
  const path = `public/icon-${size}.png`;
  if (fs.existsSync(path)) { console.log(`Skip ${path}`); return; }
  // 纯 JS PNG 生成（绿色 F 字母）
  const { createCanvas } = (() => { try { return require("canvas"); } catch { return {}; } })();
  if (createCanvas) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#22c55e"; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#fff"; ctx.font = `bold ${size*0.5}px sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("F", size/2, size/2);
    fs.writeFileSync(path, canvas.toBuffer("image/png"));
  } else {
    // 最小有效 1x1 绿色 PNG
    fs.writeFileSync(path, Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", "base64"));
  }
  console.log(`Created ${path}`);
});
