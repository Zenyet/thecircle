import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, writeFileSync, readFileSync, unlinkSync } from 'fs';
import { build } from 'vite';

function chromeExtensionPlugin() {
  return {
    name: 'chrome-extension',
    async closeBundle() {
      const distDir = resolve(__dirname, 'dist');

      // Build content script separately as IIFE
      await build({
        configFile: false,
        build: {
          outDir: 'dist',
          emptyOutDir: false,
          lib: {
            entry: resolve(__dirname, 'src/content/index.ts'),
            name: 'TheCircle',
            formats: ['iife'],
            fileName: () => 'content.js',
          },
          rollupOptions: {
            output: {
              inlineDynamicImports: true,
              assetFileNames: 'assets/content[extname]',
            },
          },
        },
      });

      // Move style.css to assets/content.css if it exists
      const styleCss = resolve(distDir, 'style.css');
      const contentCss = resolve(distDir, 'assets/content.css');
      if (existsSync(styleCss)) {
        copyFileSync(styleCss, contentCss);
        unlinkSync(styleCss);
      }

      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(distDir, 'manifest.json')
      );

      // Create assets directory
      const assetsDir = resolve(distDir, 'assets');
      if (!existsSync(assetsDir)) {
        mkdirSync(assetsDir, { recursive: true });
      }

      // Copy icons
      [16, 48, 128].forEach((size) => {
        const src = resolve(__dirname, `assets/icon-${size}.png`);
        if (existsSync(src)) {
          copyFileSync(src, resolve(assetsDir, `icon-${size}.png`));
        }
      });

      // Create popup directory and copy files
      const popupDir = resolve(distDir, 'popup');
      if (!existsSync(popupDir)) {
        mkdirSync(popupDir, { recursive: true });
      }
      const popupHtml = readFileSync(resolve(__dirname, 'src/popup/index.html'), 'utf-8');
      writeFileSync(resolve(popupDir, 'index.html'), popupHtml);

      // Copy popup CSS (index.css is the popup CSS based on build order)
      const popupCssSrc = resolve(distDir, 'assets/index.css');
      if (existsSync(popupCssSrc)) {
        copyFileSync(popupCssSrc, resolve(popupDir, 'styles.css'));
      }

      // Create options directory and copy files
      const optionsDir = resolve(distDir, 'options');
      if (!existsSync(optionsDir)) {
        mkdirSync(optionsDir, { recursive: true });
      }
      const optionsHtml = readFileSync(resolve(__dirname, 'src/options/index.html'), 'utf-8');
      writeFileSync(resolve(optionsDir, 'index.html'), optionsHtml);

      // Copy options CSS (index2.css is the options CSS based on build order)
      const optionsCssSrc = resolve(distDir, 'assets/index2.css');
      if (existsSync(optionsCssSrc)) {
        copyFileSync(optionsCssSrc, resolve(optionsDir, 'styles.css'));
      }

      console.log('Chrome extension files copied!');
    },
  };
}

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        'popup/index': resolve(__dirname, 'src/popup/index.ts'),
        'options/index': resolve(__dirname, 'src/options/index.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: (assetInfo) => {
          // Route CSS to correct directories
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
  },
  plugins: [chromeExtensionPlugin()],
});
