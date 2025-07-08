import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import axiosInstance from '../axiosConfig';
import { toast } from 'react-toastify';
import DeleteModal from './modals/DeleteModal';

const PostDetails = ({ post, onClose }) => {
    const [comments, setComments] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    useEffect(() => {
        fetchPostDetails();
    }, []);

    const fetchPostDetails = async () => {
        try {
            const res = await axiosInstance.get(`/comment/${post._id}`);
            setComments(res.data || []);
        } catch (err) {
            toast.error("Failed to load post details");
        }
    };

    const handleDeleteComment = async (comment) => {
        setCommentToDelete(comment);
        setShowDeleteModal(true);
    };

    if (!post) return <div className="text-center p-4">Loading...</div>;

    return (
        <div className="container py-4">
            <Button variant="secondary" className="mb-3" onClick={onClose}>← Back</Button>
            <Card className="mb-3 shadow">
                <Card.Body style={{ position: 'relative' }}>
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

                    {/* Comments count aligned to bottom right */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '15px',
                            fontSize: '0.8rem',
                            color: '#888'
                        }}
                    >
                        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                    </div>
                </Card.Body>

            </Card>


            {comments.length === 0 ? (
                <p>No comments yet.</p>
            ) : (
                comments.map(comment => (
                    <Card key={comment._id} className="mb-3">
                        <Card.Body className="d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <div className="d-flex">
                                    <img
                                        src={comment.userId.profilePicture}
                                        alt="Profile"
                                        style={{ width: '35px', height: '35px', borderRadius: '50%', marginRight: '10px' }}
                                    />
                                    <div>
                                        <strong>{comment.userId.name}</strong>
                                        <div style={{ fontSize: '0.85rem' }} className="text-muted">
                                            {new Date(post.createdAt).toLocaleString([], {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        <div>{comment.text}</div>
                                    </div>
                                </div>

                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteComment(comment)}
                                >
                                    Delete
                                </Button>
                            </div>
                            <span>{comment.content}</span>
                        </Card.Body>
                    </Card>
                ))
            )}

            <DeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                item={commentToDelete}
                itemType="comment"
                fetchData={fetchPostDetails}
            />
        </div>
    );
};

export default PostDetails;
