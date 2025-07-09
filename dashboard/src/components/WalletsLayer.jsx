import React, { useEffect, useState, useMemo } from 'react';
import {
    useTable,
    useGlobalFilter,
    useSortBy,
    usePagination,
} from 'react-table';
import {
    Table,
    Button,
    Modal,
    Form,
} from 'react-bootstrap';
import axiosInstance from '../axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import {
    FaCheck,
    FaEdit,
    FaSortUp,
    FaSortDown,
    FaSort,
} from 'react-icons/fa';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search Wallets..."
    />
);

const WalletsLayer = () => {
    const [wallets, setWallets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingWalletId, setEditingWalletId] = useState(null);
    const [editedBalance, setEditedBalance] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalTransactions, setModalTransactions] = useState([]);
    const [modalTitle, setModalTitle] = useState('');

    useEffect(() => {
        fetchWallets();
        fetchTransactions();
    }, []);

    const fetchWallets = async () => {
        try {
            const res = await axiosInstance.get('/wallet');
            setWallets(res.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch wallets');
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await axiosInstance.get('/transaction/admin');
            setTransactions(res.data.transactions || []);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch transactions');
            setLoading(false);
        }
    };

    const handleEditClick = (walletId, currentBalance) => {
        setEditingWalletId(walletId);
        setEditedBalance(currentBalance);
    };

    const handleSave = async (walletId) => {
        try {
            await axiosInstance.put(`/wallet/${walletId}`, {
                balance: editedBalance,
            });
            toast.success('Balance updated');
            fetchWallets();
            setEditingWalletId(null);
        } catch (error) {
            toast.error('Failed to update balance');
        }
    };

    const handleViewTransactions = (wallet) => {
        const ownerId = wallet?.owner?._id;
        const isPlatform = wallet.ownerModel?.toLowerCase() === 'admin';

        const txs = transactions.filter((tx) =>
            tx.to?._id === ownerId ||
            tx.from?._id === ownerId ||
            (isPlatform && (tx.fromModel?.toLowerCase() === 'Admin' || tx.toModel?.toLowerCase() === 'Admin'))
        );

        setModalTransactions(txs);
        setModalTitle(`${isPlatform ? 'Platform' : wallet.owner?.name}'s Transactions`);
        setShowModal(true);
    };


    const filteredWallets = useMemo(
        () => wallets.filter((w) => w.ownerModel.toLowerCase() !== 'admin'),
        [wallets]
    );

    const columns = useMemo(
        () => [
            {
                Header: '#',
                accessor: (_row, i) => i + 1,
            },
            {
                Header: 'Owner',
                accessor: (row) =>
                    row.ownerModel === 'Admin' ? 'Platform' : row.owner?.name || '-',
            },
            {
                Header: 'Balance',
                Cell: ({ row }) => {
                    const wallet = row.original;
                    return editingWalletId === wallet._id ? (
                        <Form.Control
                            type="number"
                            value={editedBalance}
                            onChange={(e) => setEditedBalance(e.target.value)}
                            style={{ maxWidth: '100px', margin: 'auto' }}
                        />
                    ) : (
                        wallet.balance
                    );
                },
            },
            {
                Header: 'Transactions',
                Cell: ({ row }) => (
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewTransactions(row.original)}
                    >
                        View
                    </Button>
                ),
            },
            {
                Header: 'Action',
                Cell: ({ row }) => {
                    const wallet = row.original;
                    return editingWalletId === wallet._id ? (
                        <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleSave(wallet._id)}
                        >
                            <FaCheck />
                        </Button>
                    ) : (
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleEditClick(wallet._id, wallet.balance)}
                        >
                            <FaEdit />
                        </Button>
                    );
                },
            },
        ],
        [editingWalletId, editedBalance]
    );

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
        {
            columns,
            data: filteredWallets,
            initialState: { pageSize: 10 },
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const platformWallet = wallets.find((w) => w.ownerModel === 'Admin');

    return (
        <div className="card basic-data-table" style={{ minHeight: '65vh' }}>
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className="card-title mb-0">Wallets & Transactions</h5>
                <div style={{ width: '300px' }}>
                    <GlobalFilter
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />
                </div>
            </div>

            {/* Platform Wallet Box */}
            {platformWallet && (
                <div className="p-3">
                    <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>Platform Wallet:</span >
                    <div className="d-flex align-items-center justify-content-around border rounded p-2 px-3 bg-light">
                        <strong>Balance: {platformWallet.balance}</strong>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleViewTransactions(platformWallet)}
                        >
                            View Transactions
                        </Button>
                    </div>
                </div>
            )}

            <div className="card-body p-0 d-flex flex-column">
                {loading ? (
                    <div className="text-center p-4">Loading...</div>
                ) : filteredWallets.length === 0 ? (
                    <div className="text-center p-4">No Wallets found</div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table bordered-table mb-0" {...getTableProps()}>
                                <thead>
                                    {headerGroups.map((headerGroup) => (
                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map((column) => (
                                                <th
                                                    {...column.getHeaderProps(
                                                        column.getSortByToggleProps()
                                                    )}
                                                    style={{ textAlign: 'center' }}
                                                >
                                                    {column.render('Header')}{' '}
                                                    {column.isSorted ? (
                                                        column.isSortedDesc ? (
                                                            <FaSortDown />
                                                        ) : (
                                                            <FaSortUp />
                                                        )
                                                    ) : (
                                                        <FaSort style={{ opacity: 0.3 }} />
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody {...getTableBodyProps()}>
                                    {page.map((row) => {
                                        prepareRow(row);
                                        return (
                                            <tr {...row.getRowProps()}>
                                                {row.cells.map((cell) => (
                                                    <td
                                                        {...cell.getCellProps()}
                                                        style={{
                                                            textAlign: 'center',
                                                            verticalAlign: 'middle',
                                                        }}
                                                    >
                                                        {cell.render('Cell')}
                                                    </td>
                                                ))}
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
                                    <button className="page-link" onClick={() => previousPage()}>
                                        Prev
                                    </button>
                                </li>
                                {pageOptions.map((p) => (
                                    <li
                                        key={p}
                                        className={`page-item ${p === pageIndex ? 'active' : ''}`}
                                    >
                                        <button className="page-link" onClick={() => gotoPage(p)}>
                                            {p + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${!canNextPage ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => nextPage()}>
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>

            {/* Modal for Transactions */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {modalTransactions.length === 0 ? (
                        <p>No transactions found.</p>
                    ) : (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Amount</th>
                                    <th>Type</th>
                                    <th>Paid At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {modalTransactions.map((tx, i) => (
                                    <tr key={tx._id}>
                                        <td>{i + 1}</td>
                                        <td>
                                            {tx.fromModel === 'Admin' ? 'Plaform' : tx.from ? (tx.from.name || tx.from.email) : 'Platform'}
                                        </td>
                                        <td>
                                            {tx.toModel === 'Admin' ? 'Platform' : tx.to ? (tx.to.name || tx.to.email) : 'Platform'}
                                        </td>
                                        <td>{tx.amount}</td>
                                        <td>{tx.type || '-'}</td>
                                        <td>{new Date(tx.paidAt).toLocaleString([], {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default WalletsLayer;
