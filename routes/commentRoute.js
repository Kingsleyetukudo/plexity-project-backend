const express = require("express");
const commentController = require("../controllers/commentController");

const router = express.Router();

// Route to get all comments
router.get("/", commentController.getAllComments);

// Route to get a single comment by ID
router.get("/:id", commentController.getCommentById);

// Route to create a new comment
router.post("/", commentController.createComment);

// Route to update a comment by ID
router.put("/:id", commentController.updateComment);

// Route to delete a comment by ID
router.delete("/:id", commentController.deleteComment);

// Route to get comments by a specific sender
router.get("/sender/:senderId", commentController.getCommentsBySenderId);

module.exports = router;
