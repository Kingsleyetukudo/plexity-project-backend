const express = require("express");
const appraisalController = require("../controllers/appraisalController");

const router = express.Router();

// Define routes
router.get("/", appraisalController.getAllAppraisals);
router.get("/:id", appraisalController.getAppraisal);
router.post("/", appraisalController.createAppraisal);
router.put("/:id", appraisalController.updateAppraisal);
router.delete("/:id", appraisalController.deleteAppraisal);

module.exports = router;
