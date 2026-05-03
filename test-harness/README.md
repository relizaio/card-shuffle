# test-harness

Headless smoke test for the Mafia Card Shuffle UI. Validates that:

- Home / Rules / Clubs routes render
- Generate-room redirects to a `/cards/<room>` URL
- Two players in the same room see each other (socket round-trip)

## Run

```
npm install
BASE_URL=https://shuffle.claude.rearmhq.com npm run smoke
```

Defaults to `BASE_URL=https://shuffle.claude.rearmhq.com` if unset.

System dependencies for Chromium on Debian/Ubuntu:

```
sudo apt-get install -y libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2 \
  libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2t64 libnss3 libxss1 fonts-liberation
```
