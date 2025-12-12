import { User } from "../models/user.model.js";

export const signup = async ({ name, email, phoneNumber, password }) => {
  try {
    // Here we would typically handle user registration logic, such as saving the user to a database
    const newUser = { name, email, phoneNumber, password }; // Simulating user creation
    User.create(newUser); // Save the user to the database
    return newUser;
  } catch (error) {
    console.error("Error during signup:", error);
    throw error; // Propagate the error to be handled by the controller
  }
}


export const login = async (email) => {
  try {
    // Fetch user by email
    const user = await User.findOne({ email }).select("+password"); // include password
    return user;
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};