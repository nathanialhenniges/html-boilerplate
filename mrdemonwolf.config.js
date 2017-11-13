module.exports = {
  port: 4000,

  tasks: {
    imagemin: true,
    sass: true,
    server: true,
    webpack: true,
  },

  paths: {
    dest: "./",
    assets: "./assets",
    css: "css",
    js: "js",
    images: "images",
    sass: "_sass",
    jsSrc: "_js",
    imagesSrc: "_images",
  },


  sass: {
    outputStyle: "compressed",
  },

  autoprefixer: {
    browsers: [
      "> 1%",
      "last 2 versions",
      "Firefox ESR"
    ]
  },

  js: {
    entry: [
      "main.js",
    ],
  },
}
