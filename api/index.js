require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');
const bodyParser = require("body-parser")
const morgan = require('morgan');

const start = async () => {
  try {
    const client = await MongoClient.connect(
      `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`
    );
    const db = client.db(process.env.MONGO_DB);
    const Books = db.collection('books');

    const app = express();
    app.use(morgan('dev'));

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.get('/', async (req, res) => {
      res.send(`
        <html>
          <body>
            <ul>
              <li>
              <a href="/books">List Books</a>
              <a href="/books/new">New book</a>
              </li>
            </ul>
          </body>
        </html>
      `);
    });

    app.get('/books', async (req, res) => {
      res.json(await Books.find({}).toArray());
    });

    app.get('/books/new', async (req, res) => {
      res.send(`
        <html>
          <body>
            <form method="post" action="/books">
              <div><label>AuthorId<input name="authorId"></label></div>
              <div><label>Author<input name="author"></label></div>
              <div><label>Title<input name="title"></label></div>
              <div><label>Description<input name="description"></label></div>
              <button>Submit</button>
            </form>
          </body>
        </html>
      `);
    });

    app.post('/books', async (req, res) => {
      const {
        authorId,
        author,
        title,
        description
      } = req.body;
      const { insertedId } = await Books.insertOne({
        authorId,
        author,
        title,
        description,
        comments: []
      });
      res.json(await Books.findOne(ObjectId(insertedId)));
    });    

    app.listen(process.env.PORT, () => {
      console.info(`API online at ${process.env.HOST}:${process.env.PORT}`);
    });

  } catch (e) {
    console.error(e);
  }
};

start();