import { rmSync } from "node:fs";
import { join } from "node:path";

// Next.js can leave development-only generated types behind after `next dev`.
// Removing only that disposable cache keeps local and hosted builds consistent.
rmSync(join(process.cwd(), ".next", "dev", "types"), {
  recursive: true,
  force: true,
});
