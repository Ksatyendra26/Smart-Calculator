# SMART CALCULATOR — Kushwaha Traders

## Files
- `index.html` — complete application
- `manifest.json` — install/PWA metadata
- `sw.js` — service worker
- `icon-192.png`, `icon-512.png` — app icons

## Deploy to GitHub Pages
Upload all files to the same folder/root served by GitHub Pages. Keep the filenames unchanged.

## First setup
Open `index.html`, find:
`let upi=localStorage.getItem('smart_upi')||'YOURUPIID@upi';`
The app also has a visible UPI settings field. Enter the real Kushwaha Traders UPI ID once; it is saved in the browser.

## Features
Basic calculator, item billing, quantity × rate, discount, GST, customer details, invoice number/date, dynamic UPI QR, Pay Now, share, print invoice, local bill history, dark mode, responsive layouts, keyboard support, and PWA install support.

## Important
The app uses the QRCodeJS CDN for QR generation. For fully offline QR generation, download/self-host that library and replace the CDN script in `index.html`.
