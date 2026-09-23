# CLC Carousels

CLC Carousels provides a public JSON carousel service backed by Polaris record sets and a browser-side Splide carousel that can be embedded on library websites.

## Client-side setup

New integrations should use the Splide-based client served from `/content`:

```html
<script src="https://carousels.clcohio.org/content/clc-splide-carousel.js"></script>
```

The script automatically loads Splide 4.1.4 CSS and JavaScript plus the CLC carousel stylesheet, then initializes every `.clc-carousel[data-rsid]` element on the page.

A minimal carousel is:

```html
<section
    class="clc-carousel"
    data-rsid="92105"
    data-branch-id="17"
    data-title="Featured Titles">
</section>
```

See [the client-side sample and documentation](samples/client-side/README.md) for all supported attributes, dependency-loading options, accessibility behavior, the JavaScript API, and manual dependency imports.

## Samples

The current browser examples are in [`samples/client-side`](samples/client-side):

- `index.html` demonstrates the recommended one-script setup.
- `manual-import.html` demonstrates explicit Splide/CSS imports with automatic dependency loading disabled.

The legacy `/js/clc-carousel.js` and `/css/clc-carousel.css` assets remain in the project for existing consumers. New integrations should use `/content/clc-splide-carousel.js` and `/content/clc-splide-carousel.css`.

## Service endpoint

The browser client requests:

```text
/home/jsonp?rsid=<record-set-id>&ctx=<branch-or-context-id>
```

The endpoint returns JSON unless the legacy `callback=callback` parameter is supplied.

## Development

The ASP.NET Core application is in `src` and targets .NET 10.
