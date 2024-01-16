import userModel from "../models/users.model.js";

class Users {
  async getUserByID(id) {
    try {
      let user = await userModel.find({ _id: id });
      return user;
    } catch (error) {
      console.log("err", error);
    }
  }

  // async updateUserRole(userId, newRole) {
  //   try {
  //     let result = await userModel.updateOne({ _id: userId }, {role: newRole});
  //     return result;
  //   } catch (error) {
  //     console.log("err", error);
  //   }
  // }

  async updateUserRole(userId, newRole, documents) {
    try {
      // Find the user by ID
      let user = await userModel.findById(userId);

      if (!user) {
        return null; // or handle the case where the user is not found
      }

      // Update user role
      user.role = newRole;

      // Process and store documents
      user.documents = [];

      if (documents) {
        for (let i = 0; i < 3; i++) {
          if (documents[i]) {
            // Assuming each document is an object with originalname and filename
            user.documents.push({
              doc_name: documents[i].originalname,
              doc_reference: `/uploads/documents/${documents[i].filename}`, // or any desired path
            });
          } else {
            // Handle the case where the expected number of documents is not uploaded
            return null;
          }
        }
      } else {
        // Handle the case where no documents are uploaded
        return null;
      }

      // Save the updated user
      const result = await user.save();
      return result;
    } catch (error) {
      console.error("Error updating user role and storing documents:", error);
      throw error; // You might want to handle the error more gracefully
    }
  }
}

export default Users;
