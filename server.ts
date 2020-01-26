import * as express from 'express';
import * as cors from 'cors';
import * as moment from 'moment';
import * as pretty from 'express-prettify';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import pug from 'pug';
import routes from './routes';
import * as mongo from 'mongodb'
import * as mongoose from 'mongoose'
const app = express();
const port = process.env.PORT as any;

const corsOptions: any = {
  optionSuccessStatus: 200
};

const mongoDbOptions = { 
  useNewUrlParser: true ,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}

app.use(helmet())
app.use(bodyParser.urlencoded({'extended': false}));
app.use(pretty({ query: 'pretty' }));
app.set('view engine', 'pug');
app.set('views', 'views');
app.use(express.static(__dirname + '/public'));

app.use(cors(corsOptions));

routes(app);

const mongoConnectionString = process.env.mongoConnectionString;

mongoose.connect(mongoConnectionString, mongoDbOptions);

const listener = app.listen(port, () => {
  
  console.log('Listening on port ' + port);
});