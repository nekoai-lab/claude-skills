// 正方形PNGソースから複数解像度の favicon.ico を生成する（macOS: sips でリサイズ）。
// 使い方: node scripts/make-favicon.mjs <square-source.png> <out.ico>
// 例:     node scripts/make-favicon.mjs public/assets/logo/icon-512.png public/favicon.ico
// 収録サイズは 16 / 32 / 48（Google の最小要件 48px を満たす）。
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [src, out = 'public/favicon.ico'] = process.argv.slice(2);
if (!src) {
  console.error('Usage: node scripts/make-favicon.mjs <square-source.png> [out.ico]');
  process.exit(1);
}

const sizes = [16, 32, 48];
const tmp = mkdtempSync(join(tmpdir(), 'favicon-'));

try {
  const pngs = sizes.map((s) => {
    const p = join(tmp, `${s}.png`);
    // sips は macOS 標準。Linux 等では sharp / imagemagick に置き換える。
    execFileSync('sips', ['-z', String(s), String(s), src, '--out', p], { stdio: 'ignore' });
    return { size: s, buf: readFileSync(p) };
  });

  // ICO ヘッダ(6) + ディレクトリ(16*n) + 各PNGデータ（PNG をそのまま埋め込む形式）
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(pngs.length, 4);

  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach((p, i) => {
    const b = i * 16;
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, b + 0); // width
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, b + 1); // height
    dir.writeUInt8(0, b + 2); // palette
    dir.writeUInt8(0, b + 3); // reserved
    dir.writeUInt16LE(1, b + 4); // color planes
    dir.writeUInt16LE(32, b + 6); // bits per pixel
    dir.writeUInt32LE(p.buf.length, b + 8); // data size
    dir.writeUInt32LE(offset, b + 12); // data offset
    offset += p.buf.length;
  });

  writeFileSync(out, Buffer.concat([header, dir, ...pngs.map((p) => p.buf)]));
  console.log(`Wrote ${out} (${sizes.join(', ')}px)`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
