const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MASTER_ICON_PATH = path.join(__dirname, '../public/icon-master.png');
const PUBLIC_ICONS_DIR = path.join(__dirname, '../public/icons');
const APP_DIR = path.join(__dirname, '../app');

async function generateIcons() {
    if (!fs.existsSync(MASTER_ICON_PATH)) {
        console.error('Master icon not found at:', MASTER_ICON_PATH);
        process.exit(1);
    }

    if (!fs.existsSync(PUBLIC_ICONS_DIR)) {
        fs.mkdirSync(PUBLIC_ICONS_DIR, { recursive: true });
    }

    console.log('Generating icons...');

    // Generate 192x192 (PWA)
    await sharp(MASTER_ICON_PATH)
        .resize(192, 192)
        .toFile(path.join(PUBLIC_ICONS_DIR, 'icon-192x192.png'));
    console.log('Created public/icons/icon-192x192.png');

    // Generate 512x512 (PWA)
    await sharp(MASTER_ICON_PATH)
        .resize(512, 512)
        .toFile(path.join(PUBLIC_ICONS_DIR, 'icon-512x512.png'));
    console.log('Created public/icons/icon-512x512.png');

    // Next.js App Directory icons (auto-generated sizes)
    // Copy master to app/icon.png (Next.js uses this for favicon generally)
    await sharp(MASTER_ICON_PATH)
        .resize(512, 512) // Ensure it's a good size
        .toFile(path.join(APP_DIR, 'icon.png'));
    console.log('Created app/icon.png');

    // Copy master to app/apple-icon.png
    await sharp(MASTER_ICON_PATH)
        .resize(180, 180)
        .toFile(path.join(APP_DIR, 'apple-icon.png'));
    console.log('Created app/apple-icon.png');

    console.log('Icon generation complete!');
}

generateIcons().catch(console.error);
