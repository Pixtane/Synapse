const sharedDatabase = require("../services/DatabaseService");
require("dotenv").config();

class PostService {
  async getLikesOnPost(postId) {
    try {
      let data = "WHERE post_id = " + postId;

      return sharedDatabase
        .select("likes", "*", data)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error selecting likes:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async getLikeOnPost(postId, userId) {
    try {
      let data = "WHERE post_id = " + postId + " AND user_id = " + userId;

      return sharedDatabase
        .select("likes", "*", data)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error selecting likes:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async getLike(likeId) {
    try {
      return sharedDatabase
        .select("likes", "*", "WHERE id = " + likeId)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error selecting like:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async deleteLike(likeId) {
    try {
      return sharedDatabase
        .delete("likes", "id = " + likeId)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error deleting like:", err);
        });
    } catch (error) {
      console.log("Error:", error);
      return false;
    }
  }

  async createLike(user_id, post_id) {
    try {
      const data = {
        user_id: user_id,
        post_id: post_id,
      };

      return sharedDatabase
        .insert("likes", data)
        .then((result) => {
          return result;
        })
        .catch((err) => {
          console.error("Error inserting like:", err);
        });
    } catch (error) {
      return false;
    }
  }
}

module.exports = new PostService();
