const express = require("express");
const app = express();
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const cron = require("node-cron"); // Import node-cron
const performCronJob1 = require("./cronJobs/1minute");
const second = require("./cronJobs/second");

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://admin:password@199.127.61.233:27017/monitor', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("DB connected successfully");

    // Start the cron job scheduler for 5 second jobs
    cron.schedule("*/10 * * * * *", async () => {
      try {
        await second();
      } catch (error) {
        console.error("Error performing cron job 1:", error);
      }
    });

    // Start the cron job scheduler
    cron.schedule("*/1 * * * *", async () => {
      try {
        await performCronJob1();
      } catch (error) {
        console.error("Error performing cron job 1:", error);
      }
    });

    // Middleware
    app.use(express.json());
    app.use(helmet());
    app.use(morgan("common"));
    app.use(cors());

    // Start the server
    app.listen(8088, () => {
      console.log("Server running on port 8080");
    });
  } catch (error) {
    console.error("Error starting the server:", error);
  }
}

// Start the server
startServer();
