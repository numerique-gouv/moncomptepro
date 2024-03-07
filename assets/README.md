# Assets folder

Here are all js and css files meant to be transformed by vite.

All css and js files **at the root of the `css` and `js` subfolders** are meant to be directly included in templates via script and link tags with the `css` and `js` ejs helper functions like this:

```ejs
<link rel="stylesheet" href="<%= css('application.css') %>">
<script type="module" src="<%= js('app.js') %>"></script>
```

**Files located in the `css/imports` and `js/modules` subfolders** are meant to be used only as imports in other files. You can't import them directly via the css/js helper functions.

This separation of concern is important so that vite understands what files are meant to be used as entrypoints.

## How it works

While we serve everything via our express app, we use vite to generate assets. This mostly helps us cache bust our files and use the JS modules system.

- actual CSS/JS files are placed here in `/assets`
- static files are placed in `/public`
- when running the app or building the app (so, in dev or prod), vite generates the `/dist` folder: it builds files from `/assets` and copies files from `/public`. In production, built files have hashes in their names. For our express app to know what those built names are, vite also generates a `/dist/.vite/manifest.json` file that contains a map between original asset name and built asset name. The `css()` and `js()` ejs helpers check the `manifest.json`.
