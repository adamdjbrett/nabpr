import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const output = "_site";
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const files = walk(output);
const html = files.filter((file) => file.endsWith(".html"));
const metadata = files.filter((file) => file.endsWith("metadata.json"));

for (const required of ["index.html", "blog/index.html", "feed.xml", "atom.xml", "sitemap.xml", "404.html", "robots.txt", "humans.txt", "credits.txt", "feed/feed.rss", "feed/feed.json", "feed/twtxt.txt", "pagefind/pagefind-component-ui.js", "pagefind/pagefind.js"]) {
  assert(fs.existsSync(path.join(output, required)), `missing ${required}`);
}
assert.equal(metadata.length, 138, "every post must have metadata.json");
metadata.forEach((file) => JSON.parse(fs.readFileSync(file)));
JSON.parse(fs.readFileSync(path.join(output, "feed/feed.json")));

for (const file of html) {
  const source = fs.readFileSync(file, "utf8");
  assert(!source.includes("{{") && !source.includes("{%"), `unrendered Liquid in ${file}`);
  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1].split(/[?#]/)[0];
    if (!url.startsWith("/") || url.startsWith("//")) continue;
    const target = path.join(output, decodeURIComponent(url));
    assert(
      fs.existsSync(target) && (fs.statSync(target).isFile() || fs.existsSync(path.join(target, "index.html"))),
      `missing internal target ${url} from ${file}`,
    );
  }
}

console.log(`checked ${html.length} HTML files and ${metadata.length} post metadata files`);
