import AppController from '../controllers/AppController';
import FilesController from '../controllers/FilesController';
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

  router.post('/files', (req, res) => {
    FilesController.postUpload(req, res);
  })

  router.get('/files/:id', (req, res) => {
    FilesController.getShow(req, res);
  })

  router.get('/files', (req, res) => {
    FilesController.getShow(req, res);
  })

  router.put('/files/:id/publish', (req, res) => {
    FilesController.putPublish(req, res);
  })

  router.put('/files/:id/publish', (req, res) => {
    FilesController.putUnpublish(req, res);
  })

  router.get('/files/:id/data', (req, res) => {
    FilesController.getFile(req, res);	  
  })
}

export default controller;
