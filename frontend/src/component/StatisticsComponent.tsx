import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StatisticsComponent: React.FC = () => {
  const [month, setMonth] = useState('3'); // Default to March
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get('http://localhost:3000/statistics', {
          params: { month }
        });
        setStatistics(response.data);
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('Error fetching statistics');
      }
    };

    fetchStatistics();
  }, [month]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(e.target.value);
  };

  return (
    <div className="p-6 bg-background min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-primary mb-6">Statistics</h1>
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
        <div className="p-4 bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Statistics for Month {month}</h2>
          <div className="text-lg">
            <p className="mb-2"><strong>Total Sale Amount:</strong> ${statistics.totalSaleAmount}</p>
            <p className="mb-2"><strong>Total Sold Items:</strong> {statistics.totalSoldItems}</p>
            <p className="mb-2"><strong>Total Not Sold Items:</strong> {statistics.totalNotSoldItems}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsComponent;
