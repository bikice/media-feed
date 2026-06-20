import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import flowRemoveTypes from "flow-remove-types";
import type { Plugin } from "vite";
import type { Plugin as EsbuildPlugin } from "esbuild";

// react-native and react-native-web ship source files containing Flow type
// syntax (e.g. `import type {X} from '...'`). Neither browsers nor esbuild
// can parse Flow, so it must be stripped before esbuild sees these files —
// both during normal dev/build transforms AND during Vite's dependency
// pre-bundling step, which runs its own separate esbuild pass.
//
// This replaces vite-plugin-react-native-web, which ships a CJS file under
// an ESM package.json ("type": "module") and fails to load entirely.
const FLOW_SOURCE_PATTERN = /node_modules[\\/](react-native|react-native-web|@react-native[\\/][^\\/]+)[\\/].*\.jsx?$/;

function stripFlow(code: string): string {
    return flowRemoveTypes(code).toString();
}

// Vite plugin: handles the regular module graph (dev server + build).
function stripFlowTypesVitePlugin(): Plugin {
    return {
        name: "strip-flow-types",
        enforce: "pre",
        transform(code, id) {
            if (!FLOW_SOURCE_PATTERN.test(id)) return null;
            return { code: stripFlow(code), map: null };
        },
    };
}

// esbuild plugin: handles Vite's dependency pre-bundling pass, which does
// NOT go through Vite's own plugin transform hooks.
function stripFlowTypesEsbuildPlugin(): EsbuildPlugin {
    return {
        name: "strip-flow-types-esbuild",
        setup(build) {
            build.onLoad({ filter: /\.jsx?$/ }, (args) => {
                if (!FLOW_SOURCE_PATTERN.test(args.path)) return null;
                const source = readFileSync(args.path, "utf8");
                return { contents: stripFlow(source), loader: "jsx" };
            });
        },
    };
}

const EXTENSIONS = [
    ".web.tsx",
    ".web.ts",
    ".web.jsx",
    ".web.js",
    ".tsx",
    ".ts",
    ".jsx",
    ".js",
    ".json",
];

export default defineConfig(({ mode }) => ({
    plugins: [stripFlowTypesVitePlugin(), react()],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: fileURLToPath(new URL("./src", import.meta.url)),
            },
            {
                // Exact-match only (^...$) so it substitutes the package name itself,
                // not as a string prefix — otherwise subpath imports like
                // 'react-native/Libraries/...' resolve incorrectly.
                find: /^react-native$/,
                replacement: "react-native-web",
            },
        ],
        extensions: EXTENSIONS,
    },
    // react-native packages assume a webpack-style environment and reference
    // these globals directly, which Vite/esbuild don't define by default.
    define: {
        global: "globalThis",
        __DEV__: JSON.stringify(mode !== "production"),
        "process.env.NODE_ENV": JSON.stringify(mode === "production" ? "production" : "development"),
    },
    optimizeDeps: {
        esbuildOptions: {
            // optimizeDeps runs its own esbuild pass and does NOT inherit Vite's
            // top-level resolve.extensions — it must be set again here, or
            // extensionless imports inside node_modules fall back to plain .js
            // files (native-only RN internals) instead of the .web.js variants.
            resolveExtensions: EXTENSIONS,
            loader: { ".js": "jsx" },
            jsx: "automatic",
            plugins: [stripFlowTypesEsbuildPlugin()],
        },
        include: ["react-native-web"],
    },
}));