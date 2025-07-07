import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axiosInstance from '../../../axiosConfig';
import { toast } from 'react-toastify';

const UpdateInfluencerModal = ({ show, handleClose, influencer, fetchInfluencers }) => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        dateOfBirth: '',
        socialMediaLinks: [{ platform: '', url: '' }]
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [personalIdImage, setPersonalIdImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const platforms = [
        { name: 'Instagram', icon: '📸' },
        { name: 'TikTok', icon: '🎵' },
        { name: 'YouTube', icon: '▶️' },
        { name: 'Facebook', icon: '📘' },
        { name: 'Twitter', icon: '🐦' },
        { name: 'Snapchat', icon: '👻' }
    ];

    useEffect(() => {
        if (influencer) {
            setForm({
                name: influencer.name || '',
                email: influencer.email || '',
                password: '',
                phone: influencer.phone || '',
                dateOfBirth: influencer.dateOfBirth
                    ? new Date(influencer.dateOfBirth).toISOString().split('T')[0]
                    : '',
                socialMediaLinks: influencer.socialMediaLinks?.length
                    ? influencer.socialMediaLinks.map(link => ({ ...link })) // <- DEEP COPY!
                    : [{ platform: '', url: '' }]
            });
            setProfilePicture(null);
            setPersonalIdImage(null);
            setErrors({});
        }
    }, [influencer]);

    const handleSocialMediaChange = (index, field, value) => {
        setForm(prevForm => {
            const updatedLinks = prevForm.socialMediaLinks.map((link, i) =>
                i === index ? { ...link, [field]: value } : link
            );
            return { ...prevForm, socialMediaLinks: updatedLinks };
        });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const addSocialLink = () => {
        setForm(prevForm => ({
            ...prevForm,
            socialMediaLinks: [...prevForm.socialMediaLinks, { platform: '', url: '' }]
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name) newErrors.name = 'Name is required';
        if (!form.email) newErrors.email = 'Email is required';
        if (!form.phone || !/^07[7-9]\d{7}$/.test(form.phone)) newErrors.phone = 'Valid phone is required';
        if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('email', form.email);
        if (form.password) formData.append('password', form.password);
        formData.append('phone', form.phone);
        formData.append('dateOfBirth', form.dateOfBirth);
        formData.append('socialMediaLinks', JSON.stringify(form.socialMediaLinks));
        if (profilePicture) formData.append('profilePicture', profilePicture);
        if (personalIdImage) formData.append('personalIdImage', personalIdImage);

        try {
            setIsSubmitting(true);
            await axiosInstance.put(`/influencer/${influencer._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Influencer updated successfully!');
            fetchInfluencers();
            handleClose();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update influencer');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title className="h5">Update Influencer</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Col>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                isInvalid={!!errors.name}
                            />
                            <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                        </Col>
                        <Col>
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col>
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                            />
                            <Form.Text muted>Leave blank if you don't want to change it</Form.Text>
                        </Col>
                        <Col>
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                isInvalid={!!errors.phone}
                            />
                            <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col>
                            <Form.Label>New Profile Picture (optional)</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProfilePicture(e.target.files[0])}
                            />
                        </Col>

                        <Col>
                            <Form.Label>New Personal ID Image (optional)</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPersonalIdImage(e.target.files[0])}
                            />
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Date of Birth</Form.Label>
                        <Form.Control
                            type="date"
                            name="dateOfBirth"
                            value={form.dateOfBirth}
                            onChange={handleChange}
                            isInvalid={!!errors.dateOfBirth}
                        />
                        <Form.Control.Feedback type="invalid">{errors.dateOfBirth}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Social Media Links</Form.Label>
                        {form.socialMediaLinks.map((link, index) => (
                            <Row className="mb-2" key={index}>
                                <Col>
                                    <Form.Select
                                        value={link.platform}
                                        onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                                    >
                                        <option value="">Select Platform</option>
                                        {platforms.map(p => (
                                            <option key={p.name} value={p.name}>
                                                {p.icon} {p.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col>
                                    <Form.Control
                                        placeholder="URL"
                                        value={link.url}
                                        onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                                    />
                                </Col>
                            </Row>
                        ))}
                        <Button variant="link" onClick={addSocialLink}>+ Add Another</Button>
                    </Form.Group>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-100"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Updating Influencer...' : 'Update Influencer'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default UpdateInfluencerModal;