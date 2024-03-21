const sharedDatabase = require("../services/DatabaseService");
require("dotenv").config();

class PostService {
  async getCommentsOnPost(postId) {
    try {
      let data = "WHERE post_id = " + postId;

      return sharedDatabase
        .select("comments", "*", data)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error selecting comments:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async getComment(commentId) {
    try {
      return sharedDatabase
        .select("comments", "*", "WHERE id = " + commentId)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error selecting comments:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async deleteComment(commentId) {
    try {
      return sharedDatabase
        .delete("comments", "id = " + commentId)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error deleting comment:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async createComment(user_id, post_id, content) {
    try {
      const data = {
        user_id: user_id,
        post_id: post_id,
        comment: sharedDatabase.escapeSpecialCharacters(content),
      };

      return sharedDatabase
        .insert("comments", data)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error inserting comment:", err);
        });
    } catch (error) {
      return false;
    }
  }
}

module.exports = new PostService();
