const questionModel = require("../models/questionModel");
const userModel = require("../models/userModel");
const validator = require("../utils/validator");

//Creating questions
const createQuestion = async (req, res) => {
  try {
    let requestBody = req.body;
    const userIdFromToken = req.userId;
    const { description, tag, askedBy } = requestBody; //Extract parameters

    //validation for request body
    if (!validator.isValidRequestBody(requestBody)) {
      return res.status(400).send({
        status: false,
        message: "Please provide the valid request body to post a question.",
      });
    }

    //validation for askedBy. (userId)
    if (!validator.isValid(askedBy)) {
      return res.status(400).send({
        status: false,
        message: "askedBy is required to post a question.",
      });
    }

    //Authorization
    if (askedBy != userIdFromToken) {
      return res.status(401).send({
        status: false,
        message: `Unauthorized access! User's info doesn't match`,
      });
    }

    const searchUser = await userModel.findOne({ _id: askedBy });
    if (!searchUser) {
      return res.status(400).send({
        status: false,
        message: `User doesn't exist by ${askedBy}.`,
      });
    }

    //validation for description's request body
    if (!validator.isValid(description)) {
      return res.status(400).send({
        status: false,
        message: "Question description is required.",
      });
    }

    const questionData = {
      description,
      askedBy,
    };

    //Setting tags in an array by filtering the repeated values.
    if (tag) {
      const tagArr = tag.split(",").map((x) => x.trim());
      const uniqueTagArr = [...new Set(tagArr)];
      if (Array.isArray(tagArr)) {
        questionData["tag"] = uniqueTagArr;
      }
    }

    const saveQuestion = await questionModel.create(questionData);
    return res.status(201).send({
      status: true,
      message: "Question posted Successfully.",
      data: saveQuestion,
    });
  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};

//Fetch all questions.
const getAllQuestion = async (req, res) => {
  try {
    let filterQuery = { isDeleted: false };
    let queryParams = req.query;

    let { tag, sort } = queryParams;

    if (validator.isValidRequestBody(queryParams)) {
      if (validator.isValid(tag)) {
        let tagsArray = tag.split(",").map((x) => x.trim());
        filterQuery["tag"] = { $all: tagsArray };
      }

      if (!validator.validString(tag)) {
        return res.status(400).send({
          status: false,
          message: "Tag is required.",
        });
      }

      if (!validator.validString(sort)) {
        return res.status(400).send({
          status: false,
          message: "Sort is required.",
        });
      }

      if (sort) {
        if (!(sort == "ascending" || sort == "descending")) {
          return res.status(400).send({
            message: `Only 'ascending' & 'descending' are allowed to sort.`,
          });
        }

        const sortedQuestions = await questionModel
          .find(filterQuery)
          .sort({ createdAt: sort });

        //console.log(sortedQuestions);

        if (Array.isArray(sortedQuestions) && sortedQuestions.length === 0) {
          return res
            .status(404)
            .send({ status: false, message: "No Questions found" });
        }

        return res.status(200).send({
          status: true,
          message: "Questions list",
          data: sortedQuestions,
        });
      }

      const findQuestionsByTag = await questionModel.find(filterQuery);
      return res.status(200).send({
        status: true,
        message: "Questions List",
        data: findQuestionsByTag,
      });
    }
    return res
      .status(400)
      .send({ status: false, message: "Invalid request query parameters." });
  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};

//fetch questions by the question Id.
const getQuestionById = async function (req, res) {
  try {
    const questionId = req.params.questionId;

    //Validation for the question Id.
    if (!validator.isValidObjectId(questionId)) {
      return res.status(400).send({
        status: false,
        message: `${questionId} is not a valid question id`,
      });
    }

    const findQuestion = await questionModel.findOne({
      _id: questionId,
      isDeleted: false,
    });
    if (!findQuestion) {
      return res.status(404).send({
        status: false,
        message: `No questions exists by ${questionId}`,
      });
    }
    return res.status(200).send({
      status: true,
      message: "Question fetched successfully.",
      data: findQuestion,
    });
  } catch (err) {
    return res.status(500).send({ status: false, Error: err.message });
  }
};

//Update questions description & tag.
const updateQuestion = async (req, res) => {
  try {
    const questionId = req.questionId;
    let requestBody = req.body;
    const { tag, desciption } = requestBody;

    //Validating questionId.
    if(!validator.isValidObjectId(questionId)){
        return res.status(400).send({status:false,message:`${questionId} is invalid questionId in URL params.`})
    }

    //Validating empty requestBody.
    if(!validator.isValidRequestBody(requestBody)){
        return res.status(400).send({status:false,message:`Empty request body isn't valid for updatation.`})
    }
  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};

//Delete questions -> isDeleted : true
const deleteQuestion = async (req, res) => {
  try {
  } catch (err) {
    return res.status(500).send({ Error: err.message });
  }
};
module.exports = {
  createQuestion,
  getAllQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
