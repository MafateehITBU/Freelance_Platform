import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaComment } from 'react-icons/fa';
import PostDetails from './PostDetails';
import axiosInstance from '../axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import DeleteModal from './modals/DeleteModal';

const PostsLayer = () => {
    const [posts, setPosts] = useState([]);
    const [visibleCount, setVisibleCount] = useState(3);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await axiosInstance.get('/post');
            setPosts(res.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
            toast.error("Failed to fetch posts");
        }
    };

    const handleDeletePost = async (post) => {
        setPostToDelete(post);
        setShowDeleteModal(true);
    };

    return (
        <div className="container py-4">
            <ToastContainer />
            {selectedPost ? (
                <PostDetails post={selectedPost} onClose={() => setSelectedPost(null)} />
            ) : (
                <>
                    {posts.slice(0, visibleCount).map(post => (
                        <Card key={post._id} className="mb-3 shadow">
                            <Card.Body>
                                <div className="d-flex flex-column mb-3">
                                    <div className='d-flex align-items-center mb-2'>
                                        <img
                                            src={post.userId.profilePicture}
                                            alt="Profile"
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                                        />
                                        <div>
                                            <strong>{post.userId.name}</strong><br />
                                            <small className="text-muted">
                                                {new Date(post.createdAt).toLocaleString([], {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </small>
                                        </div>
                                    </div>
                                    <br />

                                    <div>
                                        <strong>Title:</strong> {post.title} <br />
                                        <strong>Description:</strong> {post.description}
                                    </div>
                                </div>
                                <Card.Text>{post.content}</Card.Text>
                                <div className="d-flex justify-content-between">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        <FaComment className="me-1" /> Comments
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDeletePost(post)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}

                    {visibleCount < posts.length && (
                        <div className="text-center">
                            <Button variant="secondary" onClick={() => setVisibleCount(prev => prev + 3)}>Show More Posts</Button>
                        </div>
                    )}
                </>
            )}

            <DeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                item={postToDelete}
                itemType="post"
                fetchData={fetchPosts}
            />
        </div>
    );
};

export default PostsLayer;
