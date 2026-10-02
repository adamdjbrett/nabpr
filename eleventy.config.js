import fs from "node:fs";
import * as pagefind from "pagefind";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";

const SITE_URL = "https://nabpr.org";

// Kramdown inline attribute lists — `{: .text-right }`, `{: #toc }` — are still all over the
// content, so attributes are allow-listed to keep the leading colon out of the rendered tag.
const ALLOWED_ATTRIBUTES = ["id", "class", "colspan", "rowspan", "start", "reversed", /^data-.+$/];

// Sixteen years of hand-typed categories reduce to the six surfaces the site actually publishes.
const BUCKETS = [
  ["job", /\b(job|jobs|position|hiring|lecturer|professorship|employment)\b/],
  ["cfp", /\b(cfp|calls? for papers?|calls? for proposals?)\b/],
  ["book", /\b(book|books|volume|monograph|baptist identities)\b/],
  ["dissertation", /\b(dissertation|scholarship|scholarships|postdoc|fellow|fellowship)\b/],
  ["meeting", /\b(meeting|meetings|program|schedule|conference|regional|registration|session)\b/],
];
const BUCKET_LABELS = {
  job: "Position",
  cfp: "Call for papers",
  book: "Book",
  dissertation: "Scholarship",
  meeting: "Meeting",
  news: "Announcement",
};
// The chips, in the order they are shown, and the archive page each one filters.
const BUCKET_PAGES = [
  { bucket: "news", slug: "announcements", label: "Announcements" },
  { bucket: "cfp", slug: "calls-for-papers", label: "Calls for papers" },
  { bucket: "job", slug: "positions", label: "Positions" },
  { bucket: "book", slug: "books", label: "Books" },
  { bucket: "meeting", slug: "meetings", label: "Meetings" },
  { bucket: "dissertation", slug: "scholarships", label: "Scholarships" },
];
const PEOPLE = /\b(fellow|postdoc|recipient|festschrift|memoriam|honou?r of|award)\b/i;
// One-off redirects that have no `redirect_from` page to hang off.
const EXTRA_REDIRECTS = [
  { from: "/news/", to: "/blog/" },
  { from: "/feed/", to: "/feed.xml" },
];

const fields = (item) => {
  const data = item?.data ?? item ?? {};
  const categories = Array.isArray(data.categories) ? data.categories : [data.categories];
  return [...categories, data.subheadline, data.title].filter(Boolean).join(" ").toLowerCase();
};
const bucketOf = (item) => {
  const text = fields(item);
  return BUCKETS.find(([, pattern]) => pattern.test(text))?.[0] ?? "news";
};

