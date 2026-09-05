import { createHash } from "crypto";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import sharp from "sharp";

export interface GolfOcrResult {
  grossScore: number | null;
  course: string | null;
}

type CachedGolfOcrResult = GolfOcrResult & {
  cachedAt: string;
  source: string;
};

const SCORE_THRESHOLDS = [120, 118, 122, 110, 125];
const MIN_SCORE = 59;
const MAX_SCORE = 160;

type TesseractWorker = Awaited<ReturnType<typeof import("tesseract.js").createWorker>>;

let workerPromise: Promise<TesseractWorker> | null = null;

async function getWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      return await createWorker("eng");
    })();
  }
  return workerPromise;
}

async function terminateWorker(): Promise<void> {
  if (!workerPromise) return;
  const pending = workerPromise;
  workerPromise = null;
  try {
    const worker = await pending;
    await worker.terminate();
  } catch {
    // ignore terminate races
  }
}

/** Run a batch of OCR calls, then shut down the shared Tesseract worker. */
export async function withGolfOcrSession<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } finally {
    await terminateWorker();
  }
}

async function resolveCacheDir(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), ".cache", "golf-ocr"),
    path.join(tmpdir(), "digital-pulse-golf-ocr"),
  ];

  for (const dir of candidates) {
    try {
      await fs.mkdir(dir, { recursive: true });
      const probe = path.join(dir, ".write-probe");
      await fs.writeFile(probe, "ok");
      await fs.unlink(probe);
      return dir;
    } catch {
      // try next candidate
    }
  }

  throw new Error("No writable OCR cache directory");
}

function cacheKeyFor(source: string): string {
  return createHash("sha256").update(source).digest("hex").slice(0, 32);
}

async function readCache(key: string): Promise<CachedGolfOcrResult | null> {
  try {
    const dir = await resolveCacheDir();
    const raw = await fs.readFile(path.join(dir, `${key}.json`), "utf8");
    return JSON.parse(raw) as CachedGolfOcrResult;
  } catch {
    return null;
  }
}

async function writeCache(
  key: string,
  result: GolfOcrResult,
  source: string
): Promise<void> {
  try {
    const dir = await resolveCacheDir();
    const payload: CachedGolfOcrResult = {
      ...result,
      cachedAt: new Date().toISOString(),
      source,
    };
    await fs.writeFile(
      path.join(dir, `${key}.json`),
      JSON.stringify(payload, null, 2)
    );
  } catch (err) {
    console.warn(
      `Golf OCR cache write failed: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
}

async function loadImage(source: string | Buffer): Promise<Buffer> {
  if (Buffer.isBuffer(source)) return source;

  if (/^https?:\/\//i.test(source)) {
    const res = await fetch(source);
    if (!res.ok) {
      throw new Error(`Failed to download scorecard image: ${res.status}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  return fs.readFile(source);
}

async function recognizeText(image: Buffer): Promise<string> {
  const worker = await getWorker();
  const {
    data: { text },
  } = await worker.recognize(image);
  return text;
}

function parseScore(text: string): number | null {
  const grossIdx = text.search(/Gross\s*Score/i);
  const searchIn = grossIdx >= 0 ? text.slice(0, grossIdx) : text;
  const nums = [...searchIn.matchAll(/\b(\d{2,3})\b/g)].map((m) =>
    Number(m[1])
  );
  const plausible = nums.filter((n) => n >= MIN_SCORE && n <= MAX_SCORE);
  if (plausible.length > 0) return plausible[plausible.length - 1];

  // Fallback: any plausible golf total in the full region text.
  const all = [...text.matchAll(/\b(\d{2,3})\b/g)]
    .map((m) => Number(m[1]))
    .filter((n) => n >= MIN_SCORE && n <= MAX_SCORE);
  return all[0] ?? null;
}

function parseCourse(text: string): string | null {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^\d{4}[/-]\d{1,2}[/-]\d{1,2}$/.test(line))
    .map((line) =>
      line
        .replace(/[^A-Za-z0-9' ./-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((line) => line.length >= 3);

  if (lines.length === 0) return null;

  const counts = new Map<string, number>();
  for (const line of lines) {
    counts.set(line, (counts.get(line) || 0) + 1);
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const [line, count] of counts) {
    if (
      count > bestCount ||
      (count === bestCount && line.length > (best?.length || 0))
    ) {
      best = line;
      bestCount = count;
    }
  }

  return best;
}

async function extractScore(buffer: Buffer): Promise<number | null> {
  const meta = await sharp(buffer).metadata();
  const width = meta.width;
  const height = meta.height;
  if (!width || !height) return null;

  const extract = {
    left: Math.floor(width * 0.15),
    top: Math.floor(height * 0.14),
    width: Math.floor(width * 0.7),
    height: Math.floor(height * 0.28),
  };

  const votes = new Map<number, number>();

  for (const threshold of SCORE_THRESHOLDS) {
    try {
      const region = await sharp(buffer)
        .extract(extract)
        .greyscale()
        .normalize()
        .threshold(threshold)
        .png()
        .toBuffer();
      const text = await recognizeText(region);
      const score = parseScore(text);
      if (score != null) {
        votes.set(score, (votes.get(score) || 0) + 1);
        // Threshold 120 is the known-good setting for these cards — take it
        // immediately when it yields a plausible total.
        if (threshold === 120) return score;
      }
    } catch (err) {
      console.warn(
        `Golf OCR score pass failed (t=${threshold}): ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  let winner: number | null = null;
  let winnerVotes = 0;
  for (const [score, count] of votes) {
    if (count > winnerVotes) {
      winner = score;
      winnerVotes = count;
    }
  }
  return winner;
}

async function extractCourse(buffer: Buffer): Promise<string | null> {
  const meta = await sharp(buffer).metadata();
  const width = meta.width;
  const height = meta.height;
  if (!width || !height) return null;

  const region = await sharp(buffer)
    .extract({
      left: Math.floor(width * 0.04),
      top: Math.floor(height * 0.72),
      width: Math.floor(width * 0.75),
      height: Math.floor(height * 0.26),
    })
    .greyscale()
    .normalize()
    .threshold(140)
    .png()
    .toBuffer();

  const text = await recognizeText(region);
  return parseCourse(text);
}

/**
 * Open-source OCR prototype (Tesseract.js + sharp preprocessing) for the
 * generated scorecard photos Strava attaches to golf activities.
 */
export async function extractGolfScorecard(
  source: string | Buffer,
  cacheKey = typeof source === "string" ? source : cacheKeyFor(source.toString("base64"))
): Promise<GolfOcrResult> {
  const key = cacheKeyFor(cacheKey);
  const cached = await readCache(key);
  if (cached) {
    return { grossScore: cached.grossScore, course: cached.course };
  }

  try {
    const buffer = await loadImage(source);
    const [grossScore, course] = await Promise.all([
      extractScore(buffer),
      extractCourse(buffer),
    ]);
    const result = { grossScore, course };
    await writeCache(
      key,
      result,
      typeof source === "string" ? source : `buffer:${key}`
    );
    return result;
  } catch (err) {
    console.warn(
      `Golf OCR failed: ${err instanceof Error ? err.message : String(err)}`
    );
    return { grossScore: null, course: null };
  }
}
