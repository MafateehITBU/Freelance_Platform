import { Modal, Button } from 'react-bootstrap';
import axiosInstance from "../../axiosConfig";
import { toast } from 'react-toastify';

const DeleteModal = ({
    show,
    handleClose,
    item,              // The object to delete (must contain _id)
    itemType,          // String: 'freelancer', 'influencer', 'user', etc.
    fetchData          // Function to refresh the list
}) => {
    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/${itemType}/${item._id}`);
            toast.success(`${capitalize(itemType)} deleted successfully`);
            fetchData();
            handleClose();
        } catch (error) {
            console.error(`Error deleting ${itemType}:`, error);
            toast.error(`Failed to delete ${itemType}`);
        }
    };

    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title className="h5">Delete {capitalize(itemType)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-center">
                    Are you sure you want to delete <strong>{item?.name || item?.title || 'this item'}</strong>?
                    <br />
                    This action cannot be undone.
                </p>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
                <Button variant="secondary" onClick={handleClose} style={{ width: "120px" }}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={handleDelete} style={{ width: "120px" }}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteModal;