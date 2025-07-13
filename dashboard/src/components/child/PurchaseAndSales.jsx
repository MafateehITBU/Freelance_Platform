import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../axiosConfig";

const PurchaseAndSales = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState({
    series: [{
      name: 'Orders Count',
      data: [0]
    }],
    categories: ['No Data']
  });

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get('/order/category-count');
      const categories = response.data || [];

      const names = categories.map(cat => cat.name);
      const counts = categories.map(cat => cat.ordersCount);

      setChartData({
        series: [{
          name: 'Orders Count',
          data: counts
        }],
        categories: names
      });
    } catch (error) {
      console.error('Error fetching order category data:', error);
      setChartData({
        series: [{
          name: 'Orders Count',
          data: [0]
        }],
        categories: ['Error']
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      animations: { enabled: true }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val;
      },
      style: {
        fontSize: '12px',
        colors: ['#304758']
      }
    },
    xaxis: {
      categories: chartData.categories,
      title: { text: 'Category Name' },
      labels: {
        rotate: -45,
        style: { fontSize: '12px' }
      }
    },
    yaxis: {
      title: { text: 'Orders Placed' },
      min: 0,
      max: 20,
      tickAmount: 4, // 0, 5, 10, 15, 20
      labels: {
        formatter: function (val) {
          return Math.floor(val);
        }
      }
    },
    fill: {
      opacity: 1,
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return `${val} orders`;
        }
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      padding: { top: 0, right: 0, bottom: 0, left: 0 }
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.8
        }
      }
    }
  };

  return (
    <div className='col-xxl-8 col-md-6'>
      <div className='card h-100'>
        <div className='card-header'>
          <div className='d-flex align-items-center flex-wrap gap-2 justify-content-between'>
            <h6 className='mb-2 fw-bold text-lg mb-0'>Order & Category Analysis</h6>
          </div>
        </div>
        <div className='card-body p-24 d-flex align-items-center justify-content-center'>
          <div id='ticketTimeChart' style={{ width: '100%', maxWidth: '800px' }}>
            <ReactApexChart
              options={chartOptions}
              series={chartData.series}
              type='bar'
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseAndSales;