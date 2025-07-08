import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../axiosConfig.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import AddFreelancerModal from './modals/Freelancer/AddFreelancerModal.jsx';
import UpdateFreelancerModal from './modals/Freelancer/UpdateFreelancerModal';
import DeleteModal from './modals/DeleteModal.jsx';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Freelancer..."
    />
);

const FreelancersLayer = () => {
    const [Freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedFreelancer, setSelectedFreelancer] = useState(null);

    useEffect(() => {
        fetchFreelancers();
    }, []);

    const fetchFreelancers = async () => {
        try {
            const res = await axiosInstance.get('/freelancer');
            setFreelancers(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleAddFreelancer = () => setShowAddModal(true);
    const handleUpdateFreelancer = (Freelancer) => {
        setSelectedFreelancer(Freelancer);
        setShowUpdateModal(true);
    };

    const handleDeleteFreelancer = (Freelancer) => {
        setSelectedFreelancer(Freelancer);
        setShowDeleteModal(true);
    };

    const handleApprove = async (freelancerId) => {
        try {
            await axiosInstance.put(`/freelancer/${freelancerId}/verify`);
            toast.success('Freelancer approved/ rejected successfully!', { position: "top-right" });
            fetchFreelancers();
        } catch (error) {
            toast.error('Failed to approve the ticket.', { position: "top-right" });
        }
    };

    const columns = React.useMemo(() => [
        {
            Header: '#',
            accessor: (_row, i) => i + 1,
        },
        {
            Header: 'Photo',
            accessor: 'profilePicture',
            Cell: ({ value }) => (
                <img src={value} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            ),
        },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Phone', accessor: 'phone' },
        {
            Header: 'Date of Birth',
            accessor: 'dateOfBirth',
            Cell: ({ value }) => new Date(value).toLocaleDateString(),
        },
        {
            Header: 'Verified',
            accessor: 'verified',
            Cell: ({ row, value }) => {
                const freelancerId = row.original._id;
                const badgeColor = value === true ? 'success' : value === false ? 'danger' : 'secondary';
                const badgeText = value === true ? 'Verified' : value === false ? 'Rejected' : 'Take Action';

                return (
                    <div className="dropdown">
                        <span className={`badge bg-${badgeColor} dropdown-toggle`} data-bs-toggle="dropdown" role="button" style={{ cursor: 'pointer' }}>
                            {badgeText}
                        </span>
                        <ul className="dropdown-menu">
                            {value !== true && <li><button className="dropdown-item" onClick={() => handleApprove(freelancerId)}>Approve</button></li>}
                            {value !== false && <li><button className="dropdown-item" onClick={() => handleApprove(freelancerId)}>Reject</button></li>}
                        </ul>
                    </div>
                );
            }
        },
        {
            Header: 'Actions',
            Cell: ({ row }) => (
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-primary" onClick={() => handleUpdateFreelancer(row.original)}>
                        <Icon icon="mdi:pencil" />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFreelancer(row.original)}>
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
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        gotoPage,
        pageOptions,
        nextPage,
        previousPage,
        state: { pageIndex, globalFilter },
        setGlobalFilter,
    } = useTable(
        { columns, data: Freelancers, initialState: { pageSize: 10 } },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    return (
        <div className="card basic-data-table" style={{ minHeight: '65vh' }}>
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Freelancers</h5>
                <div className="w-35 w-md-100 w-sm-100">
                    <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} className="form-control" />
                </div>
                <div className="w-35 w-md-100 w-sm-100">
                    <button className="btn btn-success w-100 w-md-auto" onClick={handleAddFreelancer}>
                        <span className="ms-1">Add New Freelancer</span>
                    </button>
                </div>
            </div>
            <div className="card-body p-0 d-flex flex-column">
                {loading ? (
                    <div className="text-center p-4">Loading...</div>
                ) : Freelancers.length === 0 ? (
                    <div className="text-center p-4">No Freelancers found</div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table bordered-table mb-0" {...getTableProps()}>
                                <thead>
                                    {headerGroups.map(headerGroup => (
                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map(column => (
                                                <th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                    {column.render('Header')}
                                                    {' '}
                                                    {column.isSorted ? (column.isSortedDesc ? <FaSortDown /> : <FaSortUp />) : (<FaSort style={{ opacity: 0.3 }} />)}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody {...getTableBodyProps()}>
                                    {page.map(row => {
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

                        {/* Pagination */}
                        <div className="d-flex justify-content-end mt-auto px-3 pb-4">
                            <ul className="pagination mb-0">
                                <li className={`page-item ${!canPreviousPage ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => previousPage()}>Prev</button>
                                </li>
                                {pageOptions.map(p => (
                                    <li key={p} className={`page-item ${p === pageIndex ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => gotoPage(p)}>{p + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${!canNextPage ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => nextPage()}>Next</button>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>

            <AddFreelancerModal
                show={showAddModal}
                handleClose={() => setShowAddModal(false)}
                fetchFreelancers={fetchFreelancers}
            />

            <UpdateFreelancerModal
                show={showUpdateModal}
                handleClose={() => setShowUpdateModal(false)}
                freelancer={selectedFreelancer}
                fetchFreelancers={fetchFreelancers}
            />

            <DeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                item={selectedFreelancer}
                itemType="freelancer"
                fetchData={fetchFreelancers}
            />
        </div>
    );
};

export default FreelancersLayer;