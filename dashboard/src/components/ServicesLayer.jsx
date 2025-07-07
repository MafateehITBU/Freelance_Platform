import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import { FaSort, FaSortDown, FaSortUp } from 'react-icons/fa';
import axiosInstance from '../axiosConfig';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import AddOnModal from './modals/Service/AddOnModal';
// import ImagesModal from './modals/Service/ImagesModal';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search Services..."
    />
);

const ServicesLayer = () => {
    const [services, setServices] = useState([]);
    const [selectedAddOns, setSelectedAddOns] = useState(null);
    const [showAddOnModal, setShowAddOnModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [showImagesModal, setShowImagesModal] = useState(false);

    const fetchServices = async () => {
        try {
            const response = await axiosInstance.get('/service/all');
            setServices(response.data);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

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
    ], []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        setGlobalFilter,
        state,
    } = useTable({ columns, data: services }, useGlobalFilter, useSortBy);

    return (
        <div className="card basic-data-table">
            <ToastContainer />
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Services</h5>
                <div className="w-25">
                    <GlobalFilter globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter} />
                </div>
            </div>
            <div className="card-body p-0">
                {services.length === 0 ? (
                    <div className="text-center p-4">No services found</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0" {...getTableProps()}>
                            <thead>
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ textAlign: 'center' }}>
                                                {column.render('Header')}
                                                {' '}
                                                {column.isSorted ? (column.isSortedDesc ? <FaSortDown /> : <FaSortUp />) : <FaSort style={{ opacity: 0.3 }} />}
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
                                            {row.cells.map(cell => (
                                                <td {...cell.getCellProps()} style={{ textAlign: 'center' }}>
                                                    {cell.render('Cell')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* AddOn Modal */}
            {/* {selectedAddOns && (
                <AddOnModal
                    show={showAddOnModal}
                    handleClose={() => setShowAddOnModal(false)}
                    service={selectedAddOns}
                />
            )} */}

            {/* Images Modal */}
            {/* <ImagesModal
                show={showImagesModal}
                handleClose={() => setShowImagesModal(false)}
                images={selectedImages}
            /> */}
        </div>
    );
};

export default ServicesLayer;