import express from 'express';
import controller from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

/*injectMiddlewares(app);
router(app);
startServer(app);*/

app.use(express.json());
app.use(express.urlencoded());
controller(app);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
