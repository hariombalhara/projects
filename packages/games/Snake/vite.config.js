const path = require("path");
/**
 * @type {import('vite').UserConfig}
 */
module.exports = {
  mode: 'development',
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/snake.ts"),
      name: "__SnakeGame",
      formats: ["iife", "umd", "es"],
    },
    rollupOptions: {
        input: {
            main: path.resolve(__dirname, "index.html")
        }
    }
  },
};
