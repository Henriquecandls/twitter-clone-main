const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Twitter Clone API",
    description: "Documentação da API REST",
  },
  host: "localhost:3000",
  schemes: ["http", "https"],
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./app.js", "./routes/auth.js", "./routes/users.js", "./routes/tweets.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
