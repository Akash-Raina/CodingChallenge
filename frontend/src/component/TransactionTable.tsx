import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  sold: boolean;
  image: string;
  dateOfSale: string;
}

const TransactionsTable: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('3'); // Default to March
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [search, month, page, perPage]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/transactions', {
        params: {
          search,
          page,
          perPage,
          month,
        },
      });
      setProducts(response.data.Products);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search change
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMonth(e.target.value);
    setPage(1); // Reset to first page on month change
  };

  const handleNextPage = () => {
    if (page * perPage < total) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-background min-h-screen flex flex-col items-center">
      <div className="flex justify-between items-center mb-6 w-full max-w-2xl">
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search"
          className="border border-gray-300 rounded px-4 py-2 shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
        />
        <select
          value={month}
          onChange={handleMonthChange}
          className="border border-gray-300 rounded px-4 py-2 shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>
      <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
        <thead className="bg-primary text-white">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Sold</th>
            <th className="px-4 py-2">Image</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-100">
              <td className="border px-4 py-2">{product.id}</td>
              <td className="border px-4 py-2">{product.title}</td>
              <td className="border px-4 py-2">{product.description}</td>
              <td className="border px-4 py-2">${product.price}</td>
              <td className="border px-4 py-2">{product.category}</td>
              <td className="border px-4 py-2">{product.sold ? 'Yes' : 'No'}</td>
              <td className="border px-4 py-2">
                <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded-lg" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-6 w-full max-w-2xl">
        <button
          onClick={handlePreviousPage}
          disabled={page === 1}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-lg">
          Page {page} of {Math.ceil(total / perPage)}
        </span>
        <button
          onClick={handleNextPage}
          disabled={page * perPage >= total}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionsTable;
