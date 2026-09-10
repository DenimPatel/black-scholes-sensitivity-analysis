#!/usr/bin/env node
// Renders one MP3 per lesson in content/narration/*.txt into public/audio/*.mp3
// using Piper TTS (https://github.com/OHF-Voice/piper1-gpl) — free, open-source,
// runs fully offline, no per-character API cost.
//
// One-time setup:
//   pip install piper-tts
//   python3 -m piper.download_voices en_US-lessac-medium
// (swap the voice name for any other from https://github.com/OHF-Voice/piper1-gpl/blob/main/VOICES.md)
//
// Also needs ffmpeg on PATH to convert Piper's WAV output to MP3
// (`apt install ffmpeg` / `brew install ffmpeg`).
//
// Run whenever narration text changes:
//   npm run generate-audio

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const narrationDir = join(root, 'content', 'narration');
const audioDir = join(root, 'public', 'audio');
const voice = process.env.PIPER_VOICE || 'en_US-lessac-medium';

mkdirSync(audioDir, { recursive: true });

const scripts = readdirSync(narrationDir).filter((f) => f.endsWith('.txt'));
if (scripts.length === 0) {
  console.error(`No narration scripts found in ${narrationDir}`);
  process.exit(1);
}

for (const file of scripts) {
  const id = basename(file, '.txt');
  const text = readFileSync(join(narrationDir, file), 'utf8');
  const wavPath = join(audioDir, `${id}.wav`);
  const mp3Path = join(audioDir, `${id}.mp3`);

  console.log(`Synthesizing ${id}...`);
  execFileSync('python3', ['-m', 'piper', '--model', voice, '--output_file', wavPath], {
    input: text,
    stdio: ['pipe', 'inherit', 'inherit'],
  });

  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wavPath, '-codec:a', 'libmp3lame', '-qscale:a', '4', mp3Path]);
  rmSync(wavPath);
  console.log(`  -> public/audio/${id}.mp3`);
}

console.log(`\nDone. Generated ${scripts.length} narration file(s) in public/audio/.`);
