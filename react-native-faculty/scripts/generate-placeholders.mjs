import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const assetsDir = join(__dirname, '..', 'assets');

// 1x1 transparent PNG base64
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4mGMAAQAAAQANCit0AAAAAElFTkSuQmCC';

const files = [
  'icon.png',
  'adaptive-icon.png',
  'notification-icon.png',
  'splash.png'
];

if (!existsSync(assetsDir)) mkdirSync(assetsDir, { recursive: true });

for (const f of files) {
  const p = join(assetsDir, f);
  if (!existsSync(p)) {
    writeFileSync(p, Buffer.from(base64Png, 'base64'));
    console.log('Generated placeholder', f);
  }
}

// Also ensure sounds dir exists (already added placeholder wav manually earlier).
const soundsDir = join(assetsDir, 'sounds');
if (!existsSync(soundsDir)) mkdirSync(soundsDir, { recursive: true });
