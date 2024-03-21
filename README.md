# Synapse

Synapse is a small social media written on node.js

## Installing

To run the app on your machine, install node/npm, install all dependencies with `npm i`.
Then make a file .env, in which you should fill this information (values are examples):

``` .env
PORT=8080

SALT_ROUNDS=10

SESSION_SECRET=randomstringofcharacters

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=synapse
```

Before running you should also install MySQL and mariadb, and create a new database (which information you fill in dotenv file). Example sql file is in `/synapsedb.sql`

Steps (for Windows 10):

1. Setup mariadb and MySQL.
2. In MySQL cmd client run following:
3. `CREATE DATABASE synapse;`
4. `SOURCE C:/path/to/file/synapsedb.sql;`
5. In another terminal go to project location.
6. Run `npm run start`.
7. Enjoy

# API

## User route

Everything here starts with /api (http://domain.name/api/)

### POST: **/test**
Returns status 200. If it doesn't, server is either down or method was removed.

### GET: **/data** 
Returns data for your user. Doesn't need a body. You need to be logged in session to use it. Either returns [Status/Data](###Status/Data) with object [User](###User) in data. Or it will return [Unathorized](###Unathorized) message if user requesting is not logged in or session is expired.

### GET: **/user/:userid** 
Parameter userid must be a number. If not it will return [Bad request](###Bad-Request). If user with that id is not found in DB, it would return [User not found](###X-not-found). It would return status 200 on success with [Status/Data](###Status/Data) with object [User](###User) without password.

### POST: **/search-users** 
Returns an array of [Users](###User) based on query. Query must be in body in format `{ "query": "Search input" }`. If not it would throw [Bad request](###Bad-Request).

### DELETE: **/delete-account** 
Deletes your own account. To use it user must be in session or it would return [Unathorized](###Unathorized). On success it would return [Success/Message](###Success/Message) with message `"Account deleted"`.

### POST: **/update** 
Updates a field on user. It can be one or more of following: username, email, avatar, password. 

Body of request must be as such: `{ "username": "NewUsername", "email": "newemail@at.com", "avatar": "https://newurl.com/img.jpg", "password": "NewPassword123"}`. At least one field must be provided. Otherwise it would throw [Bad request](###Bad-Request) (`Bad request. Provide at least one field to update.`). 

It would throw [Unathorized](###Unathorized) if not in session. 

If done successfully it would return **status 200** with message `{ message: "Updated X Y Z successfully!", status: 200 }` with X/Y/Z being name/email/password/avatar. If one of them is incorrect it would throw [Bad request](###Bad-Request) (`bad request: X already exists` or `bad request: invalid X`).

### POST: **/register**
Registers the user and creates a session. If error happened in creating a session it would throw [Internal server error](###internal-server-error) (`Couldn't create session`).

Body of request must be `{ "email" : "example@email.com", "username" : "Example123", "password" : "Password123" }`. Without all of them, it would thow [Bad request](###Bad-Request). 

If username or email already exists it would throw [bad request. X already exists](###Bad-Request). If one of fields is invalid, it would throw [bad request: invalid X](###Bad-Request) (Or [Internal server error](###internal-server-error)).

On Success it would return status [success](###success/message).

### POST: **/login**
Creates a session for you. On invalid credentials it would thow same errors as in register. If user doesn't exist it would throw [User not found](###X-not-found). On invalid password it would return status 401 - Invalid credentials.
On success it would return standart [Success](###success/message).

## Post route

Everything here starts with /post (http://domain.name/api/post/).

### GET: **/get/:postid**
Parameter postid must be a number (or [Bad request](###bad-request)). If post doesn't exist it would throw [Post not found](###x-not-found).
On success it would return an object [Post](###post) in [Status/Data](###statusdata).

### DELETE: **/delete/:postid**
Parameter postid must be a number (or [Bad request](###bad-request)). If post doesn't exist it would throw [Post not found](###x-not-found). You must be authorized and it must be your post (or [error](###unathorized)). On success it would return [Successfully deleted post.](###successmessage) (or 204).

### POST: **/create**
Must be [authorized](###unathorized). Post must have title (body is optional unless feature is removed), or [error](###bad-request). It should be in format `{ "title" : "title of post", "body": "Body of post" }`.
On success it would return 201 [Post created successfully](###successmessage) (or 204).

## Comment route

Everything here starts with /comment (http://domain.name/api/comment/).

### GET: **/get/:postid**

Parameter postid must be a number (or [Bad request](###bad-request)). If post or comments don't exist it would throw [Post or comments not found](###x-not-found). On success it would return [Status/Data](###statusdata) with array of [comments](###comment).

### DELETE: **/delete/:commentid**

Deletes a comment based on comment id. Parameter commentid must be a number (or [Bad request](###bad-request)). If comment doesn't exist it would throw [Comment not found](###x-not-found). You must be [authorized](###unathorized). On success it would return 200 [Successfully deleted comment.](###successmessage) (or 204).

### POST: **/create**

Must be [authorized](###unathorized). Body must be of type `{ "comment": "Hello, World!", "post_id": 10 }`, otherwise [error](###bad-request). On success it would return 201 [Comment created successfully](###successmessage) (or 204).

## Like route

Everything here starts with /like (http://domain.name/api/like/).

### GET: **/get/:postid**
Parameter postid must be a number (or [Bad request](###bad-request)). If post or likes don't exist it would throw [Post or likes not found](###x-not-found). On success returns an array of [likes](###like) in [Status/data](###statusdata).

### DELETE: **/delete/:postid**
Must be [authorized](###unathorized). Parameter postid must be a number (or [Bad request](###bad-request)). If like don't exist it would throw [Like not found](###x-not-found). On success it would return 200 [Successfully deleted like.](###successmessage) (or 204).

### PUT: **/create/:postid**
Must be [authorized](###unathorized). Parameter postid must be a number (or [Bad request](###bad-request)). If like exist it would throw status 410 with status/message of `"Already liked"`. On success it would return 201 [Like created successfully](###successmessage) (or 204).

## Common return types

### User

An object from table users. Will not include password if it is not your account, or if feature is deleted. Will not include email is user requesting is unauthorized.
```
{
  "id": 10,
  "name": "Example User",
  "email": "example@email.com",
  "password": {
    "type": "Buffer",
    "data": [
      36,
      50,
      98,
      ...
    ]
  },
  "avatar": "https://images.vexels.com/content/145908/preview/male-avatar-maker-2a7919.png?w=1800&fmt=webp"
}
```

### Post 

An object from table posts.
```
{
  "id": 10,
  "user_id": 5,
  "title": "Post title",
  "body": "Post body. Up to 65,535 bytes.",
  "created_at": "2024-03-20T16:00:45.000Z"
}
```

### Comment

An object from table comments.
```
{
  "id": 10,
  "user_id": 10,
  "comment": "Haha very funny",
  "created_at": "2024-03-21T08:50:59.000Z",
  "post_id": 10
}
```

### Like

An object from table likes.
```
{
  "id": 3,
  "user_id": 4,
  "post_id": 8
}
```

### X not found

Returns status **404 Not Found** with object `{ status: 404, message: "X not found" }`. 

X can be one of following:
- User
- Like
- Comment
- Post or comments
- Post or likes
- Post

### Bad request

Returns status **400 Bad request** with object `{ status: 400, message: "Bad request" }`

### Unathorized

Returns status **401 Unathorized** with object `{ status: 401, message: "Unauthorized" }`

### Status/Data

Returns an object `{ status: 200, data: data }` Status is usually 200 but can be different. Data is usually object but often is array of objects, depending on context.

### Success/Message

On success, if there is nothing else to return (data) it would return an object `{ status: 200, message: "X" }`.
Status can be also 204. If message is `Success` and status is 204, then there was probably some error. To be sure query was completed use another methods to check if database changed. 

### Internal server error

Returns status 500 with message `{ status: 500, message: "Internal server error. X" }` X is optional and can explain further.