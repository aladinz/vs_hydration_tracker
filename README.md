# Hydration Tracker (HTML/CSS/JS)

A simple, responsive hydration-tracking app for desktop and mobile browsers.

## Recommended Tech Stack

- HTML5 for structure
- Modern CSS (responsive layout, custom properties)
- Vanilla JavaScript (ES modules) for app logic
- Browser `localStorage` for local persistence by day

This stack is lightweight, cross-platform, and easy to host anywhere.

## Features Implemented

- 15 drink buttons:
  - Water, Tea, Coffee, Cocoa, Orange Juice
  - 10 soft drink options
- One-tap logging (`+1`) with instant UI updates
- Per-drink totals, overall totals, and highlighted water intake
- Editable daily water goal (default: 8 glasses)
- Water-goal progress percentage and progress bar
- Goal met/not-met status
- End-of-day summary for today with kidney-friendly hydration tips
- Automatic day rollover with archive of previous day
- Manual "Archive & Reset Today" button
- Last 7 archived days shown in app
- Basic local-storage and input validation error handling

## Project Structure

```text
VS_Hydration_Tracker/
  index.html
  README.md
  assets/
    css/
      styles.css
    js/
      app.js
      config.js
      storage.js
```

## Run Locally

1. Open this folder in VS Code.
2. Run a local static server. Example options:
   - VS Code Live Server extension: right-click `index.html` > Open with Live Server
   - Python: `python -m http.server 5500`
   - Node (if installed): `npx serve .`
3. Open in browser:
   - `http://localhost:5500` (or the port your server reports)

You can also open `index.html` directly in a browser, but a local server is recommended for consistency.

## Extend Drink Types

Add a new drink in `assets/js/config.js` inside `DRINK_TYPES`:

```js
{ id: "coconut-water", label: "Coconut Water", category: "hydration" }
```

The UI and totals update automatically based on this config.

## Notes

- Data is stored per browser profile/device (`localStorage`).
- If browser storage is disabled, the app still works during the session but warns that data may not persist.
