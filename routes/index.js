import AppController from '../controllers/AppController';
import { Router } from 'express';

function controller(app) {
  const router = Router();
  app.use('/', router);

  router.get('/status', (req, res) => {
    AppController.Status(req, res);
  })

  router.get('/stats', (req, res) => {
    AppController.stats(req, res);
  })
}

export default controller;
