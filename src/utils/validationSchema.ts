import { Schema } from "express-validator";

export const loginValidation: Schema = {
  username: {
    in: ["body"],
    isString: {
      errorMessage: "Username must be a string",
    },
  },
  password: {
    in: ["body"],
    isString: {
      errorMessage: "Password must be a string",
    },
  },
};

export const registerValidation: Schema = {
  username: {
    in: ["body"],
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
    in: ["body"],
    isEmail: {
      errorMessage: "Email must be a valid email address",
    },
  },
  password: {
    in: ["body"],
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
  isReplyTo: {
    in: ["body"],
    optional: true,
    isInt: {
      errorMessage: "Parent email id must be a valid integer",
    },
  },
  receiverEmails: {
    in: ["body"],
    isArray: {
      errorMessage: "Receivers' Emails must be provided as an array",
    },
    custom: {
      options: (value: string[]) => {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error("Receiver emails must be a non-empty array.");
        }
        for (const email of value) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            // A simple regex for email validation
            throw new Error(`'${email}' is not a valid email address.`);
          }
        }
        return true;
      },
    },
  },
  subject: {
    in: ["body"],
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
    in: ["body"],
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