export default function (eleventyConfig) {
  eleventyConfig.amendLibrary("md", (md) => {
    md.use(markdownItAttrs, { allowedAttributes: ALLOWED_ATTRIBUTES });
    md.use(markdownItAnchor, { level: [2, 3], tabIndex: false, permalink: false });
  });

  ["assets", "images", "wp-content", "pdfs"].forEach((path) =>
    eleventyConfig.addPassthroughCopy(`src/${path}`),
  );

  // Search index, rebuilt after every build — `build` and `serve` alike, so dev search works.
  eleventyConfig.on("eleventy.after", async ({ dir }) => {
    const { index } = await pagefind.createIndex();
    await index.addDirectory({ path: dir.output });
    await index.writeFiles({ outputPath: `${dir.output}/pagefind` });
    await pagefind.close();
  });

  const posts = (api) =>
    api
      .getFilteredByGlob("./src/posts/*.md")
      .filter((item) => item.data.published !== false)
      .sort((a, b) => b.date - a.date);
  eleventyConfig.addCollection("posts", posts);
  // One archive page per chip, so the blog filter works across all 138 entries and not just
  // whichever ten happen to be on the current page.
  eleventyConfig.addCollection("bucketPages", (api) => {
    const all = posts(api);
    return BUCKET_PAGES.map((page) => ({
      ...page,
      posts: all.filter((post) => bucketOf(post) === page.bucket),
    })).filter((page) => page.posts.length);
  });
  eleventyConfig.addCollection("redirects", (api) => {
    const all = api.getAll();
    const canonical = new Set(all.map((item) => item.url?.replace(/index\.html$/, "")));
    const fromPages = all.flatMap((item) => {
      const from = item.data.redirect_from;
      return (Array.isArray(from) ? from : from ? [from] : [])
        .filter((path) => !canonical.has(path.replace(/index\.html$/, "")))
        .map((path) => ({ from: path, to: item.url }));
    });
    const seen = new Set(fromPages.map((entry) => entry.from));
    return [
      ...fromPages,
      ...EXTRA_REDIRECTS.filter(
        (entry) => !seen.has(entry.from) && !canonical.has(entry.from.replace(/index\.html$/, "")),
      ),
    ];
  });
  eleventyConfig.addGlobalData("generator", () => {
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    return `Build Awesome ${pkg.devDependencies["@awesome.me/buildawesome"]}`;
  });
  eleventyConfig.addGlobalData("pdfFiles", () =>
    fs.readdirSync("src/pdfs", { recursive: true })
      .filter((file) => file.toLowerCase().endsWith(".pdf"))
      .map((file) => ({ name: file.split("/").at(-1), url: `/pdfs/${file}` }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  );

  eleventyConfig.addFilter("absolute_url", (value = "") =>
    /^https?:\/\//.test(value) ? value : `${SITE_URL}${value.startsWith("/") ? "" : "/"}${value}`,
  );
  eleventyConfig.addFilter("encode_email", (value = "") =>
    [...value].map((char) => `&#${char.charCodeAt(0)};`).join(""),
  );
  eleventyConfig.addFilter("xml_escape", (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;"),
  );
  eleventyConfig.addFilter("date_iso", (value) => new Date(value).toISOString());
  eleventyConfig.addFilter("date_rfc", (value) => new Date(value).toUTCString());
  eleventyConfig.addFilter("category", (items = [], name = "") =>
    items.filter((item) =>
      (Array.isArray(item.data.categories) ? item.data.categories : [item.data.categories])
        .filter(Boolean)
        .some((category) => String(category).toLowerCase().includes(name.toLowerCase())),
    ),
  );
  // `toc: true` in front matter builds the list from the headings Eleventy already rendered,
  // so the page keeps one source of truth and old `#toc` links keep landing somewhere real.
  eleventyConfig.addFilter("toc", (content = "") => {
    const items = [...String(content).matchAll(/<h([23])\b[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi)]
      .map(([, level, id, label]) => ({
        level: Number(level),
        id,
        label: label.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
      }))
      .filter((item) => item.label);
    if (items.length < 2) return "";
    const rows = items.map(
      (item) => `<li class="toc__item toc__item--h${item.level}"><a href="#${item.id}">${item.label}</a></li>`,
    );
    return `<nav class="toc" id="toc" aria-labelledby="toc-heading"><h2 class="label" id="toc-heading">Table of contents</h2><ol class="toc__list">${rows.join("")}</ol></nav>`;
  });
  eleventyConfig.addFilter("short_date", (value) =>
    new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(value)),
  );
  eleventyConfig.addFilter("bucket_label", (name) => BUCKET_LABELS[name] ?? "News");
  eleventyConfig.addFilter("bucket", (item) => bucketOf(item));
  eleventyConfig.addGlobalData("bucketChips", () => BUCKET_PAGES);
  eleventyConfig.addFilter("people", (items = []) => items.filter((item) => PEOPLE.test(fields(item))));
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  // JSON-LD `sameAs`: external profile links only — drops in-site entries like
  // socialmedia.json's Contact/Give rows, which point at relative paths, not profiles.
  eleventyConfig.addFilter("same_as_urls", (items = []) =>
    (items || []).filter((item) => /^https?:\/\//.test(item?.url ?? "")).map((item) => item.url),
  );
  eleventyConfig.addFilter("readable_date", (value) =>
    new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(value)),
  );

  return {
    dir: { input: "src", includes: "_includes", layouts: "_includes/layouts", data: "../_data", output: "_site" },
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
    templateFormats: ["md", "html", "liquid"],
  };
}
