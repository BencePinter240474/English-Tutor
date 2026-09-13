# Fonts

Empty on purpose.

The elho brand typeface is **Cina GEO** by Public Type. The copies held in the
elho design system project are the free `CinaGEOTest` trial cuts from Befonts,
which are licensed for **personal use only**. This site is published publicly,
so those files must not be committed here.

To switch the real face on:

1. Buy the licence from Public Type and export `woff2` for weights 400, 500
   and 600.
2. Save them here as `CinaGEO-Regular.woff2`, `CinaGEO-Medium.woff2` and
   `CinaGEO-SemiBold.woff2`.
3. Uncomment the three `@font-face` rules in `src/design/tokens/fonts.css`.

Until then the fallback stack (Century Gothic, Corbel, Segoe UI) is used.
Trial cuts differ from the retail release in kerning, so line breaks may move
slightly on the swap.
