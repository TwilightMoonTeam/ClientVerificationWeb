const mongoose = require('mongoose');
require('dotenv').config();

const connect = () => {
  if (process.env.NODE_ENV !== "production") {
      mongoose.set("debug", true);
  }
  mongoose.connect(process.env.MongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: process.env.MongoDatabase,
  });
};

connect();

const db = mongoose.connection;

const handleOpen = () => console.log("✅ connected to DB");
const handleError = (error) => console.log(`❌ ${error}`);

let TwitchSchema = new mongoose.Schema({
  _id: {type: String, lowercase: true},
  TwitchId: {type: Number},
  TwitchName: {type: String},
  TwitchEmail: {type: String},
  createdAt: {type: Date, expires: '24h', default: Date.now}
});

let MinecraftSchema = new mongoose.Schema({
  _id: {type: String, lowercase: true},
  MinecraftId: {type: String},
  MinecraftName: {type: String},
  createdAt: {type: Date, expires: '24h', default: Date.now}
});

let IntegrationUserSchema = new mongoose.Schema({
  _id: {type: String, lowercase: true},
  TwitchId: {type: Number},
  TwitchName: {type: String},
  TwitchEmail: {type: String},
  MinecraftName: {type: String},
});

db.once("open", handleOpen);
db.on("error", handleError);
db.on("disconnected", connect);

module.exports.Twitch = mongoose.model('Twitch', TwitchSchema);
module.exports.Minecraft = mongoose.model('XboxLive', MinecraftSchema);
module.exports.IntegrationUser = mongoose.model('IntegrationUser', IntegrationUserSchema);