export default {
  eleventyComputed: {
    layout: "article.liquid",
    permalink: (data) => data.permalink || `/${data.page.fileSlug.replace(/^\d{4}-\d{2}-\d{2}[.-]?/, "")}/`,
  },
};
