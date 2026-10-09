# Hardwick Construction — website templates

Six draft website templates for Hardwick Construction, published with GitHub Pages.
They follow James Hardwick's brief: a few clean pages, a page for every development
showing what is for sale, and separate current and completed developments.

**Live gallery:** https://cads-ltd.github.io/hardwick-construction/

| # | Template | Concept |
|---|----------|---------|
| 01 | [Heritage](templates/01-heritage/) | Editorial, with ivory, navy and antique gold and serif headings |
| 02 | [Minimal](templates/02-minimal/) | Swiss minimalism, with a crisp blue and a tiny yellow accent |
| 03 | [Blueprint](templates/03-blueprint/) | Dark architectural grid, amber highlights and a plot site plan |
| 04 | [Portfolio](templates/04-portfolio/) | Current and previous projects, in the style of Alexander Bruce |
| 05 | [Find Your Home](templates/05-developments/) | A page per development plus a home finder, in the style of Cameron Homes |
| 06 | [Bold Brand](templates/06-bold/) | Confident blue and yellow colour blocking |

Each template has an `index.html` home page and a `development.html?site=<slug>` page.

## Updating content

Every template reads from a single file, [`assets/data/developments.js`](assets/data/developments.js):

- **Mark a home as sold:** change the plot's `status` from `"available"` to `"sold"`.
  The allowed values are `available`, `reserved`, `sold` and `coming-soon`.
- **Finish a development:** change `stage: "current"` to `stage: "completed"` and add `completed: <year>`.
- **Add a development:** copy an existing block, give it a unique `slug` and update the details.
- **Photos:** put them in `assets/img/` and refer to them by file name.

All developments, plots, prices and photos are **sample content**. The photos are from
[Unsplash](https://unsplash.com/license) and will be replaced with Hardwick's own.

## Running locally

```sh
npx http-server -p 8000
# open http://localhost:8000/
```

## Deployment

GitHub Pages serves the `gh-pages` branch. `.github/workflows/pages.yml` syncs that branch
with every push, so the live site updates within a minute or two.
