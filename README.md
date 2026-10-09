# HubbyBirthdayCard

A mobile-first React birthday card with a photo story, a candle wish, a gift reveal, and a personal note.

## Run locally

```sh
npm install
npm run dev
```

## Personalize it

Edit the letter and photo captions in `src/main.jsx`. Replace the music file at `public/music/kesariya.mp3` or the photos in `public/photos/` to personalize the card.

## Deploy with GitHub Pages

In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The workflow in `.github/workflows/deploy.yml` builds and deploys the site after each push to `main`.
