import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axiosInstance from '../../../axiosConfig';

const CreateCategoryModal = ({ show, handleClose, fetchData }) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        subcategories: [{ name: '' }]
    });

    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubcategoryChange = (index, value) => {
        const updated = [...form.subcategories];
        updated[index].name = value;
        setForm({ ...form, subcategories: updated });
    };

    const addSubcategory = () => {
        setForm({ ...form, subcategories: [...form.subcategories, { name: '' }] });
    };

    const removeSubcategory = (index) => {
        const updated = [...form.subcategories];
        updated.splice(index, 1);
        setForm({ ...form, subcategories: updated });
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.description.trim()) newErrors.description = 'Description is required';
        if (!image) newErrors.image = 'Image is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('description', form.description);
        formData.append('image', image);
        formData.append(
            'subcategories',
            JSON.stringify(form.subcategories.map((s) => s.name.trim()))
        );

        try {
            setIsSubmitting(true);
            await axiosInstance.post('/category', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Category created successfully!');
            fetchData(); // Refresh list
            handleClose(); // Close modal
            // Reset form
            setForm({ name: '', description: '', subcategories: [{ name: '' }] });
            setImage(null);
            setErrors({});
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to create category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Create New Category</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>

                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            isInvalid={!!errors.name}
                        />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            name="description"
                            as="textarea"
                            rows={3}
                            value={form.description}
                            onChange={handleChange}
                            isInvalid={!!errors.description}
                        />
                        <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Image</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files[0])}
                            isInvalid={!!errors.image}
                        />
                        <Form.Control.Feedback type="invalid">{errors.image}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Subcategories</Form.Label>
                        {form.subcategories.map((sub, index) => (
                            <Row key={index} className="mb-2 align-items-center">
                                <Col xs={10}>
                                    <Form.Control
                                        placeholder="Subcategory name"
                                        value={sub.name}
                                        onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                                    />
                                </Col>
                                <Col xs={2} className="text-end">
                                    {form.subcategories.length > 1 && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeSubcategory(index)}
                                        >
                                            X
                                        </Button>
                                    )}
                                </Col>
                            </Row>
                        ))}
                        <Button variant="link" onClick={addSubcategory}>+ Add Another Subcategory</Button>
                    </Form.Group>

                    <Button
                        type="submit"
                        variant="success"
                        className="w-100"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating Category...' : 'Create Category'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateCategoryModal;