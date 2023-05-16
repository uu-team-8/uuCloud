const { MongoClient } = require("mongodb");

const mongo_uri = process.env.MONGO_URI;
const mongo_db = process.env.MONGO_DB;
const mongo_users_collection = process.env.MONGO_USERS_COLLECTION;
const mongo_gateways_collection = process.env.MONGO_GATEWAYS_COLLECTION;
const mongo_sensors_collection = process.env.MONGO_SENSORS_COLLECTION;

async function getUsers() {
  const client = new MongoClient(mongo_uri);
  const database = client.db(mongo_db);
  const collection = database.collection(mongo_users_collection);
  const query = {};
  var users = await collection.find(query).toArray();
  client.close();
  return users;
}

async function getUser(email) {
  const client = new MongoClient(mongo_uri);
  const database = client.db(mongo_db);
  const collection = database.collection(mongo_users_collection);
  const query = { email: email };
  var user = await collection.find(query).toArray();
  client.close();
  return user;
}

async function checkNicknameEMail(nickname, email) {
  const client = new MongoClient(mongo_uri);
  const database = client.db(mongo_db);
  const collection = database.collection(mongo_users_collection);
  const queryEmail = { email: email };
  const queryNickname = { nickname: nickname };
  var userEmail = await collection.find(queryEmail).toArray();
  var userNickname = await collection.find(queryNickname).toArray();
  console.log("email", userEmail);
  console.log("nickname", userNickname);
  client.close();
  var emailFound = false;
  var nicknameFound = false;
  if (userEmail.length !== 0) {
    emailFound = true;
  }
  if (userNickname.length !== 0) {
    nicknameFound = true;
  }
  return { nickname: nicknameFound, email: emailFound };
}

async function registerUser(user) {
  const client = new MongoClient(mongo_uri);
  const database = client.db(mongo_db);
  const collection = database.collection(mongo_users_collection);
  var res = await collection.insertOne(user, (err, res) => {
    if (err) {
      return { status: "err" };
    } else {
      return { status: "ok" };
    }
  });
}

module.exports = {
  getUsers,
  getUser,
  checkNicknameEMail,
  registerUser,
};
