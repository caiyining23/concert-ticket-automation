# SeatFlow — Ticket Monitoring & Guided Selection

An original Chrome Manifest V3 extension designed for **Melon Ticket** pages. SeatFlow monitors the browser's rendered seat-selection DOM, alerts you to available seats, and optionally clicks a limited number of matches after you explicitly enable click mode.

## Features

- Browser-side seat discovery via configurable CSS selectors and MutationObserver.
- Notifications when the number of visible matching seats changes.
- Optional click selection, capped at four seats, with automatic pause after selection.
- Start/stop controls, persistent local configuration, and status display.
- No external service, login credentials, or paid API required.
- Node.js tests for selector configuration, opt-in controls, and seat filtering.

## Install (Chrome)

1. Download or clone this repository.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Select **Load unpacked** and choose the folder containing `manifest.json`.
4. Open a Melon Ticket seat page, open the extension, and configure the available-seat CSS selector for that page.
5. Press **Start**. Click mode defaults to **off**. Any checkout, CAPTCHA, and payment steps remain manual.

## Run tests

```bash
npm test
```

## Technical design

The content script observes changes in the currently open seat page. Scans are debounced to no more than once every 2 seconds; there is no high-frequency HTTP polling. Availability is based on visible DOM elements matching your supplied CSS selector, not inventory guarantees. The background worker updates badge and notifications, and the popup controls user configuration. This tool does not bypass site security or automate payment.

## Compatibility

The extension is scoped to `tkglobal.melon.com` and `ticket.melon.com`. Real booking pages can change markup, use canvas or cross-origin frames, or require additional interactions. Configure and verify selectors against the actual page. Tests validate core utilities; they are **not** evidence of successful bookings.

## Provenance

SeatFlow is an independently written implementation, not a fork or a code copy of EasyConcertKorea (`brokenleg13/selfuse-ticket-bot`). It shares the general category of browser-based ticket monitoring, not that repository's source code.

## License

MIT — see [LICENSE](LICENSE).
