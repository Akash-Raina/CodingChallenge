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
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).send('Year and month are required');
    }

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

    // Total sale amount of selected month
    const totalSaleAmount = await Product.aggregate([
      { $match: { sold: true, dateOfSale: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    // Total number of sold items of selected month
    const totalSoldItems = await Product.countDocuments({
      sold: true,
      dateOfSale: { $gte: startDate, $lte: endDate }
    });

    // Total number of not sold items of selected month
    const totalNotSoldItems = await Product.countDocuments({
      sold: false,
      dateOfSale: { $gte: startDate, $lte: endDate }
    });

    res.status(200).json({
      totalSaleAmount: totalSaleAmount.length > 0 ? totalSaleAmount[0].total : 0,
      totalSoldItems,
      totalNotSoldItems
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).send('Error fetching statistics');
  }
});


app.listen("3000");
