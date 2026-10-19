import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./src/App.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('./src/index.css', import.meta.url), 'utf8');
const tailwind = readFileSync(new URL('./tailwind.config.js', import.meta.url), 'utf8');

for (const marker of ['Connections', 'localStorage', 'createObject', 'searchObjects']) {
  if (!app.includes(marker)) throw new Error(`missing App marker: ${marker}`);
}
for (const marker of ['#FBFBFA', '#FEF3C7']) {
  if (!css.includes(marker)) throw new Error(`missing theme marker: ${marker}`);
}
for (const marker of ['Lora', 'Plus Jakarta Sans']) {
  if (!tailwind.includes(marker)) throw new Error(`missing typography marker: ${marker}`);
}
console.log('capacities frontend contract: PASS');
