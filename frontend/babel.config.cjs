module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
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
