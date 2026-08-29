#!/usr/bin/env node
/* eslint-env node */
/**
 * Generate PNG assets from SVG sources (v3 - Optical Sizing)
 * Uses native macOS tools (qlmanage) to convert SVG to PNG
 *
 * v3 implements optical sizing: small targets use size-specific SVG variants
 * with adjusted stroke weights and simplified geometry for improved legibility.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

const assets = [
  // App icons (base geometry for large sizes)
  { input: 'plumb-line-icon-light.svg', output: 'icon.png', size: 1024 },
  { input: 'plumb-line-icon-light.svg', output: 'android-icon-foreground.png', size: 432 },
  { input: 'plumb-line-icon-light.svg', output: 'android-icon-background.png', size: 432 },
  { input: 'plumb-line-monochrome.svg', output: 'android-icon-monochrome.png', size: 432 },

  // Splash icons
  { input: 'plumb-line-splash-light.svg', output: 'splash-icon.png', size: 200 },

  // Favicon (v3 optical size variant for legibility)
  { input: 'plumb-line-icon-48px.svg', output: 'favicon.png', size: 48 },
];

console.log('Generating PNG assets from SVG sources...\n');

let successCount = 0;
let errorCount = 0;

assets.forEach(({ input, output, size }) => {
  const inputPath = path.join(assetsDir, input);
  const outputPath = path.join(assetsDir, output);

  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input not found: ${input}`);
    errorCount++;
    return;
  }

  try {
    // Render SVG to PNG at high resolution using qlmanage
    execSync(`qlmanage -t -s ${size * 2} -o "${assetsDir}" "${inputPath}" > /dev/null 2>&1`, {
      stdio: 'pipe',
    });

    // Find the generated file (qlmanage appends .png to the name)
    const generatedPath = `${inputPath}.png`;

    if (fs.existsSync(generatedPath)) {
      // Resize to target size and optimize using sips
      execSync(`sips -z ${size} ${size} "${generatedPath}" --out "${outputPath}" > /dev/null 2>&1`);

      // Clean up qlmanage output
      fs.unlinkSync(generatedPath);

      console.log(`✅ ${output} (${size}×${size})`);
      successCount++;
    } else {
      console.error(`❌ Failed to generate: ${output}`);
      errorCount++;
    }
  } catch (error) {
    console.error(`❌ Error generating ${output}: ${error.message}`);
    errorCount++;
  }
});

console.log(`\nComplete: ${successCount} successful, ${errorCount} errors`);
process.exit(errorCount > 0 ? 1 : 0);
