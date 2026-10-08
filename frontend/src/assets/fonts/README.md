# Fonts

Place the approved brand typeface's self-hosted font files here (e.g.
`inter-regular.woff2`, `inter-medium.woff2`, `inter-semibold.woff2`,
`inter-bold.woff2`).

Fonts are bundled brand/chrome assets (Website Frontend Architecture §22),
never CMS content, so they are versioned with the frontend build rather
than fetched from the Public API.

Wire new weights/families through `src/assets/styles/fonts.css`
(`@font-face`) and the `--font-sans` / `--font-heading` tokens in
`src/shared/design-system/tokens/tokens.css` — never reference a font
family name directly from a component.
