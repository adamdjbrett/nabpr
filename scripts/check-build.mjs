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
const postHtml = new Set(metadata.map((file) => path.join(path.dirname(file), "index.html")));

for (const required of ["index.html", "blog/index.html", "feed.xml", "atom.xml", "sitemap.xml", "404.html", "robots.txt", "humans.txt", "credits.txt", "feed/feed.rss", "feed/feed.json", "feed/twtxt.txt", "pagefind/pagefind-component-ui.js", "pagefind/pagefind.js"]) {
  assert(fs.existsSync(path.join(output, required)), `missing ${required}`);
}
const posts = fs.readdirSync("src/posts").filter((file) =>
  file.endsWith(".md") && !/^published:\s*false\s*$/m.test(fs.readFileSync(path.join("src/posts", file), "utf8")));
assert.equal(metadata.length, posts.length, "every post must have metadata.json");
metadata.forEach((file) => JSON.parse(fs.readFileSync(file)));
JSON.parse(fs.readFileSync(path.join(output, "feed/feed.json")));

for (const file of html) {
  const source = fs.readFileSync(file, "utf8");
  assert(!source.includes("{{") && !source.includes("{%"), `unrendered Liquid in ${file}`);
  if (postHtml.has(file)) assert(source.includes('<main id="main"'), `missing post body in ${file}`);
  if (source.includes('<main id="main"')) {
    assert.match(source, /<html[^>]*prefix="[^"]*zotero: http:\/\/www\.zotero\.org\/namespaces\/export#/, `missing Zotero namespace in ${file}`);
    const head = source.match(/<head>([\s\S]*?)<\/head>/)?.[1];
    assert(head, `missing head in ${file}`);
    const meta = new Map([...head.matchAll(/<meta (?:name|property)="([^"]+)"[^>]*? content="([^"]*)"[^>]*>/g)]
      .map(([, name, content]) => [name, content]));
    for (const name of ["DC.title", "DC.creator", "DC.publisher", "DC.description", "DC.type", "DC.format", "DC.identifier", "DC.language", "citation_public_url", "citation_fulltext_html_url", "citation_publisher", "citation_language"]) {
      assert(meta.get(name)?.trim(), `missing ${name} in head of ${file}`);
    }
    assert.equal(meta.get("zotero:itemType"), postHtml.has(file) ? "blogPost" : "webpage", `wrong Zotero type in ${file}`);
    if (postHtml.has(file)) {
      assert.match(source, /<article class="[^"]*\bh-entry\b[^"]*">/, `missing h-entry in ${file}`);
      assert.match(source, /class="[^"]*\be-content\b[^"]*"/, `missing entry content in ${file}`);
      assert.match(source, /<time class="dt-published" datetime="[^"]+">/, `missing publication date in ${file}`);
      const author = source.match(/<span class="p-author h-card"><a class="p-name u-url" rel="author" href="https?:\/\/[^"]+">([^<]+)<\/a><\/span>/)?.[1];
      assert(author, `missing IndieWeb author card in ${file}`);
      assert.equal(meta.get("DC.creator"), author, `Dublin Core author differs from byline in ${file}`);
      assert.equal(meta.get("citation_author"), author, `citation author differs from byline in ${file}`);
      assert(meta.get("DC.date"), `missing Dublin Core date in ${file}`);
      assert(meta.get("citation_publication_date"), `missing citation date in ${file}`);
    }
  }
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
