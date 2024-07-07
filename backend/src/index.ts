import express,{ Request, Response } from "express";
import axios from "axios";
import Product  from "./db";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/initialize", async(req: Request, res: Response)=>{

    try{

        const response = await axios.get(process.env.THIRD_PARTY_API_URL as string);
        const products = response.data;

        // Insert fetched data
        await Product.insertMany(products);

        res.status(200).send('Database initialized with seed data');
    }
    catch(e){
        console.error(e);
        res.status(500).send("error fetching data")
    }
});

app.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { search = '', page = '1', perPage = '10' } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const perPageNumber = parseInt(perPage as string, 10);

    // Create a search query based on the search parameter
    let searchQuery: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');

      searchQuery = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { price: !isNaN(parseFloat(search as string)) ? parseFloat(search as string) : null }
        ].filter(condition => condition.price !== null || condition.title || condition.description)
      };
    }

    const Products = await Product.find(searchQuery)
      .skip((pageNumber - 1) * perPageNumber)
      .limit(perPageNumber);

    const total = await Product.countDocuments(searchQuery);

    res.status(200).json({
      Products,
      total,
      page: pageNumber,
      perPage: perPageNumber
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).send('Error fetching transactions');
  }
});

app.get('/statistics', async (req: Request, res: Response) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).send('Month is required');
    }

    const parsedMonth = parseInt(month as string, 10);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).send('Invalid month');
    }

    // Calculate start and end dates for the selected month
    const startDate = new Date(new Date().getFullYear(), parsedMonth - 1, 1);
    const endDate = new Date(new Date().getFullYear(), parsedMonth, 0, 23, 59, 59, 999); // End of the month

    // Adjust the date range to include all years
    startDate.setFullYear(2020);
    endDate.setFullYear(2022);

    // Aggregate to get total sale amount, sold items, and unsold items for the selected month
    const statistics = await Product.aggregate([
      {
        $match: {
          dateOfSale: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: "$price" },
          totalSoldItems: { $sum: { $cond: { if: "$sold", then: 1, else: 0 } } },
          totalNotSoldItems: { $sum: { $cond: { if: "$sold", then: 0, else: 1 } } }
        }
      },
      {
        $project: {
          _id: 0,
          totalSaleAmount: 1,
          totalSoldItems: 1,
          totalNotSoldItems: 1
        }
      }
    ]);

    if (statistics.length === 0) {
      return res.status(404).send('No data found for the selected month');
    }

    res.status(200).json(statistics[0]);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).send('Error fetching statistics');
  }
});

app.get('/barchart', async (req: Request, res: Response) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).send('Month is required');
    }

    // Parse the month as an integer
    const parsedMonth = parseInt(month as string, 10);

    // Check if the parsed month is a valid number between 1 and 12
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).send('Invalid month');
    }

    // Create date range for the selected month regardless of the year
    const startDate = new Date(new Date().getFullYear(), parsedMonth - 1, 1);
    const endDate = new Date(new Date().getFullYear(), parsedMonth, 0, 23, 59, 59, 999); // End of the month

    // Adjust the date range to include all years
    startDate.setFullYear(2020);
    endDate.setFullYear(2022);

    // Aggregate data to get the count of items in each price range
    const barChartData = await Product.aggregate([
      {
        $match: {
          dateOfSale: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
          default: "901-above",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Transform the result to match the required response format
    const response = {
      "0-100": 0,
      "101-200": 0,
      "201-300": 0,
      "301-400": 0,
      "401-500": 0,
      "501-600": 0,
      "601-700": 0,
      "701-800": 0,
      "801-900": 0,
      "901-above": 0
    };

    barChartData.forEach((bucket: any) => {
      if (bucket._id === 0) {
        response["0-100"] = bucket.count;
      } else if (bucket._id === 100) {
        response["101-200"] = bucket.count;
      } else if (bucket._id === 200) {
        response["201-300"] = bucket.count;
      } else if (bucket._id === 300) {
        response["301-400"] = bucket.count;
      } else if (bucket._id === 400) {
        response["401-500"] = bucket.count;
      } else if (bucket._id === 500) {
        response["501-600"] = bucket.count;
      } else if (bucket._id === 600) {
        response["601-700"] = bucket.count;
      } else if (bucket._id === 700) {
        response["701-800"] = bucket.count;
      } else if (bucket._id === 800) {
        response["801-900"] = bucket.count;
      } else if (bucket._id === 900) {
        response["901-above"] = bucket.count;
      }
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    res.status(500).send('Error fetching bar chart data');
  }
});

app.get('/piechart', async (req: Request, res: Response) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).send('Month is required');
    }

    const parsedMonth = parseInt(month as string, 10);

    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).send('Invalid month');
    }

    // Calculate start and end dates for the selected month
    const startDate = new Date(new Date().getFullYear(), parsedMonth - 1, 1);
    const endDate = new Date(new Date().getFullYear(), parsedMonth, 0, 23, 59, 59, 999); // End of the month

    // Adjust the date range to include all years
    startDate.setFullYear(2020);
    endDate.setFullYear(2022);

    // Aggregate data to get unique categories and count of items in each category
    const pieChartData = await Product.aggregate([
      {
        $match: {
          dateOfSale: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } // Sort categories alphabetically if needed
      }
    ]);

    // Format the response into the desired format
    const response = pieChartData.map((item: any) => ({
      category: item._id,
      count: item.count
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    res.status(500).send('Error fetching pie chart data');
  }
});


app.get('/combinedData', async (req: Request, res: Response) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).send('Month is required');
    }

    // Make requests to all three APIs with the month parameter
    const [statisticsResponse, barchartResponse, piechartResponse] = await Promise.all([
      axios.get(`http://localhost:3000/statistics?month=${month}`),
      axios.get(`http://localhost:3000/barchart?month=${month}`),
      axios.get(`http://localhost:3000/piechart?month=${month}`)
    ]);

    const combinedData = {
      statistics: statisticsResponse.data,
      barchart: barchartResponse.data,
      piechart: piechartResponse.data
    };

    res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).send('Error fetching combined data');
  }
});

app.listen("3000");
