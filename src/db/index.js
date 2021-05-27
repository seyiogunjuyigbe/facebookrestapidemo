const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

class DB {
  connect(DB_URL) {
    mongoose
      .connect(DB_URL, options)
      .then(async () => {
        console.info(`successfully connected to ${DB_URL}`);
      })
      .catch((err) => {
        console.error(`There was a db connection error ${err}`);
        process.exit(0);
      });
    mongoose.set('useCreateIndex', true);
    const db = mongoose.connection;
    db.once('disconnected', () => {
      console.error(`successfully disconnected from ${DB_URL}`);
    });
    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        console.error('dBase connection closed due to app termination');
        process.exit(0);
      });
    });
  }
}

module.exports = DB;
