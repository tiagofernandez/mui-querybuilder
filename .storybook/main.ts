import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
    stories: ["../stories/**/*.stories.@(js|jsx|ts|tsx)"],
    addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
    framework: {
        name: "@storybook/react-vite",
        options: {},
    },
    docs: {
        autodocs: true,
    },
    async viteFinal(config) {
        config.plugins = config.plugins?.filter((plugin) => {
            if (plugin && typeof plugin === "object" && "name" in plugin) {
                return plugin.name !== "vite:dts";
            }
            return true;
        });
        return config;
    },
};

export default config;
