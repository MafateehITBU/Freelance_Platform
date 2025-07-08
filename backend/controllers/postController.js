import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

/**-----------------------------------------
 *  @desc  Add a new Post
 *  @route POST /api/post
 * @access Private
 * @role   User
 ------------------------------------------*/
export const addPost = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const newPost = new Post({
            title,
            description,
            userId
        });

        await newPost.save();
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

/**-----------------------------------------
 *  @desc  Get all Posts
 *  @route GET /api/post
 * @access Public
 ------------------------------------------*/
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'name email profilePicture').sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

/**-----------------------------------------
 *  @desc  Get a single Post by ID
 *  @route GET /api/post/:id
 * @access Public
 ------------------------------------------*/
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('userId', 'name email');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

/**-----------------------------------------
 *  @desc  Update a Post
 *  @route PUT /api/post/:id
 * @access Private
 * @role   User
 ------------------------------------------*/
export const updatePost = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user is the owner of the post
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this post' });
        }

        // Update only the fields that are provided
        if (title) post.title = title;
        if (description) post.description = description;

        await post.save();
        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

/**-----------------------------------------
 *  @desc  Delete a Post
 *  @route DELETE /api/post/:id
 * @access Private
 * @role   User, Admin
 ------------------------------------------*/
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the user is the owner of the post or an admin
        if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        // Delete the comments associated with the post
        await Comment.deleteMany({ postId: req.params.id });
        
        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
    }
}