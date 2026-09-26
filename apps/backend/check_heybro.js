require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const db = mongoose.connection.db;
  const heybro = await db.collection('restaurants').findOne({ name: /heybro/i });
  console.log(JSON.stringify(heybro, null, 2));
  process.exit(0);
});
