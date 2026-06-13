<div align="center">
  <img src="assets/favicon.svg" alt="JL" width="76" height="76">
  <h1>Jim Li</h1>
  <p><em>Personal site · Engineering Director, Trading Systems</em></p>
</div>

A fast, single-page personal site built with Jekyll. All content is data-driven
from one file, and the HTML and CSS are minified at build time.

## Develop

```bash
bundle install
bundle exec jekyll serve
```

Then open http://127.0.0.1:4000.

## Structure

| Path | Purpose |
| --- | --- |
| `_data/resume.yml` | All content; the single source of truth |
| `_layouts/default.html` | Page shell (head, nav, footer) |
| `_layouts/compress.html` | HTML minifier applied at build |
| `_includes/` | Reusable snippets: `email.html`, `extlink.html` |
| `assets/css/style.scss` | Styling, compiled and minified by Jekyll Sass |
| `assets/js/main.js` | Scroll reveal, sticky nav, email assembly, link confirm |
| `assets/favicon.svg` | The `JL_` mark |

To edit the site's content, change `_data/resume.yml`. No templates required.

## Notes

- **Email** addresses are assembled client-side, so no scrapeable address ships in the HTML.
- **External links** require a deliberate double-click to open.

## License

© Jim Li. All rights reserved.
