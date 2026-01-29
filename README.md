# vite-plugin-zero-downtime

[![NPM Version](https://img.shields.io/npm/v/vite-plugin-zero-downtime.svg)](https://www.npmjs.com/package/vite-plugin-zero-downtime)
[![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-zero-downtime.svg)](https://www.npmjs.com/package/vite-plugin-zero-downtime)
[![License](https://img.shields.io/npm/l/vite-plugin-zero-downtime.svg)](LICENSE)

A Vite plugin for zero downtime deployments.

This plugin implements the classic symlink approach to enable seamless application updates without service interruption.
It manages the deployment process by creating versioned builds and updating symlinks atomically, allowing the previous
version to remain active until the new version is fully ready.

## Installation

```bash
npm install -D vite-plugin-zero-downtime
```

## Usage

```typescript
// vite.config.js
import { defineConfig } from "vite";
import zeroDowntime from "vite-plugin-zero-downtime";

export default defineConfig({
    plugins: [
        // ...
        zeroDowntime(),
    ],
});
```

## Configuration

- `currentDir`: The directory path where the current/active application version is located (symlink).
- `releaseDir`: The directory path prefix where the new release version will be deployed.

## License

MIT © [HasanQQ](https://github.com/HasanQQ)
