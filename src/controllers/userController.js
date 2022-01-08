const userModel = require("../models/userModel");
const validator = require("../utils/validator");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const secretKey = "project/quora-Joy_Bhattacharya";

//1st handler - Registering an user.
const registerUser = async (req, res) => {
  try {
    let requestBody = req.body;
    let { fname, lname, email, phone, password } = requestBody; //params extracting.

    //Validation for empty req body
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message:
          "Empty request cannot be processed. Please provide the user's details to register.",
      });
    }

    //Validation for the user's first name.
    if (!validator.isValid(fname)) {
      return res.status(400).send({
        status: false,
        message: "Unable to register! Please provide the user's fname.",
      });
    }

    //Validation for the user's last name.
    if (!validator.isValid(lname)) {
      return res.status(400).send({
        status: false,
        message: "Unable to register! Please provide the user's lname.",
      });
    }

    //Validation for the user's Email id.
    if (!validator.isValid(email)) {
      return res.status(400).send({
        status: false,
        message: "Unable to register! Please provide the user's Email id.",
      });
    }

    //searching Email in DB to check its uniqueness.
    const isEmailAlreadyUsed = await userModel.findOne({ email });
    if (isEmailAlreadyUsed) {
      return res.status(400).send({
        status: false,
        message: `${email} is alraedy registered by someone. Please try another Email id.`,
      });
    }

    //Email validation using regex
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res.status(400).send({
        status: false,
        message: `${email} is an invalid email. Please check and try again.`,
      });
    }

    //Validation for the user's phone number.-> If key is present then value must be there
      if (!validator.validString(phone)) {
        return res
          .status(400)
          .send({ status: false, message: `Phone number cannot be empty.` });
      }
      if (phone) {

      //searching phone in DB to check its uniqueness.
      const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });
      if (isPhoneAlreadyUsed) {
        return res.status(400).send({
          status: false,
          message: `${phone} is already registered by someone. Please try another phone number.`,
        });
      }

      //phone number validation using regex. -> Valid indian mobile number.
      if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
        return res.status(400).send({
          status: false,
          message: `${phone} is an invalid phone. please check and try again.`,
        });
      }
    }

    //Validation for the user's password
    if (!validator.isValid(password)) {
      return res.status(400).send({
        status: false,
        message: `Unable to register! Please provide user's password.`,
      });
    }

    //setting length criteria for password.
    if (password.length < 8 || password.length > 15) {
      return res.status(400).send({
        status: false,
        message: `Password must be of 8-15 characters.`,
      });
    }

    const encryptedPassword = await bcrypt.hash(password, saltRounds); //encrypting password by using bcrypt.

    //object destructuring for response body.
    const userDetails = {
      fname,
      lname,
      email,
      phone,
      password: encryptedPassword,
    };

    const saveUserData = await userModel.create(userDetails);
    return res.status(201).send({
      status: true,
      message: `Registration successfull.`,
      data: saveUserData,
    });
  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};

//2nd handler - user login.
const loginUser = async (req, res) => {
  try {
    const requestBody = req.body;
    const { email, password } = requestBody; // Extract params

    // Validation for empty request body
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "Invalid request parameters. Please provide login details",
      });
    }
    if (!validator.isValid(email)) {
      return res.status(400).send({
        status: false,
        message: "Login credentials missing! Please provide email to login.",
      });
    }

    if (!validator.isValid(password)) {
      return res.status(400).send({
        status: false,
        message: "Login credentials missing! Please provide password to login.",
      });
    }

    //finding user's details in DB to verify the credentials.
    const findUser = await userModel.findOne({ email });

    if (!findUser) {
      return res.status(401).send({
        status: false,
        message: `Login failed! Email id is incorrect.`,
      });
    }

    let hashedPassword = findUser.password;
    const encryptedPassword = await bcrypt.compare(password, hashedPassword); //converting normal password to hashed value to match it with DB's entry by using compare function.

    if (!encryptedPassword)
      return res.status(401).send({
        status: false,
        message: `Login failed! password is incorrect.`,
      });

    //Creating JWT token through userId.
    const userId = findUser._id;
    const token = await jwt.sign(
      {
        userId: userId,
        iat: Math.floor(Date.now() / 1000), //time of issuing the token.
        exp: Math.floor(Date.now() / 1000) + 3600 * 24, //setting token expiry time limit.
      },
      secretKey
    );

    return res.status(200).send({
      status: true,
      message: `Successfully logged in.`,
      data: {
        userId,
        token,
      },
    });
  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};

