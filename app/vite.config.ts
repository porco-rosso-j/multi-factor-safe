import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import copy from "rollup-plugin-copy";
import fs from "fs";
import path from "path";
import svgr from "vite-plugin-svgr";
import topLevelAwait from "vite-plugin-top-level-await";

const wasmContentTypePlugin = {
	name: "wasm-content-type-plugin",
	configureServer(server) {
		server.middlewares.use(async (req, res, next) => {
			if (req.url.endsWith(".wasm")) {
				res.setHeader("Content-Type", "application/wasm");
				const newPath = req.url.replace("deps", "dist");
				const targetPath = path.join(__dirname, newPath);
				const wasmContent = fs.readFileSync(targetPath);
				return res.end(wasmContent);
			}
			next();
		});
	},
};

// Export the merged configuration
export default defineConfig(({ command }) => {
	const baseConfig = {
		plugins: [
			react(),
			svgr({
				include: "**/*.svg?react",
			}),
			topLevelAwait({}),
		],
	};

	const serveConfig = {
		build: {
			target: "esnext",
			rollupOptions: {
				external: ["@aztec/bb.js"],
			},
		},
		optimizeDeps: {
			esbuildOptions: {
				target: "esnext",
			},
		},
		plugins: [
			copy({
				targets: [
					{ src: "node_modules/**/*.wasm", dest: "node_modules/.vite/dist" },
				],
				copySync: true,
				hook: "buildStart",
			}),
			wasmContentTypePlugin,
		],
	};

	// const buildConfig = {
	// 	build: {
	// 		minify: "esbuild",
	// 		target: "esnext",
	// 	},
	// };

	if (command === "serve") {
		return {
			...baseConfig,
			...serveConfig,
			// ...buildConfig,
		};
	}

	return baseConfig;
});
