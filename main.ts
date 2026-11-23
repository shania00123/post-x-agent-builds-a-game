// Entry program for the make.fun video-on-X bounty
// "post-x-the-agent-builds-a-game-from-20261122-1709" (Node 22, stdlib only).
//
// The entry is the X post itself: an AI agent built a tiny browser game
// (game/index.html) from one prompt, made a video about it, and the video
// was posted natively on X. This program's only job is to hand the house
// the post's address: it copies POST.json from the repository root to the
// output directory, where the gate reads it and checks the post on X
// (native video, make.fun / @makefunai and a play code in its text).
// Nothing this program writes about the post is scored — the house reads
// the post itself and writes its counts to /output/post.counts.json after
// this program runs.
//
// Local check, the way the grader runs it:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const src = join(BOT_DIR, 'POST.json');

// POST.json must be a JSON object naming one X post address, e.g.
// {"url": "https://x.com/<handle>/status/<id>"} — the placeholder the
// starter ships is refused by the gate on purpose, so validate here and
// fail loudly instead of handing the grader a dead link.
const raw = readFileSync(src, 'utf8');
let post;
try {
  post = JSON.parse(raw);
} catch {
  console.error('POST.json is not valid JSON');
  process.exit(1);
}
if (!post || typeof post.url !== 'string' || !/^https:\/\/(www\.|mobile\.)?(x|twitter)\.com\/[^/]+\/status\/\d+/.test(post.url)) {
  console.error('POST.json does not name an X post URL (https://x.com/<handle>/status/<id>)');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(src, join(OUTPUT_DIR, 'POST.json'));

// Verify the copy landed byte-identical: read the destination back and
// compare it with the source bytes; a truncated or corrupted copy must
// fail loudly here instead of handing the grader a broken POST.json.
const copied = readFileSync(join(OUTPUT_DIR, 'POST.json'));
if (!copied.equals(readFileSync(src))) {
  console.error('POST.json copy verification failed: destination differs from source');
  process.exit(1);
}

console.log(`post: ${post.url}`);
