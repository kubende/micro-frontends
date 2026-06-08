import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { dependencies } from "./package.json";

/**
 * The shell is built with an EMPTY remotes object. Remotes are registered
 * at runtime from the catalog + tenant entitlements, via @module-federation/runtime.
 * The Shell never statically imports a remote.
 */
export default defineConfig({
  server: {
    port: 3000,
  },
  output: {
    // Copies platform-specific files (_headers, _redirects) into the build
    // output. Cloudflare Pages reads these from the dist root.
    copy: [{ from: "cloudflare", to: "." }],
  },
  html: {
    template: "./index.html",
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "shell",
      remotes: {},
      // Disabled because remotes don't produce federated dts; shared types
      // come from @workspace/contracts.
      dts: false,
      // Disable MF's auxiliary dev server — running 3 apps in parallel made
      // them collide on its auto-picked port. We don't need its live-reload.
      dev: false,
      // Host must `eager: true` its singletons so providers register
      // synchronously with the main bundle; otherwise consumers (including the
      // host's own code) hit "factory is undefined" on first paint. Remotes do
      // NOT set eager — they should pick up the host's copy at runtime.
      // JSX compiles to imports of `react/jsx-runtime` (prod) and
      // `react/jsx-dev-runtime` (dev). Sharing `react` alone does NOT cover
      // these subpaths — each is a separate share entry. Without them,
      // remotes hit "factory is undefined" the moment they render JSX.
      shared: {
        react: { singleton: true, eager: true, requiredVersion: dependencies.react },
        "react/jsx-runtime": {
          singleton: true,
          eager: true,
          requiredVersion: dependencies.react,
        },
        "react/jsx-dev-runtime": {
          singleton: true,
          eager: true,
          requiredVersion: dependencies.react,
        },
        "react-dom": {
          singleton: true,
          eager: true,
          requiredVersion: dependencies["react-dom"],
        },
        "react-router-dom": {
          singleton: true,
          eager: true,
          requiredVersion: dependencies["react-router-dom"],
        },
        zustand: { singleton: true, eager: true, requiredVersion: dependencies.zustand },
        "@workspace/design-system": { singleton: true, eager: true },
        "@workspace/contracts": { singleton: true, eager: true },
      },
    }),
  ],
});
