import { type Plugin } from "vite";
import fs from "node:fs/promises";
import path from "node:path";

type TPluginConfig = {
    currentDir?: string;
    releaseDir?: string;
};

type TPluginContext = {
    directories: {
        current: string;
        release: string;
    };
};

export default function pluginZeroDowntime(config?: TPluginConfig): Plugin[] {
    // set default directory names if not provided
    const DIR_CURRENT = config?.currentDir || "current";
    const DIR_RELEASE = config?.releaseDir || "release";

    // context to hold directory paths during the build process
    let context: TPluginContext;

    // return the array of plugins
    return [
        {
            name: "vite-plugin-zero-downtime:serve:mutate-config",
            apply: "serve",
            enforce: "pre",
            config: (userConfig) => {
                userConfig.build = userConfig.build || {};
                userConfig.build.outDir = userConfig.build.outDir || "dist";

                // set the output directory to the current directory
                userConfig.build.outDir = `${userConfig.build.outDir}/${DIR_CURRENT}`;
            },
        },
        {
            name: "vite-plugin-zero-downtime:build:mutate-config",
            apply: "build",
            enforce: "pre",
            config: (userConfig) => {
                userConfig.build = userConfig.build || {};
                userConfig.build.outDir = userConfig.build.outDir || "dist";

                // update the plugin context with directories
                context = {
                    directories: {
                        current: `${userConfig.build.outDir}/${DIR_CURRENT}`,
                        release: `${userConfig.build.outDir}/${DIR_RELEASE}-${new Date().getTime()}`,
                    },
                };

                // set the output directory to the release directory
                userConfig.build.outDir = context.directories.release;
            },
        },
        {
            name: "vite-plugin-zero-downtime:build:update-current-symlink",
            apply: "build",
            enforce: "post",
            closeBundle: async () => {
                if (!context) {
                    throw new Error("Plugin context is not initialized.");
                }

                const current = path.resolve(context.directories.current);
                const release = path.resolve(context.directories.release);

                await fs
                    .stat(current)
                    .then(async (stat) => {
                        if (stat.isSymbolicLink()) {
                            await fs.unlink(current);
                        } else {
                            await fs.rm(current, { recursive: true, force: true });
                        }
                    })
                    .catch(() => {
                        // file/directory/symlink does not exist, no action needed
                    });

                await fs.symlink(release, current, "dir");
            },
        },
        {
            name: "vite-plugin-zero-downtime:build:remove-older-releases",
            apply: "build",
            enforce: "post",
            closeBundle: async () => {
                if (!context) {
                    throw new Error("Plugin context is not initialized.");
                }

                const pattern = path.join(path.dirname(context.directories.release), `${DIR_RELEASE}-*`);

                for await (const dir of fs.glob(pattern)) {
                    if (dir !== context.directories.release) {
                        await fs.rm(dir, { recursive: true, force: true });
                    }
                }
            },
        },
    ];
}
