import Stock from '../models/stock'
import StockLike from '../models/stock_likes'
import { Types } from 'mongoose';
import * as intrinioSDK from 'intrinio-sdk';
import { promisify } from 'util';

intrinioSDK.ApiClient.instance.authentications['ApiKeyAuth'].apiKey = process.env.intrinioSDK_API_KEY;
const securityAPI = new intrinioSDK.SecurityApi();

const getStockPrice = async (stock) => {
  
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate( startDate.getDate() - 5 );
  
  const opts = {
    startDate,
    endDate,
    frequency: "daily",
    pageSize: 100,
    nextPage: null
  };
  
  let data = null;
  
  try {
      const { stock_prices } = await securityAPI.getSecurityStockPrices(stock, opts);
      [data] = stock_prices;
      return data;
    }
    catch(err) {
      return {
        error: err.message,
        stock
      }
    }

    if(!data) {
      return {
        error: 'stock does not exist',
        stock
      }
    }
}

const updateStock = async (stockDoc, date) => {
  if(stockDoc.fetchDate.getTime() !== date.getTime() && date.getDay() % 6 !== 0) {
    
    const data = await getStockPrice(stockDoc._id);

    if(data.error) {
      return data
    }
    
    const { close: price = null, date: fetchDate } = data;
  
    stockDoc.fetchDate = fetchDate;
    stockDoc.price = price;
    
    await stockDoc.save();
  }
}

const updateStockLikes = async (like, stockDoc, stockLikeDoc) => {
  const containsStock = stockLikeDoc.stocks.includes(stockDoc._id);

  if(like && !containsStock) {
    stockLikeDoc.stocks.push(stockDoc._id)
    await stockLikeDoc.save();
    stockDoc.likes += 1;
    stockDoc = await stockDoc.save();
  }

  if(!like && containsStock) {
    const index = stockLikeDoc.stocks.findIndex(pr => pr === stockDoc._id);
    stockLikeDoc.stocks.splice(index, 1);
    await stockLikeDoc.save();
    stockDoc.likes -= 1;
    stockDoc = await stockDoc.save();
  } 
}

const getPrices = async (req, res) => {
  let {
    stock = null,
    like = null
  } = req.query;
  
  like = like === "true" ? true : false;
  
  const currentDate = new Date();
  const { remoteAddress } = req.connection;
  
  if(!stock) {
    return res.json({
      error: 'No stocks founds'
    })
  }
  
  if (Array.isArray(stock)) {
  
    const stockIds = stock;
    
    const stocks = await Stock.find({
    _id: { 
      $in: stockIds
    }})
    
    if(stocks.length < 2) {
      const missingStocks = stockIds.filter(pr => !stocks.some(npr => npr._id === pr))
      
      for(const missingStock of missingStocks) {
        
        const data = await getStockPrice(missingStock);

        if(data.error) {
          return res.json(data)
        }
        
        const { close: price, date: fetchDate } = data;
        const likes = like ? 1 : 0;

        const stockDoc = new Stock({
          _id: missingStock,
          price,
          fetchDate,
          likes
        });

        await stockDoc.save();
        
        stocks.push(stockDoc);
      }
    }
      
    const [firstStock, secondStock] = stocks;
    
    let stockLikeDoc = await StockLike.findById(remoteAddress);
  
    if(!stockLikeDoc) {
      const stocks = []

      if(like) {
        stocks.push(firstStock._id)
        stocks.push(secondStock._id)
      }

      stockLikeDoc = new StockLike({
        _id: remoteAddress,
        stocks
      })

      await stockLikeDoc.save();
    }
    
    await updateStockLikes(like, firstStock, stockLikeDoc);
    await updateStockLikes(like, secondStock, stockLikeDoc);
    await updateStock(firstStock, currentDate);
    await updateStock(secondStock, currentDate);
      
    const computedStocks = [
      {
        rel_likes: firstStock.likes - secondStock.likes,
        stock: firstStock._id,
        price: firstStock.price
      },
      {
        rel_likes: secondStock.likes - firstStock.likes,
        stock: secondStock._id,
        price: secondStock.price
      }
    ]

    return res.json(computedStocks);
  }
  
  let data = {
    close: null,
    date: null,
    error: null
  };
  
  let stockDoc = await Stock.findById(stock);

  if(!stockDoc) {
    
    data = await getStockPrice(stock);
    
    if(data.error) {
      return res.json(data)
    }

    const { close: price, date: fetchDate } = data;
    const likes = like ? 1 : 0;
    
    stockDoc = new Stock({
      _id: stock,
      price,
      fetchDate,
      likes
    });
    
    await stockDoc.save();
    
    let stockLikeDoc = await StockLike.findById(remoteAddress);
  
    if(!stockLikeDoc) {
      stockLikeDoc = new StockLike({
        _id: remoteAddress,
        stocks: like ? [
          stockDoc._id
        ] : []
      })
      
      await stockLikeDoc.save();
    }
    
    return res.json({
      stock,
      price,
      likes
    })
  }

  let stockLikeDoc = await StockLike.findById(remoteAddress);
  
  if(!stockLikeDoc) {
    const stocks = []
    
    if(like) {
      stocks.push(stockDoc._id)
    }
    
    stockLikeDoc = new StockLike({
      _id: remoteAddress,
      stocks
    })
      
    await stockLikeDoc.save();
  }
  
  await updateStockLikes(like, stockDoc, stockLikeDoc);
  
  const containsStock = stockLikeDoc.stocks.includes(stockDoc._id);

  await updateStock(stockDoc, currentDate);
  
  return res.json({
    stock,
    price: stockDoc.price,
    likes: stockDoc.likes
  })
}

export default {
  getPrices 
}

