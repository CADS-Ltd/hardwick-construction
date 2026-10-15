# Premier Property (Central): WordPress build of Heritage B

This is the approved **Heritage B** template rebuilt for WordPress: each development page shows its interactive site plan, house types and every plot. It has two parts:

| Part | Folder | What it does |
|------|--------|--------------|
| **Premier Developments** plugin | `plugins/premier-developments/` | Adds Developments, House types and plots (ACF fields), the interactive site plan, the plot tables and house type pages. Also adds the Elementor widgets, shortcodes, the site plan outliner and the demo importer. |
| **Premier Heritage** theme | `themes/premier-heritage/` | The Heritage design: header, footer and the development, Plots and house type pages. It supports Elementor Pro's Theme Builder. |

Content lives in the plugin, so changing the theme later won't lose any developments or plots.

## Requirements

- WordPress 6.4+ and PHP 8.0+
- **ACF Pro**, which the plots table and gallery need. The free *Secure Custom Fields* plugin also works.
- **Elementor**, used for the home page. **Elementor Pro** is optional and adds the Theme Builder.

## Installing on the live site

1. Install and activate **ACF Pro** and **Elementor** (and Elementor Pro).
2. Upload the zips from `dist/` (Plugins › Add New › Upload, and Appearance › Themes › Add New › Upload):
   - [`premier-developments.zip`](dist/premier-developments.zip): activate it.
   - [`premier-heritage.zip`](dist/premier-heritage.zip): activate it.
3. Go to **Settings › Permalinks** and click **Save**. This switches on the development and house type URLs.
4. **Optional:** **Tools › Premier demo content › Import demo content** loads Brunt Lane, the sample developments, the home page and the menus, with images and PDFs taken from the prototype. Run it on a staging site first. It sets the home page, menus and permalinks.

The ACF field groups load automatically from the plugin (`acf-json/`), so nothing needs importing in ACF.

> Rebuild the zips after changing the code: `./wordpress/build.sh` from the repository root.

## How the client keeps it up to date

All of this is done from the WordPress admin:

| Task | Where |
|------|-------|
| **Mark a home reserved or sold** | **Developments** › open the development › **Plots & site plan** tab › change the **Status** dropdown › **Update**. The plan, tables, counts and "from" prices update everywhere. |
| **Change a price** | Same table: the **Price** column. |
| **Add a plot** | Same table: **Add plot**, then choose its **House type**. |
| **Outline a plot on the site plan** | Under the table, in **Site plan outliner**: click **Draw** next to the plot, click each corner of the house on the plan, then click the first point again. Then **Update**. |
| **Finish a development** | **Overview** tab › **Stage** › *Completed*, and enter the year. It moves to "Completed developments" automatically. |
| **Start a new development** | **Developments › Add new development**. Fill in the Overview tab, then upload the site plan and add plots in the Plots tab. |
| **Add a house type** (with floor plans and PDF) | **Developments › House types › Add new**. Choose its development, add the picture, room sizes, plan images and the PDF. It then appears in that development's plot table. |
| **Phone, email, address, stats** | **Company details** in the admin menu. Used across the whole site. |
| **Home page text and photos** | **Pages › Home › Edit with Elementor**. Each section is a *Premier Property* widget with its own settings. |
| **Menus** | **Appearance › Menus**, with *Main menu* and *Footer menu* locations. |

## Pages and URLs

| Page | URL | Made by |
|------|-----|---------|
| Home | `/` | Elementor page using the Premier widgets |
| Development | `/developments/brunt-lane/` | Theme template (or an Elementor Pro *Single* template) |
| Plots (interactive site plan) | In the **Plots** section of the development page | Theme template. Shown when the development has a site plan image. |
| House type | `/house-types/brunt-lane-type-c/?plot=7` | Theme template (or an Elementor Pro *Single* template) |
| All developments | `/developments/` | Theme template |

## Site pages and the enquiry form

**Tools › Premier demo content › Create site pages** creates any of these that are missing (existing ones are never overwritten):

- **Current developments** (`/current-developments/`), **Completed developments** (`/completed-developments/`), **About us** (`/about-us/`) and **Contact us** (`/contact-us/`), built with Elementor and editable there.
- A **WPForms** form, *Website enquiry*, on the Contact us page. It emails the address in **Company details**. Edit its fields, recipients and thank-you message under **WPForms › All Forms**.
- The **footer menu** links to these pages. The main menu keeps scrolling the home page.

On the home page each section (Current, Completed, About, Contact) has a link to its full page. Turn it off or change its wording in each widget's *Link to the full page* setting. A development's **Send an enquiry** button opens the Contact us page with that development already chosen in the form.

## Heritage A or B

The site plan's position is a theme setting, under **Appearance › Customise › Developments › Interactive site plan**:

- **On the development page (Heritage B)**, the default. The plan, house types and plot table sit in the development page's *Plots* section. Old `/plots/` links redirect there.
- **On its own Plots page (Heritage A).** The development page shows a banner linking to `/developments/<name>/plots/`. If you switch to this, add a "Plots" menu link yourself.

## Elementor

The **Premier Property** widget category contains:

- **Home page sections:** Heritage hero, Introduction & stats, Developments list (current or completed, as rows or a grid), About & principles, Contact details.
- **Development components:** Interactive site plan, Plot table, House types, Plots page banner. Each has a *Development* setting. Leave it on *This page's development* inside an Elementor Pro Theme Builder template.

With **Elementor Pro**, a Theme Builder *Header*, *Footer* or *Single* template replaces the theme's version automatically. Use the widgets above, plus Elementor Pro's ACF dynamic tags for single fields such as the headline or location. The `/plots/` page always uses the theme template.

## Shortcodes

These work anywhere, including Elementor's Shortcode widget:

```
[premier_developments stage="current" layout="rows"]   stage: current | completed | all, layout: rows | grid
[premier_site_plan development="brunt-lane"]
[premier_plots development="brunt-lane"]
[premier_house_types development="brunt-lane"]
[premier_plots_banner development="brunt-lane"]
[premier_stats]
```

`development` accepts a slug or ID. Leave it out on a development or house type page to use that one.

## Developer notes

- **ACF field groups** live in `plugins/premier-developments/acf-json/`. Edits made in the ACF admin are saved back there automatically.
- **Plot outlines** are stored as percentages of the site plan image (`x,y x,y …`), so they still line up if the image is resized.
- **Styling:** all the styles are in the theme (`assets/css/heritage.css` is the prototype's stylesheet, `wordpress.css` the WordPress additions). The widgets rely on the theme for their look.
- **WP-CLI:** `wp premier demo --source=<url or folder holding img/ and docs/>` imports the demo content.
- **Local testing:** this was built and tested on WordPress 7.1.3 with Elementor 4.3 (free) and Secure Custom Fields. Elementor Pro and ACF Pro were not available, so the Theme Builder integration is untested.
