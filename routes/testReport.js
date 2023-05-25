var express = require("express");
var multer = require("multer");

const controllers = require("../controllers/testReportController");
const storage = multer.diskStorage({
  destination: (req, res, next) => {
    next(null, "./uploads");
  },
  filename: (req, file, next) => {
    next(null, file.originalname);
  },
});
const upload = multer({ storage });

var router = express.Router();

router.get("/", (req, res, next) => {
  res.send("in test route");
});

router.get("/report", controllers.getTestReportData);

router.post("/upload", upload.array("uploadData"), controllers.uploadInput);

module.exports = router;
