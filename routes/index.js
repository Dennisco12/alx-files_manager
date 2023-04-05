import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../constrollers/UsersController';
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

  router.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  })

  router.get('/connect', (req, res) => {
    AuthController.getConnect(req, res);
  })

  router.get('/disconnect', (req, res) => {
    AuthController.getDisconnect(req, res);
  })

  router.get('/users/me', (req, res) => {
    UsersController.getMe(req, res);
  })
}

export default controller;
