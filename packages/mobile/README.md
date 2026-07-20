# Dawn CV mobile app — quickstart

1. On your computer, start the helper: `node scripts/serve-api.js` (from the project root).
2. In `packages/mobile`, run `npx expo start`.
3. Open the Expo Go app on your phone and scan the QR code shown in the terminal.
4. On a phone, edit `packages/mobile/app.json` first: set `expo.extra.apiBase` to your computer's LAN IP, e.g. `"http://192.168.1.20:4100"` (find it with `ipconfig` / `ifconfig`), then restart `npx expo start`.
5. Use the Profile tab to check your info, Generate to make a CV, History to see past ones.
