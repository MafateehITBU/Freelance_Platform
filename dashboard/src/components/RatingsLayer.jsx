import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy, usePagination } from 'react-table';
import axiosInstance from "../axiosConfig";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Ratings..."
    />
);

const RatingsLayer = () => {
    const [ratings, setRatings] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/rating');
            setRatings(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const columns = React.useMemo(() => [
        {
            Header: '#',
            accessor: (_row, i) => i + 1,
        },
        {
            Header: 'User',
            accessor: row => row.userId?.name || '-',
        },
        {
            Header: 'Freelancer',
            accessor: row => row.freelancerId?.name || '-',
        },
        {
            Header: 'Rate',
            accessor: row => {
                const rate = row.rate || 0;
                return (
                    <span style={{ color: '#f39c12', fontSize: '1.2em' }}>
                        {'★'.repeat(rate)}{' '}
                        {'☆'.repeat(5 - rate)}
                    </span>
                );
            },
        },
        {
            Header: 'Comment',
            accessor: row => {
                const comment = row.comment || '-';
                return (
                    <span style={{ maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {comment}
                    </span>
                );

            }
        },
    ], []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        setGlobalFilter,
        state,
        pageOptions,
        gotoPage,
        nextPage,
        previousPage,
        canNextPage,
        canPreviousPage,
    } = useTable(
        { columns, data: ratings, initialState: { pageIndex: 0, pageSize: 10 } },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const { pageIndex, globalFilter } = state;

    return (
        <div className="card basic-data-table" style={{ minHeight: '65vh' }}>
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Ratings</h5>
                <div className="w-35 w-md-100 w-sm-100">
                    <GlobalFilter
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        className="form-control"
                    />
                </div>
            </div>
            <div className="card-body d-flex flex-column p-0">
                {ratings.length === 0 ? (
                    <div className="text-center p-4">No ratings found</div>
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
        </div>
    );
};

export default RatingsLayer;
