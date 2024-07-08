import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const BarChartComponent: React.FC = () => {
  const [month, setMonth] = useState('3'); // Default to March
  const [barChartData, setBarChartData] = useState({
    labels: ['0-100', '101-200', '201-300', '301-400', '401-500', '501-600', '601-700', '701-800', '801-900', '901-above'],
    datasets: [{
      label: 'Number of Items',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      backgroundColor: '#4f46e5', // Primary color
    }]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBarChartData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/barchart', {
          params: { month }
        });

        const data = response.data;

        setBarChartData({
          labels: Object.keys(data),
          datasets: [{
            label: 'Number of Items',
            data: Object.values(data),
            backgroundColor: '#4f46e5', // Primary color
          }]
        });
      } catch (err) {
        console.error('Error fetching bar chart data:', err);
        setError('Error fetching bar chart data');
      }
    };

    fetchBarChartData();
  }, [month]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(e.target.value);
  };

  return (
    <div className="p-6 bg-background min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-primary mb-6">Bar Chart</h1>
      <div className="mb-6 w-full max-w-md">
        <label htmlFor="month" className="block text-lg text-primary font-semibold mb-2">Select Month:</label>
        <select
          id="month"
          value={month}
          onChange={handleMonthChange}
          className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
        >
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>
      </div>

      {error ? (
        <p className="text-danger text-lg">{error}</p>
      ) : (
        <div className="p-4 bg-white rounded-lg shadow-lg w-full max-w-3xl">
          <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
        </div>
      )}
    </div>
  );
};

export default BarChartComponent;
