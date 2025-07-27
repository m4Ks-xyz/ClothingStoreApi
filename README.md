# Clothing Store API - Backend 🧠💻

This is the backend RESTful API built for the [**Clothing Store - Hindu Clothes**](https://github.com/m4Ks-xyz/ClothingStore-HinduClothes) web application. It's a Node.js + Express server connected to MongoDB, handling all the core functionalities including authentication, products, orders, and user profiles.

⚠️ **Note:** This backend was developed mainly to understand how servers communicate with front-end applications, how REST APIs function, and how data flows between client and database. As such, it’s more experimental and educational in structure compared to the production-level quality of the front-end.

## Developed On 🌍

👉 Hosted and developed on: [mikr.us](https://mikr.us/) (with MongoDB)

## Technologies Used 🛠️

| Technology  | Purpose |
|-------------|---------|
| Node.js     | Runtime environment for backend |
| Express     | Framework for building RESTful APIs |
| MongoDB     | NoSQL database to store products, users, orders |
| Mongoose    | MongoDB ODM for schema-based data modeling |
| JSON Web Token (JWT) | Authentication with secure tokens |
| bcrypt      | Password hashing |
| dotenv      | Environment variable management |
| Nodemon     | Auto-restarting development server |
| CORS        | Enables frontend-backend communication |

## API Features ✨

- **User Authentication** – Register & login with JWT-based token authentication
- **Product Management** – Create, read, update, delete (CRUD) for product listings
- **Order Functionality** – Place orders, view orders, and update order statuses
- **Cart Management** – Temporarily handled on the client-side, orders handled server-side
- **Profile Endpoints** – View & update user info (limited features due to CORS & frontend safety limits)
- **Environment Config** – `.env` setup for secure handling of secrets, DB connection, and JWT keys

## Environment Setup ⚙️

```bash
npm install
npm run dev
```
## Example .env file ♻️
```env
MONGO_HOST=mongodb.host
MONGO_PASSWORD=mongodb.password
MONGO_USER=mongodb.user
MONGO_DATABASE=mongodb.database
MONGO_PORT=mongodb.port
SECRET_KEY=secret.key.jwt
```
## Project Structure 🧱
```
/controllers      -> Handles route logic  
/routes           -> API endpoints  
/models           -> Mongoose data schemas  
/middleware       -> Auth + CORS logic  
/utils            -> Payment & helper functions  
```
## Learning Focus 🎓
This backend was primarily created to:
- Understand REST API design
- Learn Express.js & Mongoose integration
- Explore authentication with JWT
- Practice secure environment configuration
- Connect frontend to backend APIs and understand full-stack workflows

While it may not follow strict production-grade standards, it works seamlessly with the [**Frontend App**](https://github.com/m4Ks-xyz/ClothingStore-HinduClothes) and serves its purpose well as a functional backend for a real-world e-commerce SPA.
