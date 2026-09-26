require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.DATABASE_URL).then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  
  if (users.length > 0) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    for (const user of users) {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      console.log('User email:', user.email, '| New Password: 123456');
    }
  } else {
    console.log('No users found.');
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
