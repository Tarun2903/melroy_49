# Fonts

This project currently loads **Bricolage Grotesque** and **Inter** from Google Fonts
(see the `<link>` tags in `index.html`, with `preconnect` hints already in place for
fast connection setup).

## Why not self-hosted?

Self-hosting removes a third-party request and can shave a few hundred milliseconds
off first paint, but it requires shipping binary `.woff2` files. This folder is kept
as the intended home for them so the project structure is ready.

## To self-host later

1. Download the `.woff2` files for Bricolage Grotesque (weights 500/700/800) and
   Inter (weights 400/500/600/700) from [Google Fonts](https://fonts.google.com) or
   [Fontsource](https://fontsource.org).
2. Place them in this `fonts/` folder.
3. Replace the Google Fonts `<link>` tags in `index.html` with a `@font-face` block
   in `css/style.css`, e.g.:

```css
@font-face{
  font-family:"Inter";
  src:url("../fonts/inter-400.woff2") format("woff2");
  font-weight:400;
  font-display:swap;
}
```

4. Remove the `fonts.googleapis.com` / `fonts.gstatic.com` `preconnect` links once
   no longer needed.
