import { Schema } from "express-validator";

export const loginValidation: Schema = {
  username: {
    isString: {
      errorMessage: "Username must be a string",
    },
  },
  password: {
    isString: {
      errorMessage: "Password must be a string",
    },
  },
};

export const registerValidation: Schema = {
  username: {
    isString: {
      errorMessage: "Username must be a string",
    },
    isLength: {
      options: {
        min: 5,
        max: 20,
      },
      errorMessage: "Username must be 5-20 characters",
    },
  },
  email: {
    isEmail: {
      errorMessage: "Email must be a valid email address",
    },
  },
  password: {
    isString: {
      errorMessage: "Password must be a string",
    },
    isLength: {
      options: {
        min: 8,
      },
      errorMessage: "Password must be at least 8 characters",
    },
  },
};

export const sendValidation: Schema = {
  receiverEmail: {
    isEmail: {
      errorMessage: "Recevier's email must be a valid email address",
    },
  },
  subject: {
    optional: true,
    isString: {
      errorMessage: "Subject must be a string",
    },
    isLength: {
      options: {
        max: 78,
      },
    },
  },
  body: {
    isString: {
      errorMessage: "Body must be a valid string",
    },
    isLength: {
      options: {
        max: 10000,
      },
      errorMessage: "Body must be within 10000 characters",
    },
  },
};
