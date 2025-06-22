import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Freelancer from "../models/Freelancer.js";
import Influencer from "../models/Influencer.js";

/**-----------------------------------------
 *  @desc  Add a new Comment
 *  @route POST /api/comment/:postId
 * @access Private
 * @role   User, Freelancer, Influencer
 ------------------------------------------*/
export const addComment = async (req, res) => {
    try {
        const { content, userModel } = req.body;
        const userId = req.user.id;
        const postId = req.params.postId;

        // Validate input
        if (!content || !userModel) {
            return res.status(400).json({ message: 'Content and UserModel are required' });
        }
        // Map userModel string to actual Mongoose model
        const modelsMap = {
            User,
            Freelancer,
            Influencer
        };

        const SelectedModel = modelsMap[userModel];
        if (!SelectedModel) {
            return res.status(400).json({ message: 'Invalid user model' });
        }

        // Check if user exists
        const userExists = await SelectedModel.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if postId is provided
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }
        // Check if the post exists
        const postExists = await Post.findById({ _id: postId.toString() });
        if (!postExists) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = new Comment({
            userId,
            userModel,
            postId,
            content
        });

        await newComment.save();
        res.status(201).json({ message: 'Comment added successfully', comment: newComment });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

/**-----------------------------------------
 *  @desc  Get all Post Comments
 *  @route Get /api/comment/:postId
 * @access Public
 ------------------------------------------*/
export const getPostComments = async (req, res) => {
    try {
        const postId = req.params.postId;

        // Check if postId is provided
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required' });
        }

        // Fetch comments for the post
        const comments = await Comment.find({ postId })
            .populate('userId', 'name profilePicture') // Populate user details
            .sort({ createdAt: -1 }); // Sort by creation date

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

/**-----------------------------------------
 *  @desc  Update a Comment
 * @route PUT /api/comment/:commentId
 * @access Private
 * @role   User, Freelancer, Influencer
 * ------------------------------------------*/
export const updateComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const { content } = req.body;
        const userId = req.user.id;

        // Check if commentId is provided
        if (!commentId) {
            return res.status(400).json({ message: 'Comment ID is required' });
        }

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if the user is authorized to update the comment
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this comment' });
        }

        // Update the comment content
        comment.content = content || comment.content;
        await comment.save();

        res.status(200).json({ message: 'Comment updated successfully', comment });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

/**-----------------------------------------
 *  @desc  Delete a Comment
 *  @route DELETE /api/comment/:commentId
 * @access Private
 * @role   User, Freelancer, Influencer, Admin
 ------------------------------------------*/
export const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user.id;

        // Check if commentId is provided
        if (!commentId) {
            return res.status(400).json({ message: 'Comment ID is required' });
        }

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if the user is authorized to delete the comment
        if (comment.userId.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(commentId);
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
}