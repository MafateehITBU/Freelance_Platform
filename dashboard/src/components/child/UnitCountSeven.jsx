import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axiosConfig';

const UnitCountSeven = () => {
    const [freelancerCount, setFreelancerCount] = useState(0);
    const [influencerCount, setInfluencerCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [serviceCount, setServiceCount] = useState(0);
    const [ordersCount, setOrdersCount] = useState(0);
    const [categoriesCount, setCategoriesCount] = useState(0);

    useEffect(() => {
        const fetchfreelancerCount = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/freelancer');
                setFreelancerCount(response.data.length);
            } catch (error) {
                console.error('Error fetching freelancers count:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchInfluencerCount = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/influencer');
                setInfluencerCount(response.data.length);
            } catch (error) {
                console.error('Error fetching influencers count:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserCount = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/user');
                setUserCount(response.data.length);
            } catch (error) {
                console.error('Error fetching users count:', error);
            } finally {
                setLoading(false);
            }
        }

        const fetchServicesCount = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/service/all');
                setServiceCount(response.data.length);
            } catch (error) {
                console.error('Error fetching service count:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchOrdersCount = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/order/all');
                setOrdersCount(response.data.length);
            } catch (error) {
                console.error('Error fetching spare parts count:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchCategoriesCount = async () => {  
            try {
                setLoading(true);
                const response = await axiosInstance.get('/category');
                setCategoriesCount(response.data.categories.length);
            } catch (error) {
                console.error('Error fetching categories count:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchfreelancerCount();
        fetchInfluencerCount();
        fetchUserCount();
        fetchServicesCount();
        fetchOrdersCount();
        fetchCategoriesCount();
    }, []);

    return (
        <>
            <div className='col-12'>
                <div className='card radius-12'>
                    <div className='card-body p-16'>
                        <div className='row gy-4'>
                            <div className='col-xxl-4 col-xl-5 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-1 left-line line-bg-primary position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Freelancers
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : (
                                                    freelancerCount
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-primary-100 text-primary-600'>
                                            <i className='ri-user-settings-line' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Total Freelancers{" "}
                                    </p>
                                </div>
                            </div>
                            <div className='col-xxl-4 col-xl-5 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-2 left-line line-bg-lilac position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Influencers
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : error ? (
                                                    <span className="text-danger-main">Error</span>
                                                ) : (
                                                    influencerCount
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-lilac-200 text-lilac-600'>
                                            <i className='ri-brush-fill' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Total Influencers{" "}
                                    </p>
                                </div>
                            </div>
                            <div className='col-xxl-4 col-xl-5 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-3 left-line line-bg-success position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Users
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : error ? (
                                                    <span className="text-danger-main">Error</span>
                                                ) : (
                                                    userCount
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-success-200 text-success-600'>
                                            <i className='ri-tools-fill' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Total Usres{" "}
                                    </p>
                                </div>
                            </div>

                            <div className='col-xxl-4 col-xl-5 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-2 left-line line-bg-lilac position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Categories
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : (
                                                    categoriesCount
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-lilac-200 text-lilac-600'>
                                            <i className='ri-building-2-line' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Total Categories{" "}
                                    </p>
                                </div>
                            </div>
                            <div className='col-xxl-4 col-xl-5 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-3 left-line line-bg-success position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Services
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : (
                                                    serviceCount
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-success-200 text-success-600'>
                                            <i className='ri-store-2-line' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Total Services{" "}
                                    </p>
                                </div>
                            </div>
                            <div className='col-xxl-4 col-xl-5 col-sm-6'>
                                <div className='px-20 py-16 shadow-none radius-8 h-100 gradient-deep-4 left-line line-bg-warning position-relative overflow-hidden'>
                                    <div className='d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8'>
                                        <div>
                                            <span className='mb-2 fw-medium text-secondary-light text-md'>
                                                Orders
                                            </span>
                                            <h6 className='fw-semibold mb-1'>
                                                {loading ? (
                                                    <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                                                ) : (
                                                    ordersCount
                                                )}
                                            </h6>
                                        </div>
                                        <span className='w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-warning-200 text-warning-600'>
                                            <i className='ri-tools-line' />
                                        </span>
                                    </div>
                                    <p className='text-sm mb-0'>
                                        Total Orders{" "}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UnitCountSeven;
