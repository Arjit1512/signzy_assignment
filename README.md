# Social Network Application

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Non-Functional Requirements](#non-functional-requirements)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview
This project is a **social networking platform** built with React.js for the frontend and Node.js with Express.js for the backend. MongoDB is used for **data storage**. The platform allows users to **sign up, log in, add friends, and receive friend recommendations** based on mutual connections.

---

## Features

### 1. User Authentication
- **Sign Up:** Users can create an account with a unique username and password.
- **Login:** Secure authentication for users.
- **Session Security:** JWT-based authentication for session handling.

### 2. Home Page
- Displays a **list of users** and a **search bar** to find other users.
- Shows the **friends list** with options to **remove friends**.

### 3. Friend Functionality
- **Search Users:** Find other registered users.
- **Friend Requests:** Send and receive friend requests.
- **Manage Requests:** Accept or reject friend requests.

### 4. Friend Recommendation System
- **Mutual Friends:** Suggest friends based on shared connections.
- **Smart Recommendations:** (Optional) Suggest users with common interests.
- **User Dashboard:** Display recommended friends.

---

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **State Management:** Context API / Redux (if required)

---

## Installation

### 1. Clone the repository
```sh
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
