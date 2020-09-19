module.exports = {
    presets: [
        "@babel/preset-env",
        "@babel/preset-react"
    ],
    plugins: [
        "babel-plugin-optimize-clsx",
        ["@babel/plugin-proposal-class-properties", { loose: true }],
        ["@babel/plugin-proposal-object-rest-spread", { loose: true }],
        ["@babel/plugin-transform-runtime", { helpers: false }],
        "@babel/plugin-transform-object-assign",
    ],
};
