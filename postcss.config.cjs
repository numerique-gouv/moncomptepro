const purgecss = require("@fullhuman/postcss-purgecss");

module.exports = {
  plugins: [
    purgecss({
      content: ["./src/views/**/*.ejs", "./assets/**/*.js"],
      css: ["./assets/**/*.css"],
      variables: true,
      safelist: {
        greedy: [/choices/,]
      }
    }),
  ],
};
