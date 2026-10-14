# Premier Property (Central) — website templates

Draft website templates for Premier Property (Central), published with GitHub Pages.
They follow the client's brief: a few clean pages, a page for every development
showing what is for sale, and separate current and completed developments.

**Live gallery:** https://cads-ltd.github.io/hardwick-construction/

| # | Template | Concept |
|---|----------|---------|
| 01 | [Heritage](templates/01-heritage/) | Editorial, with ivory, navy and antique gold and serif headings. Includes the interactive [Plots page](templates/01-heritage/plots.html) |
| 01B | [Heritage B](templates/01b-heritage-b/) | Heritage with the interactive site plan, house types and plot table on each development page instead of a separate Plots page |
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
- **Interactive plots page (Heritage):** a development with `houseTypes` and `sitePlan`
  (see Brunt Lane) gets a hover-able site plan at `plots.html?site=<slug>`. Each plot's
  `houseType` letter links it to its house type, and `sitePlan.hotspots` outlines each
  house on the plan image in pixel coordinates.
- **House type pages (Heritage):** `house-type.html?site=<slug>&type=<letter>` shows a house
  type's details, floor plan images, room sizes, availability and a PDF download. Clicking a
  home on the plots page opens it. Floor plan images go in `assets/img/` and PDFs in
  `assets/docs/`, referenced from the house type's `plans` and `pdf` fields.

All developments, plots, prices and photos are **sample content**. The photos are from
[Unsplash](https://unsplash.com/license) and will be replaced with Premier Property's own.

## Running locally

```sh
npx http-server -p 8000
# open http://localhost:8000/
```

## Deployment

GitHub Pages serves the `gh-pages` branch. `.github/workflows/pages.yml` copies `main` to
`gh-pages` on every push to `main`, so the live site updates within a minute or two.
