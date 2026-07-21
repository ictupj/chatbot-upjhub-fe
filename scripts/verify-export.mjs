import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const outputDirectory = join(process.cwd(), "out");

if (!existsSync(outputDirectory)) {
  throw new Error("Static export directory `out` was not generated.");
}

const collectHtmlFiles = (directory) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory()
      ? collectHtmlFiles(path)
      : path.endsWith(".html")
        ? [path]
        : [];
  });

const missingAssets = new Set();
const checkedAssets = new Set();
const htmlFiles = collectHtmlFiles(outputDirectory);
const assetPattern = /(?:src|href)=["'](\/(?:_next|images)\/[^"']+)["']/g;

for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, "utf8");

  for (const match of html.matchAll(assetPattern)) {
    const assetUrl = match[1].split(/[?#]/, 1)[0];
    const assetPath = join(outputDirectory, ...assetUrl.split("/").filter(Boolean));
    checkedAssets.add(assetUrl);

    if (!existsSync(assetPath)) {
      missingAssets.add(assetUrl);
    }
  }
}

if (missingAssets.size > 0) {
  throw new Error(
    `Static export references missing assets:\n${[...missingAssets].join("\n")}`,
  );
}

console.log(
  `Verified ${checkedAssets.size} referenced assets across ${htmlFiles.length} HTML files.`,
);
