module.exports = {
  presets: [
    "@babel/preset-env",
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
  plugins: [
    ["@babel/plugin-transform-modules-commonjs", { allowTopLevelThis: true }]
  ],
  env: {
    test: {
      plugins: [
        ["@babel/plugin-transform-modules-commonjs", { allowTopLevelThis: true }]
      ]
    }
  }
};
