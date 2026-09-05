#!/usr/bin/env node
/**
 * Smoke-test the golf scorecard OCR pipeline against the checked-in fixture.
 * Expects Gross Score 118 and course "Jimmy Clay".
 *
 * Run: node --experimental-strip-types scripts/verify-golf-ocr.mjs
 */
import path from "path";
import { fileURLToPath } from "url";
import {
  extractGolfScorecard,
  withGolfOcrSession,
} from "../app/lib/golf-ocr.ts";

const root = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(root, "..", "public", "fixtures", "golf-scorecard.jpg");

const result = await withGolfOcrSession(() =>
  extractGolfScorecard(fixture, "verify:golf-scorecard")
);
console.log(JSON.stringify(result, null, 2));

if (result.grossScore !== 118) {
  console.error(`Expected grossScore 118, got ${result.grossScore}`);
  process.exit(1);
}
if (!result.course || !/jimmy\s*clay/i.test(result.course)) {
  console.error(`Expected course Jimmy Clay, got ${result.course}`);
  process.exit(1);
}

console.log("OK");
process.exit(0);
