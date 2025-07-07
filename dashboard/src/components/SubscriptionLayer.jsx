import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../axiosConfig";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import CreateSubscriptionModal from './modals/Subscription/CreateSubscriptionModal.jsx';
import EditSubscriptionModal from './modals/Subscription/EditSubscriptionModal.jsx';
import DeleteModal from './modals/DeleteModal.jsx';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Subscriptions..."
    />
);

const SubscriptionLayer = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedSubscriptionEdit, setSelectedSubscriptionEdit] = useState(null); // for Edit Modal
    const [selectedSubscriptionDelete, setSelectedSubscriptionDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/subscription-plan');
            setSubscriptions(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDelete = async (category) => {
        setSelectedSubscriptionDelete(category);
        setShowDeleteModal(true);
    };

    const closeModal = () => setSelectedSubscription(null);

    const columns = React.useMemo(() => [
        {
            Header: '#',
            accessor: (_row, i) => i + 1,
        },
        {
            Header: 'Name',
            accessor: row => row.name || '-',
        },
        {
            Header: 'Price',
            accessor: row => row.price + ' JD' || '-',
        },
        {
            Header: 'Description',
            accessor: row => row.description || '-',
        },
        {
            Header: 'Features',
            accessor: row =>
                row.features?.length
                    ? row.features.map(sub => sub).join(', ')
                    : '-',
        },
        {
            Header: 'Actions',
            Cell: ({ row }) => (
                <div className="d-flex justify-content-center gap-2">
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => { setSelectedSubscriptionEdit(row.original); setEditModalShow(true); }}
                    >
                        <Icon icon="mdi:pencil" />
                    </button>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(row.original)}
                    >
                        <Icon icon="mdi:delete" />
                    </button>
                </div>
            ),
        },
    ], []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setGlobalFilter,
        state,
    } = useTable({ columns, data: subscriptions }, useGlobalFilter, useSortBy);

    return (
        <div className="card basic-data-table">
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Subscription Plans</h5>
                <div className="w-35 w-md-100 w-sm-100">
                    <GlobalFilter
                        globalFilter={state.globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        className="form-control"
                    />
                </div>
                <div className="w-35 w-md-100 w-sm-100">
                    <button
                        className="btn btn-success w-100 w-md-auto"
                        onClick={() => setShowModal(true)}
                    >
                        <span className="ms-1">Create New Plan</span>
                    </button>
                </div>
            </div>
            <div className="card-body p-0">
                {subscriptions.length === 0 ? (
                    <div className="text-center p-4">No subscription plans found</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table bordered-table mb-0" {...getTableProps()}>
                            <thead>
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                {column.render('Header')}
                                                {' '}
                                                {column.isSorted ? (
                                                    column.isSortedDesc ? <FaSortDown /> : <FaSortUp />
                                                ) : (
                                                    <FaSort style={{ opacity: 0.3 }} />
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {rows.map(row => {
                                    prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map(cell => {
                                                const { key, ...cellProps } = cell.getCellProps();
                                                return (
                                                    <td key={key} {...cellProps} style={{ textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                                        {cell.render('Cell')}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create New Subscription Plan Modal */}
            <CreateSubscriptionModal
                show={showModal}
                handleClose={() => setShowModal(false)} // Close the modal
                fetchData={fetchData}
            />

            {/* Edit Subscription Modal */}
            {selectedSubscriptionEdit && (<EditSubscriptionModal
                show={editModalShow}
                handleClose={() => setEditModalShow(false)}
                fetchData={fetchData}
                selectedSubscription={selectedSubscriptionEdit}
            />)}

            {/* Delete Modal */}
            {selectedSubscriptionDelete && (
                <DeleteModal
                    show={showDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                    item={selectedSubscriptionDelete}
                    itemType="subscription-plan"
                    fetchData={fetchData}
                />
            )}
        </div>
    );
};

export default SubscriptionLayer;