let AWS = require("aws-sdk");
var cognitoServiceProvider = new AWS.CognitoIdentityServiceProvider();
const AmazonCognitoIdentity = require("amazon-cognito-identity-js");

global.fetch = require("node-fetch");
require("dotenv").config();
const service = require("../../../Service/service");

const poolData = {
  UserPoolId: process.env.UserPoolId,
  ClientId: process.env.ClientId,
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
let cognitoUser;
exports.signup = async (data) => {
  let response;
  let email = data.email;
  let password = data.password;
  var userData = {
    Username: email,
    Pool: userPool,
  };
  cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  var params = {
    ClientId: process.env.ClientId,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
    ],
  };
  await cognitoServiceProvider
    .signUp(params)
    .promise()
    .then((res) => {
      console.log("DATA SUCCESS: ", res);
      response = service.getResponse(200, JSON.stringify(res));
    })
    .catch((err) => {
      console.log("ERROR", err);
      response = service.getResponse(400, err.message);
    });
  return response;
};

exports.login = async (data) => {
  let userData = {
    Username: data.email,
    Pool: userPool,
  };
  cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: data.email,
    Password: data.password,
  });
  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        console.log("access token + " + result.getAccessToken().getJwtToken());
        resolve(service.getResponse(200, JSON.stringify(result)));
      },
      onFailure: function (err) {
        console.log("err", err.message);
        resolve(service.getResponse(400, err.message));
      },
    });
  });
};

exports.sendMail = async (event) => {
  // Identify why was this function invoked
  if (event.triggerSource === "CustomMessage_SignUp") {
    // Ensure that your message contains event.request.codeParameter. This is the placeholder for code that will be sent
    const { codeParameter } = event.request;
    const { userName, region } = event;
    const { clientId } = event.callerContext;
    const { email } = event.request.userAttributes;
    const url = "http://localhost:3000/signup";
    const link = `<a href="${url}?code=${codeParameter}&username=${userName}&clientId=${clientId}&region=${region}&email=${email}&formType=submit" target="_blank">here</a>`;
    event.response.emailSubject = "Your verification link"; // event.request.codeParameter
    event.response.emailMessage = `Thank you for signing up. Click ${link} to verify your email.`;
  }

  return event;
};
