# FindStay Color Palette

The palette is based on the approved calm, earthy reference. It is a design
specification; no application color tokens are implemented yet.

| Name | Hex | Intended use |
| :--- | :--- | :--- |
| Olive | `#55624A` | Primary navigation, core actions, active controls, and success-adjacent states. |
| Terracotta | `#BC6746` | Reservations, discovery actions, and high-emphasis calls to action. |
| Sand | `#DCCB91` | Supporting accents and decorative details. |
| White | `#FFFFFF` | Page canvas, cards, and form fields. The default app background. |
| Ivory | `#F7F3EA` | Warm supporting surface only: banners, footers, muted panels, and active or hover states. Never the page canvas. |
| Earth | `#3E2F26` | Primary text and dark surfaces. |

FindStay ships in light mode only; there is no dark theme. Use accessible
lighter/darker variants of these values when components require
hover, disabled, border, or status states. Those variants should be defined
with the component implementation, after contrast is checked.
