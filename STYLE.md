# greptile.com — Design System

Generated from https://www.greptile.com/ with the Webpo DESIGN.md generator.
Values are read from the site's own CSS; the rationale below is a starting
point to edit, not something the page told us.

## 1. Visual Theme & Atmosphere

Light-surfaced and restrained, with a small accent palette carrying the emphasis.
Density is tight, on a 4px base unit.
Corners are rounded at 2px.

## 2. Color Palette & Roles

| Role       | Hex     | Notes                                                 |
| ---------- | ------- | ----------------------------------------------------- |
| Primary    | #C5FFD6 | Most-used non-neutral. Buttons, links, active states. |
| Secondary  | #FFCFFE | Supporting accent.                                    |
| Tertiary   | #28E99F | Charts, badges, decorative use.                       |
| Background | #FFFFFF | Page surface.                                         |
| Surface    | #EEEEEE | Cards and raised panels.                              |
| Text       | #000000 | Body copy.                                            |
| Muted text | #171717 | Secondary and helper text.                            |
| Border     | #D6D6D6 | Hairlines and dividers.                               |

Contrast of primary against the background: 1.1:1.

## 3. Typography Rules

Font stack: `DM Sans`, `DM Sans Fallback`, `Anybody`

| Step    | Size     | Suggested use      |
| ------- | -------- | ------------------ |
| Display | 8rem     | 3 uses in the CSS  |
| H1      | 6rem     | 5 uses in the CSS  |
| H2      | 4.5rem   | 8 uses in the CSS  |
| H3      | 3.75rem  | 9 uses in the CSS  |
| H4      | 3rem     | 10 uses in the CSS |
| Body    | 2.25rem  | 12 uses in the CSS |
| Small   | 1.875rem | 15 uses in the CSS |
| Caption | 1.5rem   | 17 uses in the CSS |

Line height tightens as size grows: roughly 1.5 at body size, 1.15–1.25 at display size.

## 4. Component Stylings

- **Buttons** — background `#C5FFD6`, radius `2px`, padding `6px 12px`.
- **Cards** — background `#EEEEEE`, radius `.25rem`, border `1px solid #D6D6D6`.
- **Inputs** — radius `2px`, border `1px solid #D6D6D6`, focus ring in `#C5FFD6`.

## 5. Layout Principles

Base unit: **4px**. Spacing scale in use:

- `.125rem`
- `.25rem`
- `.375rem`
- `.5rem`
- `.625rem`
- `.75rem`
- `1rem`
- `1.25rem`
- `1.5rem`
- `2rem`

Prefer multiples of the base unit over arbitrary values. Content measure should
stay near 65–75 characters for body copy.

## 6. Depth & Elevation

- **Level 1** — `0 -8px 24px #0000004d,0 -2px 6px #00000026`

## 7. Do's and Don'ts

- **Do** use the base unit for every gap, padding and margin.
- **Do** keep the accent colour for one thing per view.
- **Don't** introduce new greys — the neutrals above already cover surface, border and text.
- **Don't** mix corner radii within a component group.

## 8. Responsive Behavior

- Breakpoints: 640px, 768px, 1024px, 1280px.
- Touch targets 44px minimum on coarse pointers.
- Multi-column layouts collapse to one column below 768px.

## 9. Agent Prompt Guide

Quick reference for prompting:

> Primary `#C5FFD6`, background `#FFFFFF`, text `#000000`,
> font DM Sans, base unit 4px, radius 2px.

Paste this file at the root of a project and reference it when asking an agent
to build UI, e.g. "follow DESIGN.md".
