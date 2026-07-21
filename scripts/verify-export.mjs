import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

const outputDirectory = join(
  process.cwd(),
  process.env.STATIC_EXPORT_DIRECTORY ?? "out",
);
const nextDirectory = join(process.cwd(), ".next");

const copyDirectoryContents = (source, destination) => {
  mkdirSync(destination, { recursive: true });

  for (const name of readdirSync(source)) {
    cpSync(join(source, name), join(destination, name), {
      recursive: true,
      force: true,
    });
  }
};

const collectFiles = (directory, extension) =>
  readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory()
      ? collectFiles(path, extension)
      : path.endsWith(extension)
        ? [path]
        : [];
  });

const createHostingerExportFallback = () => {
  const pagesDirectory = join(nextDirectory, "server", "pages");
  const staticDirectory = join(nextDirectory, "static");

  if (!existsSync(pagesDirectory) || !existsSync(staticDirectory)) {
    throw new Error(
      "Neither `out` nor the required `.next` static build files were generated.",
    );
  }

  mkdirSync(outputDirectory, { recursive: true });

  const publicDirectory = join(process.cwd(), "public");
  if (existsSync(publicDirectory)) {
    copyDirectoryContents(publicDirectory, outputDirectory);
  }

  cpSync(staticDirectory, join(outputDirectory, "_next", "static"), {
    recursive: true,
    force: true,
  });

  for (const sourceHtml of collectFiles(pagesDirectory, ".html")) {
    const route = relative(pagesDirectory, sourceHtml).replace(/\\/g, "/");
    const routeWithoutExtension = route.slice(0, -".html".length);
    const destinations =
      routeWithoutExtension === "index"
        ? [join(outputDirectory, "index.html")]
        : [
            join(outputDirectory, `${routeWithoutExtension}.html`),
            join(outputDirectory, routeWithoutExtension, "index.html"),
          ];

    for (const destination of destinations) {
      mkdirSync(dirname(destination), { recursive: true });
      copyFileSync(sourceHtml, destination);
    }
  }

  console.log(
    "Hostinger did not emit `out`; assembled it from the complete Next.js build.",
  );
};

if (
  process.env.FORCE_STATIC_EXPORT_FALLBACK === "1" ||
  !existsSync(outputDirectory)
) {
  createHostingerExportFallback();
}

const missingAssets = new Set();
const checkedAssets = new Set();
const htmlFiles = collectFiles(outputDirectory, ".html");
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
