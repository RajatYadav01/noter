# Noter

## Table of contents

- [Noter](#noter)
  - [Table of contents](#table-of-contents)
  - [About](#about)
    - [Overview](#overview)
    - [Key features](#key-features)
  - [Usage](#usage)
  - [Working](#working)
  - [Development](#development)
    - [Requirements](#requirements)
    - [Setup](#setup)

## About

### Overview

This is a Note-taking web application which takes both text and audio as an input.

### Key features

- The audio input is transcribed to text using the **Browser Web Speech API**.
- Form handling is done with proper **validation** both at the client and server side.
- **JSON Web Token (JWT)** is used for serverless authentication. A token is issued to the user during the log in process and after the token expires the user is logged out automatically.
- User can sort the created notes in chronological or reverse chronological order using the **Sort** button based on the creation timestamp of the notes.
- Proper **pagination** is provided for viewing all the notes.
- User can type anything in the **Search bar** to search notes across all the notes by typing the title and the content of the note which updates the page view with the note search results in real-time.

## Usage

To use the project you can visit [RajatYadav01.github.io/noter](https://rajatyadav01.github.io/noter/) which hosts the projects's front end. The back end of project is hosted on [Render](https://render.com) and the database is hosted on [MongoDB Atlas](https://www.mongodb.com/atlas).

## Working

The user needs to be registered to use the project. The user can register by clicking on the **Sign up** button and provide the following details:

- **Name**
- **Email address**
- **Password**

Then, the user can log in by entering the following details:

- **Email address**
- **Password**

The **Home** page displays all the notes created by the user which are stored in the MongoDB database.

**Note Creation**:

- A note can be created using text or by recording the audio.
- If the user clicks on the **Pencil** button then a new modal opens where the user needs to enter the details of the note like *heading* of the note, *content* of the note and optionally *images* can also be added with the note.
- If the user clicks on the **Start recording** button, the application starts recording your voice and when the **Stop recording** button is clicked, the audio is transcribed into text using **Browser Web Speech API** and a new modal opens where content of the note is prefilled with the transcribed text. Other details like *heading* and *images* needs to be added by the user.
- After the note has been created, a **Note card** is created for the note which has the following buttons: **Copy to clipboard button** for copying the content of the note, **Update button** for updating the details of the note and **Delete button** for deleting the note.

**Note Updation**:

- When a user clicks on any note card or on the **Update** button in the note card, an **Update modal** is displayed that has all the details of the note.
- In the **Update modal**, the user can update the *heading, content and add or delete images*.
- User can mark the note as favourite by clicking on the **Star** button or unfavourite it by clicking on it again. Favourite notes can be viewed by clicking on the **Favourites** link.

**Note Deletion**:

- User can click on the menu in the note card and click the **Delete button** to permanently delete the note.

## Development

### Requirements

You need to have the following installed on your system:

- Node.js (preferably, version >= v20.x)
- npm (preferably, version >= v10.x)
- MongoDB (preferably, version >= v8.x)
- Git (preferably the latest version)
- Docker (preferably the latest version)

### Setup

To modify and use this project locally on your system, follow these steps:  

1) Clone the project's repository.

   ```shell
   git clone https://github.com/rajatyadav01/noter.git
   ```

2) Go to the project folder using the CLI.

   ```shell
   cd noter
   ```

3) Install all the dependencies using npm.

   ```shell
   npm install
   ```

4) Rename the `.env.example` file as `.env` in the main project folder to use the environment variables in the React application.

5) Open the backend folder of the project either in a different instance of the code editor or in a different instance of the CLI that you are using.

6) Install all the dependencies using npm in the backend folder.

   ```shell
   npm install
   ```

7) Create a `user` with `password` and a `database` using the created `user` as owner in the MongoDB database since those are required to connect to the database. For this, you can either use the default values from the `env.example` file or use different values after updating them in the `env.example` file. Also, values of other variables can also be updated in the `env.example` file based on your preference.

8) Run the Node server in the backend folder.

   ```shell
   npm run server
   ```

9) Go to the main project folder which is already open in other instance of the code editor and run the React application.

   ```shell
   npm run start
   ```

10) After the React application has started, open any browser and go to `http://localhost:5173` to access the application.<br /><br />

To setup the project using Docker:

1) Clone the project's repository.

   ```shell
   git clone https://github.com/rajatyadav01/noter.git
   ```

2) Go to the project folder using the CLI.

   ```shell
   cd noter
   ```

3) Run the project using docker-compose.

   ```shell
   docker-compose up --build
   ```

4) After all the containers have been started, open any browser and go to `http://localhost:5173` to access the application.
