import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const checkPassword = async (
  enteredPassword: string,
  storedHash: string
) => {
  console.log(enteredPassword);
  console.log(storedHash);
  
  
  return await bcrypt.compare(enteredPassword, storedHash);
};
