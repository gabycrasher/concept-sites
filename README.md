# Concept Sites

Static concept websites for six kinds of business, each with its own visual identity and a custom
signature opening animation. All company names are fictional.

| # | Business | Site | Signature opening |
|---|---|---|---|
| 01 | Tour operator | [Oryx & Ember Expeditions](tour-operator/) | A topographic map draws itself, a route traces across East Africa with live coordinates, and a passport stamp opens like an iris into the hero. |
| 02 | Clinic | [Veyra Health](clinic/) | One slow breath expands and settles, condenses into a four-petal plus, and the plus sweeps the four quarters of the screen away. |
| 03 | Guesthouse / lodge | Next after the clinic | |
| 04 | Real estate | Next after the lodge | |
| 05 | Salon | Later | |
| 06 | Restaurant | Later | |

## Built with

- Plain HTML, CSS and JavaScript, mobile first, with no build step.
- [GSAP](https://gsap.com) and ScrollTrigger for the openings and scroll scenes (included in each site's `vendor` folder).
- Design ideas from [Motion](https://motion.dev), [Anime.js](https://animejs.com), [Kokonut UI](https://kokonutui.com) and [Bklit UI](https://ui.bklit.com): bento grids, cursor spotlights, animated charts and split-text reveals.
- Photography from [Unsplash](https://unsplash.com), free under the Unsplash License, credited in each site's footer.

Every site respects `prefers-reduced-motion`, plays its opening once per visit, and can skip the
opening with the button or the Escape key.

## Run locally

Open any `index.html`, or serve the folder:

```
php -S 127.0.0.1:8765
```
