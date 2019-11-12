const { Client } = require('pg');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
const app = express();

client.connect().then(_ => {
  app.get('/artisans', (req, res, next) => {
    const sql = `
    SELECT
      a.artisan_id, m.name AS maker, a.sculpt, a.colorway, a.image
    FROM artisans a
    JOIN makers m ON m.maker_id = a.maker_id
    `;
    client.query(sql).then(qres => {
      const { rows } = qres;
      res.json(rows);
    });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}!`);
  });
});
