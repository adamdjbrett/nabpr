
## 2019-04-20 // Version 1.1
  - categories and tags pages
  - Add custom SASS
  - integrate categories and tags pages from @mmistakes Jekyll Skinny Bones
  - Move `page-meta` from `_sass/_07_layout.scss` to own custom file.
  ````
  /* Page Meta
  -------------------------------------------------------------------
  */
  .page-meta {
    p{
      @include font-size(14,no);
      font-family: $alt-font;
      color: lighten($black,60);
      }
    }
  ````
  - ~~google analytics, search, bing, etc.~~
  - ~~convert html to markdown~~
  - fix javascript.js to be most current version.
    - `javascript.js` included an outdated `jQuery` library.
    - - conclusion: Foundation JS and CSS need to be updated to Foundation 6
    - ~~I split up the `javascript.js` file~~
  - ~~why isn't mobile header showing name?~~
  - ~~speedup lunr~~
  - ~~fix thumbnails and header images not working~~
  - ~~disable `urlimg`~~
  - ~~fix homepage~~
  - ~~Need to fix search page~~
  - ~~fix sidebar of blog~~
## 2019-04-17 // Version 1.0
: After WordPress continually crashed under the weight of the site I moved it to the Jekyll Static Site Generator.
