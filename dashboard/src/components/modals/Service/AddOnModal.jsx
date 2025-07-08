import React from 'react';
import { Modal, Table } from 'react-bootstrap';

const AddOnModal = ({ show, handleClose, service }) => {
    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Service Add-ons</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {service?.addOn?.length > 0 ? (
                    <Table bordered hover>
                        <thead className="table-light text-center">
                            <tr>
                                <th>Title</th>
                                <th>Duration (days)</th>
                                <th>Price (JD)</th>
                            </tr>
                        </thead>
                        <tbody className="text-center align-middle">
                            {service.addOn.map((addOn) => (
                                <tr key={addOn._id}>
                                    <td>{addOn.title}</td>
                                    <td>{addOn.duration} day</td>
                                    <td>{addOn.price} JD</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                ) : (
                    <p className="text-center">No add-ons found for this service.</p>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default AddOnModal;