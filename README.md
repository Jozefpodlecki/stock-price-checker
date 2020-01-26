
# Information Security and Quality Assurance Projects - Stock Price Checker

### User story:

1. Set the content security policies to only allow loading of scripts and CSS from your server.
2. I can GET /api/stock-prices with form data containing a Nasdaq stock ticker and receive back an object stockData.
3. In stockData, I can see the stock (the ticker as a string), price (decimal in string format), and likes (int).
4. I can also pass along field like as true (boolean) to have my like added to the stock(s). Only 1 like per IP should be accepted.
5. If I pass along 2 stocks, the return object will be an array with information about both stocks. Instead of likes, it will display rel_likes (the difference between the likes on both stocks) on both.
6. A good way to receive current prices is through our stock price proxy (replacing 'GOOG' with your stock symbol): https://repeated-alpaca.glitch.me/v1/stock/GOOG/quote
7. All 5 functional tests are complete and passing.