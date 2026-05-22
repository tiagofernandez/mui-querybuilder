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
};

export default config;
