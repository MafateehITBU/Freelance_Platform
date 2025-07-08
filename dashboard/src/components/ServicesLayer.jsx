import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import axiosInstance from "../axiosConfig.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import ImagesModal from './modals/Service/ImagesModal.jsx';
import AddOnModal from './modals/Service/AddOnModal.jsx';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Services..."
    />
);

const ServicesLayer = () => {
    const [Services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAddOns, setSelectedAddOns] = useState(null);
    const [showAddOnModal, setShowAddOnModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [showImagesModal, setShowImagesModal] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await axiosInstance.get('/service/all');
            setServices(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleApprove = async (serviceId) => {
        try {
            await axiosInstance.put(`/service/${serviceId}/approve`);
            toast.success('Service approved/ rejected successfully!', { position: "top-right" });
            fetchServices();
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
            Header: 'Title',
            accessor: 'title',
        },
        {
            Header: 'Category',
            accessor: row => row.category?.name || '-',
        },
        {
            Header: 'Subcategory',
            accessor: row => row.subCategory?.name || '-',
        },
        {
            Header: 'Price',
            accessor: 'price',
        },
        {
            Header: 'Freelancer',
            accessor: row => row.freelancer?.name || '-',
        },
        {
            Header: 'Keywords',
            accessor: 'keywords',
            style: { whiteSpace: 'normal' },
            Cell: ({ row }) => (
                <span
                    style={{
                        display: 'block',
                        maxWidth: '200px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                    }}
                >
                    {row.original.keywords?.length
                        ? row.original.keywords.join(', ')
                        : '-'}
                </span>
            ),
        },
        {
            Header: 'Images',
            Cell: ({ row }) => (
                <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                        setSelectedImages(row.original.images);
                        setShowImagesModal(true);
                    }}
                >
                    View
                </button>
            ),
        },
        {
            Header: 'Add-ons',
            Cell: ({ row }) => (
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                        setSelectedAddOns(row.original);
                        setShowAddOnModal(true);
                    }}
                >
                    View
                </button>
            ),
        },
        {
            Header: 'Approved',
            accessor: 'approved',
            Cell: ({ row, value }) => {
                const serviceId = row.original._id;
                const badgeColor = value === true ? 'success' : value === false ? 'danger' : 'secondary';
                const badgeText = value === true ? 'Verified' : value === false ? 'Rejected' : 'Take Action';

                return (
                    <div className="dropdown">
                        <span className={`badge bg-${badgeColor} dropdown-toggle`} data-bs-toggle="dropdown" role="button" style={{ cursor: 'pointer' }}>
                            {badgeText}
                        </span>
                        <ul className="dropdown-menu">
                            {value !== true && <li><button className="dropdown-item" onClick={() => handleApprove(serviceId)}>Approve</button></li>}
                            {value !== false && <li><button className="dropdown-item" onClick={() => handleApprove(serviceId)}>Reject</button></li>}
                        </ul>
                    </div>
                );
            }
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
        { columns, data: Services, initialState: { pageSize: 10 } },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    return (
        <div className="card basic-data-table" style={{ minHeight: '65vh' }}>
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Services</h5>
                <div className="w-35 w-md-100 w-sm-100">
                    <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} className="form-control" />
                </div>
            </div>
            <div className="card-body p-0 d-flex flex-column">
                {loading ? (
                    <div className="text-center p-4">Loading...</div>
                ) : Services.length === 0 ? (
                    <div className="text-center p-4">No Services found</div>
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

            {/* Images Modal */}
            <ImagesModal
                show={showImagesModal}
                handleClose={() => setShowImagesModal(false)}
                images={selectedImages}
            />

            {/* Add On Modal */}
            <AddOnModal
                show={showAddOnModal}
                handleClose={() => setShowAddOnModal(false)}
                service={selectedAddOns}
            />
        </div>
    );
};

export default ServicesLayer;