import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../../axiosConfig';

const EditSubscriptionModal = ({ show, handleClose, fetchData, selectedSubscription }) => {
    const [form, setForm] = useState({
        name: '',
        price: '',
        description: '',
        features: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Prefill form when selectedSubscription is passed
    useEffect(() => {
        if (selectedSubscription) {
            setForm({
                name: selectedSubscription.name || '',
                price: selectedSubscription.price?.toString() || '',
                description: selectedSubscription.description || '',
                features: selectedSubscription.features?.join(', ') || ''
            });
        }
    }, [selectedSubscription]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.price.trim()) newErrors.price = 'Price is required';
        if (!form.description.trim()) newErrors.description = 'Description is required';
        if (!form.features.trim()) newErrors.features = 'Features are required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const updatedFields = {};

        if (form.name !== selectedSubscription.name) updatedFields.name = form.name;
        if (form.price !== selectedSubscription.price?.toString()) updatedFields.price = form.price;
        if (form.description !== selectedSubscription.description) updatedFields.description = form.description;

        const formFeatures = form.features.split(',').map(f => f.trim());
        const originalFeatures = selectedSubscription.features || [];

        if (JSON.stringify(formFeatures) !== JSON.stringify(originalFeatures)) {
            updatedFields.features = formFeatures;
        }

        if (Object.keys(updatedFields).length === 0) {
            toast.info('No changes detected');
            return;
        }

        setIsSubmitting(true);
        try {
            await axiosInstance.put(`/subscription-plan/${selectedSubscription._id}`, updatedFields);
            toast.success('Subscription plan updated successfully');
            fetchData();
            handleClose();
        } catch (error) {
            console.error('Error updating subscription plan:', error);
            toast.error('Failed to update subscription plan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Subscription Plan</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    isInvalid={!!errors.name}
                                >
                                    <option value="">Select Plan</option>
                                    <option value="Basic">Basic</option>
                                    <option value="Pro">Pro</option>
                                    <option value="Premium">Premium</option>
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {errors.name}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="price">
                                <Form.Label>Price (JD)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    isInvalid={!!errors.price}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.price}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group controlId="description">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    isInvalid={!!errors.description}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.description}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group controlId="features">
                                <Form.Label>Features (comma separated)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="features"
                                    value={form.features}
                                    onChange={handleChange}
                                    isInvalid={!!errors.features}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.features}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-100"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Plan'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditSubscriptionModal;