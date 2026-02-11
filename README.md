# Additional Windowing Controls Remote Desktop Demo

This is a demo [Isolated Web App](https://github.com/WICG/isolated-web-apps/) showing the [Additional Windowing Controls API](https://github.com/explainers-by-googlers/additional-windowing-controls) usage with the remote desktop applications.

## Additional Windowing Controls API

The Additional Windowing Controls API, still in development as of writing this README, available for standalone Progressive Web Apps and Isolated Web Apps, allows the web apps to manipulate the window in the following ways:
- Maximize the window - with `window.maximize()`
- Minimize the window - with `window.minimize()`
- Restore the window - with `window.restore()`
- Set whether the window can be resized - with `window.setResizable(bool)`

Additionally, the following CSS properties are available
- `resizable` - boolean property telling whether the window can be resized or not
- `display-state` - the state in which the window is. One of `normal`, `minimized`, `maximized`, `fullscreen`

Also, the app can detect whether the window has been moved with the new `window.onmove` event. Note: it is possible that the event will be removed for PWAs (see [here](https://github.com/Igalia/explainers/blob/main/onmove-event-handler/README.md) and [here](https://github.com/w3c/csswg-drafts/issues/7693)).

To use the API, the app needs to allow the `window-management` permission in the permissions policy. For Isolated Web Apps, this means an appropriate entry in the web manifest (see `public/.well-known/manifest.webmanifest`).

The API is currently in development and behind a feature flag. To enable it, please use the `chrome://flags#enable-desktop-pwas-additional-windowing-controls`.

## Installing the app

This app can be installed with the following update manifest.
```
https://awc-remote-desktop-demo-18d82a7c.web.app/releases/update_manifest.json
```
The easiest way to install the app is via the `chrome://web-app-internals` page with the `chrome://flags/#enable-isolated-web-app-dev-mode` flag enabled.

## Building the app from the source code

To build the signed web bundle, the user needs to create a `.env` file in the project's directory. It can be done with the following command
```
cat << EOF > .env                                                                                                                                                                     
SIGNING_KEY="$(openssl genpkey -algorithm Ed25519)"
EOF
```

After that, the signed bundle can be built with
```
pnpm install && pnpm run build:release
```
The signed web bundle will appear in the `dist/releases` directory.

## Feedback and comments on the API

Feedback and comments on the API are highly appreciated. Please refer to the [API explainer](https://github.com/explainers-by-googlers/additional-windowing-controls) and create an issue.
