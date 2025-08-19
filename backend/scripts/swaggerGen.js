// swaggerGen.js
const swaggerAutogen = require("swagger-autogen")();


const doc = {
    info: {
        title: "~HackPilot, A-Z hackathon manager",
        description: "Automatically generated API documentation  ~HackPilot",
        version: "1.0.0",
    },
    // host: "verseify-backend-kxtc.onrender.com", // Change this if deploying
    schemes: ["https", "http"],
    basePath: "/api",
}

const outputFile = "../docs/swagger.json"           // The output file
const routes = ["../routes/*.js"]         // Add your route files

swaggerAutogen(outputFile, routes, doc).then(() => {
    console.log("Swagger documentation generated successfully!");
});
