import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../axiosConfig.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import DeleteModal from './modals/DeleteModal.jsx';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Users..."
    />
);

const UsersLayer = () => {
    const [Users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axiosInstance.get('/user');
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleDeleteUser = (User) => {
        setSelectedUser(User);
        setShowDeleteModal(true);
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
                <img
                    src={value}
                    alt="Profile"
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
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
            Header: 'Actions',
            Cell: ({ row }) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteUser(row.original)}
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
        state: { pageIndex, globalFilter },
        setGlobalFilter,
    } = useTable(
        { columns, data: Users, initialState: { pageSize: 10 } },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    return (
        <div className="card basic-data-table" style={{ minHeight: '65vh' }}>
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Users</h5>
                <div className="w-35 w-md-100 w-sm-100">
                    <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} className="form-control" />
                </div>
            </div>
            <div className="card-body p-0 d-flex flex-column">
                {loading ? (
                    <div className="text-center p-4">Loading...</div>
                ) : Users.length === 0 ? (
                    <div className="text-center p-4">No Users found</div>
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

            <DeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                item={selectedUser}
                itemType="user"
                fetchData={fetchUsers}
            />
        </div>
    );
};

export default UsersLayer;
