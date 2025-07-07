// fix-font-paths.js
const fs = require('fs');
const path = require('path');

const root = 'dist/KolbasaWebsite';
const files = fs.readdirSync(root).filter(f => f.endsWith('.ttf'));

// Copy each flattened font into the nested folder Expo expects
files.forEach(file => {
  const match = file.match(/^node_modules@(.+?)Ionicons\.(.+)\.ttf$/);
  if (!match) return; // skip non-Ionicons fonts if any

  const relPath = 'assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/' + file.replace(/^node_modules@.+?@Fonts@/, '');
  const dest = path.join(root, relPath);

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(root, file), dest);
  console.log('✓', relPath);
});
