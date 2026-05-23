# Design System Document: The Cinematic Estate

## 1. Overview & Creative North Star
**Creative North Star: The Cinematic Estate**
This design system rejects the "SaaS-standard" aesthetic in favor of a high-end, editorial experience. It is where the rugged authority of agricultural technology meets the refined atmosphere of a luxury steakhouse. We move beyond flat grids to create a "Cinematic Estate"—a digital environment characterized by deep atmospheric perspective, hyper-polished surfaces, and a sense of institutional weight.

To break the template look, the system utilizes **intentional asymmetry** and **tonal layering**. Elements should feel "placed" rather than "slotted," using overlapping glass panels and dramatic typographic scales to create a sense of curated, non-linear depth.

---

## 2. Colors & Surface Philosophy
The palette is rooted in the earth but polished to a mirror finish. It uses deep charcoal foundations, metallic gold highlights, and "oxblood" reds to evoke heritage and premium quality.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Boundaries must be defined through:
- **Background Shifts:** Placing a `surface_container_low` section against a `surface` background.
- **Tonal Transitions:** Using soft gradients to suggest where one area ends and another begins.
- **Negative Space:** Utilizing the spacing scale to create clear mental models of separation without visual "noise."

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
1.  **Base Layer:** `surface` (#131313) or `surface_container_lowest`.
2.  **Mid-Ground:** `surface_container` (#201f1f) for general content areas.
3.  **Hero/Focus:** `surface_container_high` (#2a2a2a) to draw the eye.
Nesting should always move from "darker/lower" to "lighter/higher" to simulate physical light hitting an elevated surface.

### The Glass & Gradient Rule
To achieve the "ultra-glossy" requirement, use the **Glassmorphism Stack**:
- **Fill:** `surface_variant` at 40-60% opacity.
- **Blur:** Backdrop-filter: blur(20px).
- **Edge:** A 1.5px "Inner Glow" using `outline_variant` at 20% opacity on the top and left edges only to mimic a light source reflecting off a beveled edge.
- **Gradients:** Use `secondary_container` to `secondary` for metallic gold CTAs to provide "soul" and dimension.

---

## 3. Typography
The typography system balances the technical precision of `Space Grotesk` with the universal clarity of `Inter`.

- **Display & Headlines (`Space Grotesk`):** These are the "voice" of the brand. Use `display-lg` for hero statements with tight letter-spacing (-0.02em). This conveys authority and a hyper-modern edge.
- **Titles & Labels (`Inter`):** Used for navigation and data. These should be clean, high-contrast (using `on_surface`), and always intentional.
- **Editorial Scale:** Maintain a high contrast between `headline-lg` and `body-md`. This gap creates a "luxury magazine" feel, moving away from the cramped density of typical data dashboards.

---

## 4. Elevation & Depth
Hierarchy is achieved through **Tonal Layering** rather than structural lines.

### The Layering Principle
Depth is created by stacking containers. A `surface_container_low` card placed on a `surface` background creates a natural, soft lift. This simulates a "matte-on-matte" luxury feel.

### Ambient Shadows
For floating elements (like Map Pins or Tooltips), use "Atmospheric Shadows":
- **Color:** Use a tinted version of `on_background` (not pure black).
- **Properties:** Large blur (30px+), low opacity (6%-10%).
- **Purpose:** To mimic ambient light occlusion rather than a harsh directional drop-shadow.

### The Ghost Border
If accessibility requires a border, use a **Ghost Border**: 
- Token: `outline` or `outline_variant`.
- Opacity: 15% maximum.
- Purpose: To provide a faint hint of a boundary without breaking the "No-Line" rule.

---

## 5. Components

### Buttons (The "Gold Standard")
- **Primary:** Metallic gradient from `secondary_container` to `secondary`. Text is `on_secondary` (dark). Apply a subtle inner-glow on hover to simulate a "backlit" effect.
- **Secondary:** Glassmorphic base (`surface_variant` @ 30%) with a `secondary` ghost border.
- **Tertiary:** No background. Bold `on_surface` text with a `tertiary` (emerald) underline on hover.

### Map Pins (The "Luminous Beacon")
Pins must feel like physical gems. Use `tertiary` (emerald) for "Active" states with a `tertiary_container` radial outer glow. Use a metallic gold `secondary` for "Premium/Featured" assets.

### Cards
- **Construction:** Never use dividers. 
- **Style:** Use `surface_container_low` with a 1px `outline_variant` at 10% opacity. 
- **Interaction:** On hover, the card should "lift" by transitioning to `surface_container_high` and increasing the backdrop-blur intensity.

### Input Fields
- **Base:** `surface_container_lowest` (sunken effect).
- **Border:** Ghost border using `outline_variant` (20% opacity).
- **Focus:** Border transitions to `primary` (oxblood) or `secondary` (gold) with a 2px outer glow of the same color.

### Tooltips
- **Style:** Heavy glassmorphism. `surface_container_highest` at 80% opacity with a 30px blur. 
- **Typography:** `label-md` in `off-white/cream`.

---

## 6. Do's and Don'ts

### Do:
- **Use "Breathing Room":** Leverage the `xl` and `lg` spacing tokens to separate content. High-end design is defined by the space it *doesn't* use.
- **Layer with Intent:** Always check if a surface transition can replace a border.
- **Embrace the Dark:** Ensure `on_background` text is high-contrast against the charcoal surfaces for readability.

### Don't:
- **Don't Use 100% Opacity Borders:** This immediately destroys the "Cinematic" feel and makes the UI look like a template.
- **Don't Overuse Emerald/Oxblood:** These are accents. Let the metallic gold (`secondary`) and deep charcoal (`surface`) do the heavy lifting to maintain the "Steakhouse" luxury.
- **Don't Use Standard Shadows:** Avoid small, dark, high-opacity drop shadows. They look "cheap" in a dark-mode luxury environment.