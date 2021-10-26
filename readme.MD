# PhotoSocialBackend

A RESTful api backend created to interact with my frontend created in my [Capstone](https://github.com/MarkArren/PhotoSharing) project which replace the existing Firebase backend. All data is stored in a PostGreSQL database, images/ videos are stored on a Google Cloud Platform Bucket.

## Features
* Sign up/ Log in (JWT, bcrypt)
* Create posts (Images/ videos upload to a GCP Bucket)
* Delete posts
* Like & unlike posts
* Add & remove your comments

## TODO Features
* /GET accounts
* Edit your posts
* Edit your account

### Technology
* Node.js
* Express.js
* PostgreSQL
* Google Coud Platform - Bucket

## Auth
`POST /signup`

`POST /login`

`GET /token`

## User
`GET /{username}`

`PUT /{username}`

`DELETE /{username}`

## Post
`GET /post`

`POST /post`

`PATCH /post`

`DELETE /post`


## Like
`GET /post/{post_id}/likes`

`POST /post/{post_id}/like`

`DELETE /post/{post_id}/like`

## Comment
`GET /post/{post_id}/comments`

`POST /post/{post_id}/comment`

`DELETE /post/{post_id}/comment/{comment_id}`



