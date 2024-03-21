const likeService = require("../services/LikeService.js");

class likeController {
  async getLikesOnPost(postId) {
    return await likeService.getLikesOnPost(postId);
  }

  async getLikeOnPost(postId, userId) {
    return await likeService.getLikeOnPost(postId, userId);
  }

  async deleteLike(likeId) {
    return await likeService.deleteLike(likeId);
  }

  async getLike(likeId) {
    return await likeService.getLike(likeId);
  }

  async createLike(userId, postId) {
    const responseData = await likeService.createLike(userId, postId);

    if (responseData) {
      return { status: 201, message: "Like created successfully" };
    } else {
      return { status: 204, message: "Success" };
    }
  }
}

module.exports = new likeController();
