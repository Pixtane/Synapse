const sharedDatabase = require("../services/DatabaseService");
require("dotenv").config();

class PostService {
  async createPost(user_id, title, content) {
    try {
      const data = {
        user_id: user_id,
        title: title,
        body: content,
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
