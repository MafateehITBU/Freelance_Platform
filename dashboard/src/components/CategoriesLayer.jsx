import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../axiosConfig";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import CreateCategoryModal from './modals/Category/CreateCategoryModal.jsx';
import EditCategoryModal from './modals/Category/EditCategoryModal.jsx';
import DeleteModal from './modals/DeleteModal.jsx';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Categories..."
    />
);

const CategoriesLayer = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedCategoryEdit, setSelectedCategoryEdit] = useState(null);
    const [selectedCategoryDelete, setSelectedCategoryDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/category/subcategories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleDelete = async (category) => {
        setSelectedCategoryDelete(category);
        setShowDeleteModal(true);
    };

    const closeModal = () => setSelectedCategory(null);

    const columns = React.useMemo(() => [
        {
            Header: '#',
            Cell: ({ row }) => row.index + 1 + pageIndex * pageSize,
        },
        {
            Header: 'Photo',
            accessor: 'image',
            Cell: ({ value }) => (
                <img
                    src={value}
                    alt="Category Image"
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
            ),
        },
        { Header: 'Name', accessor: row => row.name || '-' },
        {
            Header: 'Description',
            accessor: row => row.description || '-',
            Cell: ({ value }) => (
                <span
                    style={{
                        display: 'block',
                        maxWidth: '200px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                    }}
                >
                    {value}
                </span>
            )
        },
        {
            Header: 'Subcategories',
            accessor: row =>
                row.subcategories?.length
                    ? row.subcategories.map(sub => sub.name).join(', ')
                    : '-',
            Cell: ({ value }) => (
                <span
                    style={{
                        display: 'block',
                        maxWidth: '200px',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                    }}
                >
                    {value}
                </span>
            )
        },
        {
            Header: 'Actions',
            Cell: ({ row }) => (
                <div className="d-flex justify-content-center gap-2">
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => { setSelectedCategoryEdit(row.original); setEditModalShow(true); }}
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
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        nextPage,
        previousPage,
        gotoPage,
        setPageSize,
        state: { pageIndex, pageSize, globalFilter },
        setGlobalFilter,
    } = useTable(
        {
            columns,
            data: categories,
            initialState: { pageSize: 5, pageIndex: 0 },
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );


    return (
        <div className="card basic-data-table" style={{ minHeight: '65vh' }}>
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Categories</h5>
                <div className="w-35 w-md-100 w-sm-100">
                    <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} className="form-control" />
                </div>
                <div className="w-35 w-md-100 w-sm-100">
                    <button
                        className="btn btn-success w-100 w-md-auto"
                        onClick={() => setShowModal(true)}
                    >
                        <span className="ms-1">Create New Category</span>
                    </button>
                </div>
            </div>
            <div className="card-body p-0 d-flex flex-column">
                {categories.length === 0 ? (
                    <div className="text-center p-4">No categories found</div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table bordered-table mb-0" {...getTableProps()}>
                                <thead>
                                    {headerGroups.map(headerGroup => (
                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map(column => (
                                                <th {...column.getHeaderProps(column.getSortByToggleProps())} style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                                                    {column.render('Header')}{' '}
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

            {/* Create New Category Modal */}
            <CreateCategoryModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                fetchData={fetchData}
            />

            {selectedCategoryEdit && (
                <EditCategoryModal
                    show={editModalShow}
                    handleClose={() => setEditModalShow(false)}
                    fetchData={fetchData}
                    selectedCategory={selectedCategoryEdit}
                />
            )}

            {/* Delete Modal */}
            {selectedCategoryDelete && (
                <DeleteModal
                    show={showDeleteModal}
                    handleClose={() => setShowDeleteModal(false)}
                    item={selectedCategoryDelete}
                    itemType="category"
                    fetchData={fetchData}
                />
            )}
        </div>
    );
};

export default CategoriesLayer;
