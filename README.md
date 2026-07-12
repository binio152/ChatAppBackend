# Chat App Backend

Backend for the chat application, built with Node.js + Express + MongoDB + Socket.IO.

## Main Technologies

- Node.js
- Express
- MongoDB + Mongoose
- Socket.IO
- JWT authentication
- Cloudinary (upload avatar)

## Requirements

- Node.js 18+ (20+ recommended)
- npm
- MongoDB

## Install

```bash
npm install
```

## Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=5001
CLIENT_URL=http://localhost:5173

MONGGO_URI=mongodb://127.0.0.1:27017/chat_app

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_TTL=15m

REFRESH_TOKEN_TTL=604800000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Note: the current code uses `MONGGO_URI`.

## Run Project

```bash
npm run dev
```

Default server URL: `http://localhost:5001`.

## Scripts

- `npm run dev`: Start backend with nodemon
- `npm run start`: Start backend in production mode
- `npm run test`: Run tests with Vitest
- `npm run test-ui`: Run Vitest UI
