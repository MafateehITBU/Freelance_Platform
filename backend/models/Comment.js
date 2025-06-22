import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userModel',
        required: true,
    },
    userModel: {
        type: String,
        enum: ['User', 'Freelancer', 'Influencer'],
        required: true,
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;