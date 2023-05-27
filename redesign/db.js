const { MongoClient, ObjectId } = require("mongodb");

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

async function registerGateway(gateway) {
  console.log("register gateway in db.js");
  const client = new MongoClient(mongo_uri);
  const database = client.db(mongo_db);
  const collection = database.collection(mongo_gateways_collection);
  console.log("gateway", gateway);
  var res = await collection.insertOne(gateway, (err, res) => {
    if (err) {
      console.log(err);
      return { status: "err" };
    } else {
      confirm.log(res, "gateway registered");
      return { status: "ok" };
    }
  });
}

async function getGatewayByApikey(apikey) {
  const client = new MongoClient(mongo_uri);
  const database = client.db(mongo_db);
  const collection = database.collection(mongo_gateways_collection);
  const query = { apikey: apikey };
  var gateway = await collection.find(query).toArray();
  client.close();
  return gateway;
}

async function getGatewayByOwner(owner_id, gtw_id, admin) {
  const client = new MongoClient(mongo_uri);
  const database = client.db(mongo_db);
  const collection = database.collection(mongo_gateways_collection);
  var gateway = [];
  try {
    const query = { _id: new ObjectId(gtw_id) };
    gateway = await collection.find(query).toArray();
    if (gateway.length != 0) {
      console.log("gateway found");
      if (gateway[0].owner_id != owner_id && !admin) {
        console.log("forbidden");
        gateway = "forbidden";
      } else {
        console.log("gateway owner or admin", admin);
      }
    }
  } catch (err) {
    console.log(err);
  }
  client.close();
  return gateway;
}

async function updateGateway(data, gtw_id, owner_id, admin) {
  const client = new MongoClient(mongo_uri);
  const database = client.db(mongo_db);
  const collection = database.collection(mongo_gateways_collection);
  var gateway = [];
  try {
    const query = { _id: new ObjectId(gtw_id) };
    console.log("query", query);
    gateway = await collection.find(query).toArray();
    if (gateway.length != 0) {
      console.log("gateway found");
      if (gateway[0].owner_id != owner_id && !admin) {
        console.log("forbidden");
        gateway = "forbidden";
      } else {
        console.log("gateway owner or admin", admin);
        await collection.updateOne({ id: gtw_id }, data);
      }
    }
  } catch (err) {
    console.log(err);
  }
  client.close();
  return;
}

async function deleteGateway(gtw_id, owner_id, admin) {
  const client = new MongoClient(mongo_uri);
  const database = client.db(mongo_db);
  const collection = database.collection(mongo_gateways_collection);
  var gateway = [];
  try {
    const query = { _id: new ObjectId(gtw_id) };
    console.log("query", query);
    gateway = await collection.find(query).toArray();
    console.log("gateway", gateway);
    if (gateway.length != 0) {
      console.log("gateway found");
      if (gateway[0].owner_id != owner_id && !admin) {
        console.log("forbidden");
        gateway = "forbidden";
      } else {
        console.log("gateway owner or admin", admin);
        await collection.deleteOne({ _id: new ObjectId(gtw_id) });
      }
    } else {
      console.log("gateway not found");
      gateway = "not found";
    }
  } catch (err) {
    console.log(err);
  }
  client.close();
  return gateway;
}

module.exports = {
  getUsers,
  getUser,
  checkNicknameEMail,
  registerUser,
  registerGateway,
  getGatewayByApikey,
  getGatewayByOwner,
  deleteGateway,
};
