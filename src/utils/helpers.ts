import bcrypt from "bcrypt";

const saltRounds = 10;

export const hashPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(password, salt);
};

export const comparePasswords = (plain: string, hashed: string) => {
  return bcrypt.compareSync(plain, hashed);
};
