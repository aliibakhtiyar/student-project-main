# 🎓 Student Project — MERN Stack

A full-stack student platform built using the **MERN stack** to help college students access academic resources, discover opportunities, and stay updated with hackathons, events, and internships.

## 🚀 Features

- 🔐 **Authentication** — Student registration, login, and JWT-based authentication.
- 🎯 **Personalized Dashboard** — Access student-related information in one place.
- 🏆 **Hackathons & Events** — Discover hackathons, workshops, seminars, and college events.
- 💼 **Jobs & Internships** — Explore career opportunities.
- 📚 **Classroom Resources** — Access academic information and assignment-related features.
- 🎁 **Student Benefits** — Discover student developer programs, discounts, and benefits.
- 🤖 **AI Student Assistant** — AI-powered assistance for students.
- 👤 **Student Profile** — Manage personal account information.

> Features may vary depending on the current implementation of the project.

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt.js

### Database
- MongoDB
- Mongoose

### Tools
- Git & GitHub
- Postman
- Vite

## 📁 Project Structure

```text
student-project-main/
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

*The structure above is illustrative. Adjust it to match your actual folders.*

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/aliibakhtiyar/student-project-main.git
cd student-project-main
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Configure any additional environment variables required by your APIs or email service.

Start the backend:

```bash
npm run dev
```

If your project does not have a `dev` script, use the appropriate command from your `package.json`.

### 3. Set up the frontend

Open a new terminal:

```bash
cd student-project-main/frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## 🔑 Environment Variables

Keep sensitive credentials in `.env` files and never commit them to GitHub.

Typical variables include:

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| API keys | Access to external services |

## 🔒 Security

- Passwords should be hashed before storage.
- Protected routes should verify JWT authentication.
- Validate incoming user input.
- Keep API keys and database credentials private.
- Use appropriate authorization checks for protected resources.

## 🗺️ Future Improvements

- Improve personalized recommendations.
- Expand internship and job integrations.
- Enhance the AI student assistant.
- Add notifications for upcoming events and deadlines.
- Improve performance, accessibility, and mobile responsiveness.

## 👨‍💻 Author

**Ali Bakhtiyar**

GitHub: [@aliibakhtiyar](https://github.com/aliibakhtiyar)

## 📄 License

This project is available for educational and learning purposes. Add a license file if you want to specify reuse and distribution permissions.
