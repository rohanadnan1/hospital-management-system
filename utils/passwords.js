import bcrypt from "bcrypt";

const hashPassword = (password) => {
    return bcrypt.hash(password, 10);
};

const decodePassword = (hashedPass, password) => {
    return bcrypt.compare(password, hashedPass);
};



export { hashPassword, decodePassword };
