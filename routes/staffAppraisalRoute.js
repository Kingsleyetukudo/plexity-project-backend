const express = require("express");
const staffAppraisalController = require("../controllers/staffAppraisalController");

const router = express.Router();

// Define routes
router.get("/", staffAppraisalController.getAllStaffAppraisals);
router.get("/appraisal/:id", staffAppraisalController.getStaffAppraisal);
router.post("/", staffAppraisalController.createStaffAppraisal);
router.put("/:id", staffAppraisalController.updateStaffAppraisal);
router.delete("/:id", staffAppraisalController.deleteStaffAppraisal);
router.get(
  "/currentUser/:employeeId",
  staffAppraisalController.getAllAppraisalByCurrentUserId
);

module.exports = router;
