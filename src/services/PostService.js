const sharedDatabase = require("../services/DatabaseService");
require("dotenv").config();

class PostService {
  async getData(postId) {
    try {
      let data = "WHERE id = " + postId;

      return sharedDatabase
        .select("posts", "*", data)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error selecting post:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async deletePost(postId) {
    try {
      return sharedDatabase
        .delete("posts", "id = " + postId)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error deleting post:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async createPost(user_id, title, content) {
    try {
      const data = {
        user_id: user_id,
        title: sharedDatabase.escapeSpecialCharacters(title),
        body: sharedDatabase.escapeSpecialCharacters(content),
      };

      return sharedDatabase
        .insert("posts", data)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error inserting post:", err);
        });
    } catch (error) {
      return false;
    }
  }
}

module.exports = new PostService();
