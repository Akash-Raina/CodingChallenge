import express from "express";
import axios from "axios";
import { Product } from "./db";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.get("/initialize", async(req, res)=>{

    try{

        const response = await axios.get(process.env.THIRD_PARTY_API_URL as string);
        const products = response.data;

        // Insert fetched data
        await Product.insertMany(products);

        res.status(200).send('Database initialized with seed data');
    }
    catch(e){
        console.error(e)
    }
})

app.listen("3000");
