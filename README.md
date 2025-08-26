# 🚀 **_CoFlow_**

## Built for Hackathons. Ready for Teams. Powered by Realtime.

**~CoFlow** is a real-time team collaboration tool built for developers and hackathon squads,
offering live task assignment, group chat and progress tracking. With intelligent scheduling,
offline-friendly notifications, and Redis-powered background workers, it keeps teams in sync — even
when they’re not online.

## Live Links

- 🔗 **Live Site**: [coflow.netlify.app](https://coflow.netlify.app)
- 🔗 **API Docs**: [coflow.onrender.com/api-docs](https://coflow-backend-bcgk.onrender.com/api-docs)

## Logo

![Logo](https://github.com/srinivas-batthula/coflow/blob/main/frontend/public/logosvg.png)

## ✨ Key Features

- ✅ Create, Join, and Manage hackathon teams
- 🔐 Authentication with JWT and Google OAuth
- 🧑‍💻 Realtime Collaborative Task management and status tracking
- 💬 Real-time team chat using **Socket.IO**
- 🕒 Automatically scrape and store recent hackathon listings every 10 hours using **node-cron** &
  **Playwright**

## 🔁 Feature Workflows

#### **1.** Automated Hackathons Sync

```
Cron job executes for every 10 hours
      ⬇
List of hackathons are Scraped from sites UnStop & Devpost with various filters
      ⬇
Scraped hackathon data is stored in MongoDB
      ⬇
If failure → fallback data is stored in JSON file temporarily
```

#### **2.** Collaborative Tasks flow

```
Leader creates and assigns a new task for a member
      ⬇
The member submits the task after completion
      ⬇
Leader approves / re-assigns the task with comments

```

#### **3.** Real-time group chat

```
A user types a message in a team
      ⬇
`User-X is typing` indicator is shown for all other members
      ⬇
User sends a message
      ⬇
That message is broadcasted to all members of that team
      ⬇
Received members will be marked as 'seen' in real-time
```

#### **4.** Push Notifications (for offline users)

```
For messages or task updates → a payload with senderId is pushed into Redis-Queue
      ⬇
Background worker always listens to the Redis-Queue
      ⬇
Worker pops the notification details from the Queue
      ⬇
Sends a Push-Notification to that offline user
```

## 🛠 Tech Stack

- **Frontend:** Next.js, React.js, Zustand, Tailwind CSS, Socket.IO Client, IndexedDB
- **Backend:** Node.js, Express.js, Socket.io, node-cron, Playwright(Webscraping)
- **Database:** MongoDB Atlas + Mongoose ODM
- **API's:** [Devpost API](https://devpost.com/api/hackathons)
- **API Docs:** Swagger UI
- **Auth:** JWT + Google & GitHub OAuth
- **Push Notifcations:** Web-Push, Redis Queue
- **Testing:** Jest, SuperTest
- **Deployment:** Docker, Render, Netlify, GitHub Actions

## 🏗️ Project Structure

```
coflow/
├── backend/
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── services/
│ ├── socket/
│ ├── utils/
│ ├── workers/
│ ├── scripts/
│ ├── tests/
│ ├── app.js
│ ├── server.js
│ ├── Dockerfile
│ └── config.env
│
└── frontend/
│ ├── app/
│ ├── components/
│ ├── public/
│ ├── store/
│ ├── styles/
│ ├── utils/
│ ├── Dockerfile
│ └── .env
├── LICENSE
├── docker-compose.yml
└── Readme.md
```

## ⚙️ Local Setup Instructions

`git clone https://github.com/srinivas-batthula/coflow`

`Setup 'config.env in the root dir 'backend/' based on 'config.env.example'`

`Setup '.env' in the root dir 'frontend/' based on '.env.example'`

### 1. Manual Setup (Without Docker)

#### For backend

```
1. cd backend
```

```
2. npm install
```

```
3. npm start
```

#### For frontend

```
1. cd frontend
```

```
2. npm install
```

```
3. npm run dev
```

### 2. Run with Docker Compose

#### Prerequisites

```
- Install Docker & Docker Compose
```

#### Start the app

```
1. docker-compose up --build
```

## 📝 License

This project is licensed under the MIT License - see the
[LICENSE](https://github.com/srinivas-batthula/coflow/blob/main/LICENSE) file for details.

## 👥 Contributors

- **Srinivas Batthula [@srinivas-batthula](https://github.com/srinivas-batthula)**
- **Akash Kyadari [@akash-kyadari](https://github.com/akash-kyadari)**
