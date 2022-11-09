// Origins that are allowed to call our site / pull data off of our site!
const CLIENT_PORT = 5010;

const corsWhiteList = [
  "https://www.fumix.de",
  `http://localhost:${CLIENT_PORT}`,
  `http://127.0.0.1:${CLIENT_PORT}`,
];
const corsOptions = {
  origin: (origin, callback) => {
    if (corsWhiteList.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"), false);
    }
  },
  optionSuccessStatus: 200,
};

module.exports = corsOptions;
