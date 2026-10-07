# Build and publish an Android release

## Build a phone-compatible APK

Install Node.js 22.11+, JDK 17, Android SDK 36 and NDK 28.2.13676358, then run:

```sh
npm ci
npx tsc --noEmit
npm test -- --runInBand
cd android
./gradlew app:assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a
```

The signed output is `android/app/build/outputs/apk/release/app-release.apk`. The release bundles JavaScript/Hermes and does not require Metro. Code shrinking is already enabled. Keep both ARM architectures for public downloads; use `x86_64` only for an Intel emulator build.

## Prepare an update

- Increment `versionCode` and update `versionName` in `android/app/build.gradle`.
- Keep the signing certificate consistent with the previously distributed APK so users can update without uninstalling.
- Update the Settings version label and its Amharic translation.
- GitHub Actions currently derives release tags/names from `package.json` plus the build number. Check that metadata separately from the APK's Android version.

The current APK is Android 1.1.1, version code 3. The project currently signs releases with its existing debug signing configuration; changing certificates prevents an ordinary in-place update of that installation.

## Replace the website download

From the repository root, after the release build:

```sh
cp android/app/build/outputs/apk/release/app-release.apk website/Hisab.apk
```

Update the version, APK size and cache-busting query in `website/app.js`, and matching download/script queries in `website/index.html`. The site intentionally serves its bundled APK instead of letting GitHub's latest-release response override the link.

Verify the APK's package, version, architectures and certificate with the SDK's `aapt2 dump badging` and `apksigner verify --print-certs`. The expected package is `com.hisabapp` and the public APK should contain `armeabi-v7a` and `arm64-v8a`.

Push the updated APK and website files to `main`. The connected Vercel project deploys the website, and the GitHub release workflow independently builds and publishes release assets. Check deployment/build status before announcing availability. A documentation-only push does not require rebuilding an unchanged website APK.
