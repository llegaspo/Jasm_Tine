---
name: Jasm_Tine Modern Feminine SaaS
colors:
  surface: '#fff7ff'
  surface-dim: '#e0d7e2'
  surface-bright: '#fff7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf1fc'
  surface-container: '#f4ebf6'
  surface-container-high: '#eee5f1'
  surface-container-highest: '#e8e0eb'
  on-surface: '#1e1a22'
  on-surface-variant: '#4f4448'
  inverse-surface: '#332f37'
  inverse-on-surface: '#f7eef9'
  outline: '#817478'
  outline-variant: '#d2c3c7'
  surface-tint: '#795465'
  primary: '#795465'
  on-primary: '#ffffff'
  primary-container: '#f8c8dc'
  on-primary-container: '#765162'
  inverse-primary: '#e9bacd'
  secondary: '#5c5d6e'
  on-secondary: '#ffffff'
  secondary-container: '#e1e1f5'
  on-secondary-container: '#626374'
  tertiary: '#6d5d2a'
  on-tertiary: '#ffffff'
  tertiary-container: '#e9d495'
  on-tertiary-container: '#6a5b28'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd8e7'
  primary-fixed-dim: '#e9bacd'
  on-primary-fixed: '#2e1221'
  on-primary-fixed-variant: '#5f3c4d'
  secondary-fixed: '#e1e1f5'
  secondary-fixed-dim: '#c5c5d8'
  on-secondary-fixed: '#191b29'
  on-secondary-fixed-variant: '#444655'
  tertiary-fixed: '#f7e1a1'
  tertiary-fixed-dim: '#dac588'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#544614'
  background: '#fff7ff'
  on-background: '#1e1a22'
  surface-variant: '#e8e0eb'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  container-max-width: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The brand personality is chic, nurturing, and effortlessly elegant. It targets a modern audience that values aesthetic harmony and emotional intelligence in their professional tools. The UI should evoke a sense of calm productivity, moving away from "cold" tech tropes toward a "warm" editorial feel.

The design style combines **Glassmorphism** with **Minimalism**. It uses translucent layers to create a sense of lightness and depth, while maintaining heavy white space to ensure the "girly" aesthetic remains sophisticated rather than cluttered. The visual narrative is built on the contrast between structured, legible layouts and soft, organic flourishes.

## Colors

The palette is rooted in a warm, approachable spectrum.

- **Primary (Soft Pink):** Used for primary actions, active states, and brand-heavy moments.
- **Secondary (Lavender):** Used for accents, secondary buttons, and subtle category tagging.
- **Tertiary (Jasmine Yellow):** A high-visibility accent used sparingly for "magic" moments, highlights, or critical notifications.
- **Background (Cream):** A warm off-white (#FFFDF9) provides a softer, more premium foundation than pure white, reducing eye strain and enhancing the "chic" vibe.
- **Neutral (Deep Plum/Muted Charcoal):** Used for typography to maintain high legibility while appearing softer than pitch black.

## Typography

The typographic hierarchy relies on the interplay between the romantic, high-contrast **Playfair Display** for headings and the friendly, highly-legible **Plus Jakarta Sans** for UI and body copy.

Headings should use tighter letter-spacing to emphasize the editorial look. Body text uses generous line-height to maintain a breathable, relaxed feel. Use "Label-sm" for utility text like tooltips or overlines to provide a modern, structured contrast to the flowing serif headings.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to maintain a boutique, curated feel, centering the content with wide outer margins.

- **Desktop:** 12-column grid with 24px gutters. Use wide 64px margins to allow the UI to "breathe."
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters and 20px side margins.

Horizontal spacing between related elements should favor the "base" unit of 8px. For section-level separation, use larger increments (48px, 64px, or 80px) to reinforce the minimalist aesthetic.

## Elevation & Depth

Depth is conveyed through a mix of **Glassmorphism** and **Ambient Shadows**.

1.  **Base Layer:** The Cream background.
2.  **Mid Layer (Cards/Modals):** Semi-transparent surfaces (White at 70% opacity) with a `backdrop-blur` of 12px to 20px.
3.  **Shadow Character:** Use extremely soft, diffused shadows tinted with a hint of the Primary Pink (e.g., `rgba(248, 200, 220, 0.3)`) rather than gray. Shadows should have a large blur radius (20px+) and low spread to look like natural sunlight.
4.  **Interactive States:** Elements should subtly lift (increase shadow blur) or glow with a soft Jasmine Yellow outer bloom when focused.

## Shapes

This design system utilizes a very high roundedness factor to communicate approachability and softness.

- **Containers & Cards:** Use `rounded-3xl` (approx 24px-32px) to create an organic, friendly frame.
- **Buttons & Inputs:** Use "Pill" shapes for primary actions to draw the eye and encourage interaction.
- **Iconography:** Icons should feature rounded caps and corners, avoiding any sharp 90-degree angles.

## Components

- **Buttons:** Primary buttons are pill-shaped, using a Soft Pink fill with white text. Secondary buttons use a Lavender border with Lavender text. Provide a "ghost" button style for tertiary actions.
- **Inputs:** Input fields should have a Cream fill (slightly darker than the background) with a subtle Soft Pink bottom border that grows to a full border on focus.
- **Cards:** Incorporate the glassmorphism effect here. A thin 1px white border helps define the edges on light backgrounds.
- **Chips/Badges:** Small, pill-shaped tags using the Jasmine Yellow for "New" or "Hot" items, and Lavender for general categories.
- **Progress Bars:** Use a thick, rounded track in Secondary Lavender with a Primary Pink fill.
- **Modals:** Centered with a heavy backdrop blur (20px) and `rounded-3xl` corners, appearing to float above the interface.
