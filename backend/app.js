const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const adminRoutes = require("./routes/admin-routes");
const generalRoutes = require("./routes/general-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/imagenes", express.static(path.join("uploads", "imagenes")));
app.use("/uploads/audios", express.static(path.join("uploads", "audios")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/admin", adminRoutes);
app.use("/api", generalRoutes);

app.use((req, res, next) => {
  const error = new HttpError("No se encuentra la página solicitada", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ mensaje: error.message || "Ha ocurrido un error inesperado" });
});

mongoose
  .connect(
    "mongodb+srv://ascaseiro:Caseiro25@cluster0.mgdog.mongodb.net/zonaalumnassinggular?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
