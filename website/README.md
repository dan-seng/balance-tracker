# Hisab download website

This directory contains Hisab's download website and the bundled Android APK. The mobile app's features, development setup and usage guide are documented in the [main README](../README.md).

## Current download

- **Android 1.1.1**, version code **3**.
- Approximately **28 MB**, for **32-bit and 64-bit ARM phones** running Android 7.0+.
- `Hisab.apk` is the signed release artifact committed with this website.
- Download buttons use `Hisab.apk?v=1.1.0`; they are not overwritten by GitHub's latest-release API.

The connected Vercel project deploys from `main`. Find the current production URL in the repository's [deployment activity](https://github.com/dan-seng/balance-tracker/deployments). Website deployments and GitHub release builds are separate; replacing this APK requires committing a newly built file.

## Active files

| File | Purpose |
| --- | --- |
| `index.html` | Landing page, download buttons and installation help |
| `style.css` | Website layout, responsive styling and themes |
| `app.js` | Theme controls, version/size labels, downloads and counter requests |
| `Hisab.apk` | Bundled Android release |
| `assets/` | Images and fonts |
| `vercel.json` | Routing and security/APK response headers |
| `api/count.js` | Read download and visitor totals |
| `api/download.js` | Record a download and deduplicate visitor counts |
| `api/_lib/redis.js` | Optional Redis REST connection |

`styles.css` and `script.js` are older files; the current page uses `style.css` and `app.js`.

## Preview locally

From the repository root:

```sh
python3 -m http.server 8000 --directory website
```

Open `http://localhost:8000`. Static layout and APK downloads work locally. The Vercel API endpoints require a server environment and will not run in Python's static server.

## Optional counters

Configure either environment-variable pair in Vercel:

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, or
- `KV_REST_API_URL` and `KV_REST_API_TOKEN`.

Keep tokens in deployment secrets. Do not commit them or put them in browser JavaScript. Counters use a random browser identifier for visitor deduplication; they do not receive bank SMS or Shop records. Counter failures must not block downloading the APK.

## Update the APK

Follow the [release guide](../docs/releasing.md). Build the release with both ARM architectures, copy it to `website/Hisab.apk`, and update version/size/download-query values in `app.js` and `index.html`. Keep the existing signing certificate for in-place updates.

Before pushing:

```sh
node --check website/app.js
git diff --check
```

Check that the APK is signed, has the intended Android version and both ARM architectures. After pushing, confirm the Vercel deployment succeeds and that download buttons still point to the bundled file.
