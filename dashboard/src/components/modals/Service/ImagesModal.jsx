import { Modal, Carousel } from 'react-bootstrap';

const ImagesModal = ({ show, handleClose, images = [] }) => {
    const arrowStyle = {
        color: '#f07320',
        fontSize: '50px',
        fontWeight: 'bold',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
    };

    const customPrevIcon = (
        <span style={arrowStyle} aria-hidden="true">‹</span>
    );

    const customNextIcon = (
        <span style={arrowStyle} aria-hidden="true">›</span>
    );

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Service Images</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {images.length === 0 ? (
                    <p className="text-center">No images available.</p>
                ) : (
                    <Carousel
                        interval={2000} // Change slide every 2 seconds
                        controls={true}
                        indicators={true}
                        fade={true}
                        pause="hover"
                        prevIcon={customPrevIcon}
                        nextIcon={customNextIcon}
                    >
                        {images.map((img, idx) => (
                            <Carousel.Item key={idx}>
                                <img
                                    className="d-block w-100"
                                    src={img}
                                    alt={`Slide ${idx}`}
                                    style={{
                                        maxHeight: '500px',
                                        objectFit: 'contain',
                                    }}
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ImagesModal;
