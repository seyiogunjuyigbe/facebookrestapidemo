# FACEBOOKRESTAPIDEMO
<hr>
This is a representation of the Post functionality of Facebook

<hr/>

#### Features
- Sign Up.
- Login.
- Reset Password.
- Create Posts.
- Update Posts.
- Fetch Posts.
- Add Comments to Posts.
- Update Comments.
- Fetch Post Comments.
- Add Reaction to Posts.
- Update Post Reaction.
- Fetch Post Reactions.

<hr/>

### Getting Started
 Below are requirements to kick start the API in your local server.

 1. First off, you must have node/npm installed. Install the latest node version [here](https://nodejs.org/en/download/). Not to worry, the npm package comes along with the node package
 2. Mongo DB connection. You can either use a local mongodb installation or a [cloud connection](https://cloud.mongodb.com/)
 3. Sendgrid API KEY. You can create a [free account](https://app.sendgrid.com/) with sendgrid if you don't already have one
 4. [Cloudinary](https://cloudinary.com/) Credentials (API key, cloud name and API secret)

 ### Installation
 
 1. Clone this repository by running this on your terminal: `git clone https://github.com/seyiogunjuyigbe/facebookrestapidemo.git`
 2. Navigate to the project's directory with: `cd facebookrestapidemo`
 3. Run `npm install` to install dependencies
 4. Create a `.env` file in the root directory. This file will contain your environment variables as listed in `.env.`
 5. Run  `npm run dev` to start the server on a local host
 6. Run `npm test` to test.
 7. Run `npm start` to start on a production server
 
##### Test Driven
Tests are written with mocha, chai-http and chai.

#### Stack:
* Express
* Node JS
* Mongo DB

#### License

ISC License

### API Documentation
https://documenter.getpostman.com/view/4447136/TzRa6j1v

### Hosted API
https://facebookrestapidemo.herokuapp.com