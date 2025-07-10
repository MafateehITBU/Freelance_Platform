import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../axiosConfig";
import { Icon } from "@iconify/react";

const TopFreelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await axiosInstance.get("/order/completed-count");
        // Sort freelancers by closedTicketsCount in descending order and take top 5
        const sortedfreelancers = response.data
          .sort((a, b) => b.completedOrdersCount - a.completedOrdersCount)
          .slice(0, 7);
        setFreelancers(sortedfreelancers);
      } catch (error) {
        console.error("Error fetching freelancers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  return (
    <div className='col-xxl-8 col-md-6'>
      <div className='card h-100'>
        <div className='card-header'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Top Freelancers</h6>
            <Link
              to='/freelancers'
              className='text-primary-600 hover-text-primary d-flex align-items-center gap-1'
            >
              View All
              <Icon icon='solar:alt-arrow-right-linear' className='icon' />
            </Link>
          </div>
        </div>
        <div className='card-body p-24'>
          <div className='table-responsive scroll-sm'>
            <table className='table bordered-table mb-0'>
              <thead>
                <tr>
                  <th scope='col' className="text-center">Rank</th>
                  <th scope='col' className="text-center">Freelancer</th>
                  <th scope='col' className="text-center">Completed Ordres</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center">
                      <Icon icon="eos-icons:loading" className="icon" />
                    </td>
                  </tr>
                ) : freelancers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center">No freelancers found</td>
                  </tr>
                ) : (
                  freelancers.map((freelancer, index) => (
                    <tr key={index}>
                      <td className="text-center">
                        <span className='text-secondary-light'>{index + 1}</span>
                      </td>
                      <td className="text-center">
                        <span className='text-secondary-light'>
                          {freelancer.name}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className='text-secondary-light'>{freelancer.completedOrdersCount}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopFreelancers;
