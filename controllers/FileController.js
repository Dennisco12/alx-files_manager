import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import mime from "mime-types";
import Queue from "bull";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import { objectID } from "mongodb";

const fileQueue = new Queue("fileQueue", "redis://127.0.0.1:6379");

class FileController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const users = dbClient.userCollection();
    const objectId = new ObjectID(userId);
    const user = await users.findOne({ _id: objectId });

    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const { name } = req.body;
    const { type } = req.body;
    const { parentId } = req.body;
    const isPublic = req.body.isPublic || false;
    const { data } = req.body;
    if (!name) {
      return res.status(400).send({ error: 'Missing name' });
    }
    if (!type || (type != 'folder' && type != 'file' && type != 'image')) {
      return res.status(400).send({ error: 'Missing type' });
    }
    if (!data && type != 'folder') {
      return res.status(400).send({ error: 'Missing data' });
    }

    const files = dbClient.fileCollection();
    if (parentId) {
      const objectId = new ObjectID(parentId);
      const file = await files.findOne({ _id: objectId, userId: user._id });
      if (!file) {
        return res.status(400).send({ error: 'Parent not found' })
      }
      if (file.type !== "folder") {
        return res.status(400).send({ error: 'Parent is not a folder' });
      }
    }
    if (type === 'folder') {
      files
        .insertOne({
          userId: user._id,
          name,
          type,
          parentId: parentId || 0,
          isPublic,
        })
        .then((result) => 
          res.status(201).send({
            id: result.insertedId,
            userId: user._id,
            name, type,
            isPublic,
            parentId: parentId || 0,
          })
	).catch((err) => {
          console.log(err);
	})
    } else {
      const filePath = process.env.FOLDER_PATH || "/tmp/files_manager";
      const fileName = `{filePath}/${uuidv4()}`;
      const buff = Buffer.from(data, "base64");
      try {
        try {
          await fs.mkdir(filePath);
        } catch (error) {}
        await fs.writeFile(fileName, buff, 'utf-8');
      } catch (error) {
        console.log(error);
      }
      files
        .insertOne({
          userId: user._id,
          name,
          type,
          isPublic,
          parentId: parentId || 0,
          localPath: fileName,
        })
        .then((result) => {
          res.status(201).json({
            id: result.insertedId,
            userId: user._id,
            name,
            type,
            isPublic,
            parentId: parentId || 0,
          });
          if (type === "image") {
            fileQueue.add({
              userId: user._id,
              fileId: result.insertedId,
            });
          }
        })
        .catch((error) => console.log(error));
    }
    return null;
  },

  async getIndex(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }
    const { parentId, page } = request.query;
    const pageNum = page || 0;
    const files = dbClient.db.collection("files");
    let query;
    if (!parentId) {
      query = { userId: user._id };
    } else {
      query = { userId: user._id, parentId: ObjectID(parentId) };
    }
    files
      .aggregate([
        { $match: query },
        { $sort: { _id: -1 } },
        {
          $facet: {
            metadata: [
              { $count: "total" },
              { $addFields: { page: parseInt(pageNum, 10) } },
            ],
            data: [{ $skip: 20 * parseInt(pageNum, 10) }, { $limit: 20 }],
          },
        },
      ])
      .toArray((err, result) => {
        if (result) {
          const final = result[0].data.map((file) => {
            const tmpFile = {
              ...file,
              id: file._id,
            };
            delete tmpFile._id;
            delete tmpFile.localPath;
            return tmpFile;
          });
          // console.log(final);
          return response.status(200).json(final);
        }
        console.log("Error occured");
        return response.status(404).json({ error: "Not found" });
      });
    return null;
  },

  async putPublish(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }
    const { id } = request.params;
    const files = dbClient.db.collection("files");
    const idObject = new ObjectID(id);
    const newValue = { $set: { isPublic: true } };
    const options = { returnOriginal: false };
    files.findOneAndUpdate(
      { _id: idObject, userId: user._id },
      newValue,
      options,
      (err, file) => {
        if (!file.lastErrorObject.updatedExisting) {
          return response.status(404).json({ error: "Not found" });
        }
        return response.status(200).json(file.value);
      }
    );
    return null;
  },

  async putUnpublish(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: "Unauthorized" });
    }
    const { id } = request.params;
    const files = dbClient.db.collection("files");
    const idObject = new ObjectID(id);
    const newValue = { $set: { isPublic: false } };
    const options = { returnOriginal: false };
    files.findOneAndUpdate(
      { _id: idObject, userId: user._id },
      newValue,
      options,
      (err, file) => {
        if (!file.lastErrorObject.updatedExisting) {
          return response.status(404).json({ error: "Not found" });
        }
        return response.status(200).json(file.value);
      }
    );
    return null;
  },

  async getFile(request, response) {
    const { id } = request.params;
    const files = dbClient.db.collection("files");
    const idObject = new ObjectID(id);
    files.findOne({ _id: idObject }, async (err, file) => {
      if (!file) {
        return response.status(404).json({ error: "Not found" });
      }
      console.log(file.localPath);
      if (file.isPublic) {
        if (file.type === "folder") {
          return response
            .status(400)
            .json({ error: "A folder doesn't have content" });
        }
        try {
          let fileName = file.localPath;
          const size = request.param("size");
          if (size) {
            fileName = `${file.localPath}_${size}`;
          }
          const data = await fs.readFile(fileName);
          const contentType = mime.contentType(file.name);
          return response
            .header("Content-Type", contentType)
            .status(200)
            .send(data);
        } catch (error) {
          console.log(error);
          return response.status(404).json({ error: "Not found" });
        }
      } else {
        const user = await FilesController.getUser(request);
        if (!user) {
          return response.status(404).json({ error: "Not found" });
        }
        if (file.userId.toString() === user._id.toString()) {
          if (file.type === "folder") {
            return response
              .status(400)
              .json({ error: "A folder doesn't have content" });
          }
          try {
            let fileName = file.localPath;
            const size = request.param("size");
            if (size) {
              fileName = `${file.localPath}_${size}`;
            }
            const contentType = mime.contentType(file.name);
            return response
              .header("Content-Type", contentType)
              .status(200)
              .sendFile(fileName);
          } catch (error) {
            console.log(error);
            return response.status(404).json({ error: "Not found" });
          }
        } else {
          console.log(
            `Wrong user: file.userId=${file.userId}; userId=${user._id}`
          );
          return response.status(404).json({ error: "Not found" });
        }
      }
    });
  },
};

module.exports = FilesController;
