# PhotoSocialBackend

A RESTful api backend created to interact with my Frontend created in my [Capstone]('https://github.com/MarkArren/PhotoSharing') project which replace the existing Firebase backend. All data is stored in a PostGreSQL database, images/ videos are stored on Google Cloud Platform in a Bucket.

## Features
* Sign up/ Log in (JWT, bcrypt)
* Create posts (Images/ videos upload to a GCP Bucket)

## TODO Features
* Edit, delete your posts
* Edit, delete your account

### Technology
* Node.js
* Express.js
* PostgreSQL
* Google Coud Platform - Buckets

## Auth
`POST /signup`

`POST /login`

`GET /token`

## Post
`POST /post`

<!-- `GET /post/id` -->

<!-- `PUT /post/id` -->



