import homeController from './../controllers/home'
import stockController from './../controllers/stock'

export default (app: any) => {
  app.get("/api/stock-prices", stockController.getPrices);
  app.get("/", homeController.get);
}