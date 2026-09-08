const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const { port } = require("./config/env");
const apiRoutes = require("./routes/apiRoutes");
const healthRoutes = require("./routes/healthRoutes");
const { errorHandler, notFound } = require("./middleware/errors");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/api", healthRoutes);
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`NexaFlow API listening on port ${port}`);
});