//3rd handler - fetching user's profile by Id.
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userIdFromToken = req.userId;

    //validating userId .
    if (!validator.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid userId in params." });
    }

    //Authentication & Authorization
    if (userId.toString() != userIdFromToken) {
      return res.status(401).send({
        status: false,
        message: `Unauthorized access! ${userId} is not a logged in user.`,
      });
    }

    const findUserProfile = await userModel.findOne({ _id: userId });
    if (!findUserProfile) {
      return res.status(400).send({
        status: false,
        message: `User doesn't exists by ${userId}`,
      });
    }

    return res.status(200).send({
      status: true,
      message: `profile found successfully.`,
      data: findUserProfile,
    });
  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};

//4th handler - update user's details.
const updateUserProfile = async (req, res) => {
  try {
    let requestBody = req.body;
    let userId = req.params.userId;
    let userIdFromToken = req.userId;

    //Validating userId
    if (!validator.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "Invalid userId in params." });
    }

    //Authentication & Authorization
    if (userId.toString() != userIdFromToken) {
      return res.status(401).send({
        status: false,
        message: `Unauthorized access! ${userId} is not a logged in user.`,
      });
    }

    const findUserProfile = await userModel.findOne({ _id: userId });
    if (!findUserProfile) {
      return res
        .status(400)
        .send({ status: false, message: `User doesn't exists by ${userId}` });
    }

    //Validating request body
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message:
          "Invalid request body! Please provide some user's information to update.",
      });
    }

    // Extract params
    let { fname, lname, email, phone } = requestBody;

    //validating user's firstName
      if (!validator.validString(fname)) {
        return res.status(400).send({
          status: false,
          message: `Invalid request parameters, Cannot update first name to empty string.`,
        });
      }
    

    //Validating user's lastName
      if (!validator.validString(lname)) {
        return res.status(400).send({
          status: false,
          message: `Invalid request parameters, Cannot update last name to empty string.`,
        });
      }
    

    //validating email address
      if (!validator.validString(email)) {
        return res.status(400).send({
          status: false,
          message: `Invalid request parameters, Cannot update Email Id to empty string.`,
        });
      }

      if (email) {
      if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
        return res.status(400).send({
          status: false,
          message: `${email} is an invalid email Id. Plaese enter a valid email Id to update.`,
        });
      }

      const isEmailAlreadyUsed = await userModel.findOne({ email });
      if (isEmailAlreadyUsed) {
        return res.status(400).send({
          status: false,
          message: `${email} is already registered. Plaese try another Email Id.`,
        });
      }
    }

    //validating phone Number
      if (!validator.validString(phone)) {
        return res.status(400).send({
          status: false,
          message: `Invalid request parameters, Cannot update phone Number to empty string.`,
        });
      }
      if (phone) {
      if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
        return res.status(400).send({
          status: false,
          message: `${phone} is not a valid phone number. Please enter a valid Indian number to update.`,
        });
      }

      const isPhoneAlreadyUsed = await userModel.findOne({ phone });
      if (isPhoneAlreadyUsed) {
        return res.status(400).send({
          status: false,
          message: `${phone} is already registered. Plaese try another number.`,
        });
      }
    }

       //object destructuring for response body.
       let changeProfileDetails = await userModel.findOneAndUpdate({ _id: userId }, {
        $set: {
            fname: fname,
            lname: lname,
            email: email,
            phone: phone
        }
    }, { new: true })

    return res.status(200).send({ status: true, data: changeProfileDetails })

  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
