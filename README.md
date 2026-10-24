# FUOCO — Wood-fired Pizza

A concept website for a wood-fired pizza shop, inspired by the "Full of Fire" pizza reel.
Static HTML, CSS and JavaScript. No build step.

## Pages

- **Home**: a hero slider with a spinning pizza, melting cheese, floating ingredients and rising embers. Below it: bestsellers, a build-your-own band, deals with a countdown, how it works and the story.
- **Menu**: category tabs, search, and veg and spicy filters. You choose a size before adding a pizza.
- **Build your pizza**: pick a size, crust, sauce and up to nine toppings. The SVG pizza updates live.
- **Deals**: combo deals, a countdown to midnight and promo codes.
- **Our story**: about the shop.
- **Find us**: a map, opening hours, a contact form with validation and an FAQ.
- **Cart**, **Checkout** and **Order**: promo codes (FIRE20, FIRST10), delivery or pickup, time slots, payment choice and a live order tracker.

The cart and orders are saved in `localStorage`. No real orders are placed.

## Run locally

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Deploy

Push this folder to GitHub and import it in Vercel. `vercel.json` turns on clean URLs.

---

Designed and developed by **Sameer Ashraf**, Vision Spider Tech.
