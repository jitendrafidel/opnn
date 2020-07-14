const AuthService = require("../Services/AuthService");
global.fetch = require("node-fetch");
require("dotenv").config();

exports.signUp = async (event) => {
  const data = JSON.parse(event.body);
  return await AuthService.signup(data);
};

exports.login = async (event) => {
  let data = JSON.parse(event.body);
  return await AuthService.login(data);
};

exports.sendMail = async (event) => {
  return await AuthService.sendMail(event);
};
