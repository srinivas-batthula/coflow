
#      🚀 ***CoFlow***
## Built for Hackathons. Ready for Teams. Powered by Realtime.

**~CoFlow** is a real-time team collaboration tool built for developers and hackathon squads, offering live task assignment, group chat and progress tracking. With intelligent scheduling, offline-friendly notifications, and Redis-powered background workers, it keeps teams in sync — even when they’re not online.


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
- 🕒 Automatically fetch and store recent hackathon listings every 10 hours using **node-cron**
## 🔁 Feature Workflows

#### **1.** Automated Hackathons Sync
```
Cron job executes for every 10 hours
      ⬇
List of hackathons are fetched from Devpost API with various filters
      ⬇
Fetched hackathon data is stored in MongoDB
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

- **Frontend:** Next.js, React.js, Zustand, Tailwind CSS, Socket.IO Client
- **Backend:** Node.js, Express.js, Socket.io, node-cron
- **Database:** MongoDB Atlas + Mongoose
- **API's:** [Devpost API](https://devpost.com/api/hackathons)
- **API Docs:** Swagger UI
- **Auth:** JWT + Google OAuth
- **Push Notifcations:** Web-Push, Redis Queue
- **Deployment:** Render, Netlify

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
│ ├── app.js
│ ├── server.js
│ └── config.env
│
└── frontend/
│ ├── app/
│ ├── components/
│ ├── public/
│ ├── store/
│ ├── styles/
│ ├── utils/
│ └── .env
├── LICENSE
└── Readme.md
```
## ⚙️ Local Setup Instructions

```git clone https://github.com/srinivas-batthula/coflow```

#### For backend
```
1. cd backend
```
```
2. npm install
```
```
3. Setup `config.env` in the root dir `backend/`based on `config.env.example`
```
```
4. npm start
```

#### For frontend
```
1. cd frontend
```
```
2. npm install
```
```
3. Setup `.env` in the root dir `frontend/`based on `.env.example`
```
```
4. npm run dev
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/srinivas-batthula/coflow/blob/main/LICENSE) file for details.
## 👥 Contributors

- **Srinivas Batthula [@srinivas-batthula](https://github.com/srinivas-batthula)**
- **Akash Kyadari [@akash-kyadari](https://github.com/akash-kyadari)**