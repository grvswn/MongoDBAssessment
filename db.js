const {MongoClient} = require('mongodb');
require('dotenv').config();

let _db = null;

async function connectToMongoDB() {
  const uri = process.env.MONGODB_URI;
  const client = await MongoClient.connect(uri);
  try {
    const db = client.db('workouts_db');
    _db = db;
    console.log('Connect to MongoDB');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    throw error;
  }
}

function getDB(){
  return _db;
}

module.exports = {connectToMongoDB, getDB};