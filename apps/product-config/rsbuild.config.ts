import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { dependencies } from "./package.json";

export default defineConfig({
  server: {
    port: 3001,
    // Allow the shell on :3000 to fetch the manifest + chunks.
    headers: { "Access-Control-Allow-Origin": "*" },
  },
  dev: {
    assetPrefix: "http://localhost:3001",
  },
  output: {
    // Production builds must serve assets from this remote's own origin so
    // the shell (running on a different origin) loads chunks from the right
    // place. PUBLIC_ASSET_PREFIX is set on the production deployment to the
    // stable custom domain; CF_PAGES_URL / VERCEL_URL are the per-deploy
    // preview URLs the platform exposes automatically.
    assetPrefix:
      process.env.PUBLIC_ASSET_PREFIX ||
      process.env.CF_PAGES_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "/"),
    copy: [{ from: "cloudflare", to: "." }],
  },
  html: { template: "./index.html" },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "product_config",
      filename: "remoteEntry.js",
      // Federated dts generation is disabled — type safety across the boundary
      // is provided by the shared @workspace/contracts package (RemoteModule).
      dts: false,
      dev: false,
      exposes: {
        "./routes": "./src/expose/routes.tsx",
      },
      // `eager: true` lets this remote run as its own host on
      // http://localhost:3001 for standalone dev. When the remote is loaded
      // through the shell instead, the singleton check at runtime sees the
      // shell has already provided react/react-router-dom/etc., and the
      // remote reuses the shell's copies — its own bundled versions are
      // never instantiated.
      shared: {
        react: { singleton: true, eager: true, requiredVersion: dependencies.react },
        // JSX compiles to imports of these subpaths — share separately or
        // remotes hit "factory is undefined" when they render JSX.
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
        "@workspace/design-system": { singleton: true, eager: true },
        "@workspace/contracts": { singleton: true, eager: true },
      },
    }),
  ],
});
