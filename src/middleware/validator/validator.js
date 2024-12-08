const { param, body, validationResult } = require("express-validator");

const coverageValidation = () => {
  return [
    body("name")
      .exists({ checkFalsy: true })
        .withMessage("Policy name is required.")
      .bail()
      .isAlpha("en-US", { ignore: " .,-:" })
        .withMessage("Use only letters please.")
      .isLength({ min: 2, max: 100 })
        .withMessage("Please use full policy name."), 
    body("insuranceCompany")
      .exists({ checkFalsy: true })
        .withMessage("Company name is required.")
      .bail()
      .isAlpha("en-US", { ignore: " .,-:" })
        .withMessage("Only letters please.")
      .isLength({ min: 2, max: 100 })
        .withMessage("Please use full company name."), 
    body("policyNumber")
    .exists({ checkFalsy: true })
      .withMessage("Policy number is required.")
    .bail()
    .isNumeric()
      .withMessage("Use only numbers please.")
    .isLength({ min: 2, max: 15 })
      .withMessage("Please use only a valid policy number."), 
    body("coverageInfo")
    .exists({ checkFalsy: true })
      .withMessage("A policy description is required.")
    .bail()
    .isAlpha("en-US", { ignore: " .,-!$:;%()" })
      .withMessage("Please provide a brief description.")
    .isLength({ min: 2, max: 250 })
      .withMessage("Please use only a valid policy number."), 
    body("contactNumber")
      .isMobilePhone("en-US")
        .withMessage("Please use a valid US phone number."), 
    body("email")
      .isEmail()
        .withMessage("Please use a valid email."), 
    body("creationDate")
      .exists({ checkFalsy: true })
        .withMessage("A policy creation date is required.")
      .bail()
      .isDate({ format: 'YYYY-MM-DD', strictMode: true })
        .withMessage('Please enter date in the format YYYY-MM-DD.'),
    body("renewalDate")
      .exists({ checkFalsy: true })
        .withMessage("A policy renewal date is required.")
      .bail()
      .isDate({ format: 'YYYY-MM-DD', strictMode: true })
        .withMessage("Please use the following format: YYYY-MM-DD.")
  ];
}

const idValidation = () => {
  return [
    param("id")
      // Make sure id exists and is not falsy
      .exists({ checkNull: true, checkFalsy: true })
      .withMessage("An id is required.")
      // Stops validating if id is not provided
      .bail()
      .isMongoId()
      .withMessage("Please use a valid MongoDB ID.")
  ];
}

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];

  errors.array().map(er => extractedErrors.push({
    field: er.param, 
    message: er.msg
  }));

  return res.status(422).json({
    errors: extractedErrors, 
  });
}

module.exports = { coverageValidation, idValidation, validate }