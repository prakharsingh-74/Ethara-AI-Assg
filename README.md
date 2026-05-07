
# Overview
The Cloud-Based Task Manager is a web application designed to streamline team task management. Built using the PERN/SERN stack (Supabase/PostgreSQL, Express.js, React, and Node.js), this platform provides a user-friendly interface for efficient task assignment, tracking, and collaboration. The application caters to administrators and regular users, offering comprehensive features to enhance productivity and organization.



### Why/Problem?
In a dynamic work environment, effective task management is crucial for team success. Traditional methods of task tracking through spreadsheets or manual systems can be cumbersome and prone to errors. The Cloud-Based Task Manager aims to address these challenges by providing a centralized platform for task management, enabling seamless collaboration and improved workflow efficiency.



### **Background**:
With the rise of remote work and dispersed teams, there is a growing need for tools that facilitate effective communication and task coordination. The Cloud-Based Task Manager addresses this need by leveraging modern web technologies to create an intuitive and responsive task management solution. The PERN stack ensures scalability, while the integration of Redux Toolkit, Headless UI, and Tailwind CSS enhances user experience and performance.


### 
## **Admin Features:**
1. **User Management:**
    - Create admin accounts.
    - Add and manage team members.

2. **Task Assignment:**
    - Assign tasks to individual or multiple users.
    - Update task details and status.

3. **Task Properties:**
    - Label tasks as todo, in progress, or completed.
    - Assign priority levels (high, medium, normal, low).
    - Add and manage sub-tasks.

4. **Asset Management:**
    - Upload task assets, such as images.

5. **User Account Control:**
    - Disable or activate user accounts.
    - Permanently delete or trash tasks.


## **User Features:**
1. **Task Interaction:**
    - Change task status (in progress or completed).
    - View detailed task information.

2. **Communication:**
    - Add comments or chat to task activities.


## **General Features:**
1. **Authentication and Authorization:**
    - User login with secure authentication.
    - Role-based access control.

2. **Profile Management:**
    - Update user profiles.

3. **Password Management:**
    - Change passwords securely.

4. **Dashboard:**
    - Provide a summary of user activities.
    - Filter tasks into todo, in progress, or completed.




## **Technologies Used:**
- **Frontend:**
    - React (Vite)
    - Redux Toolkit for State Management
    - Headless UI
    - Tailwind CSS


- **Backend:**
    - Node.js with Express.js
    
- **Database:**
    - PostgreSQL (via Supabase) for efficient, relational, and scalable data storage.


The Cloud-Based Task Manager is an innovative solution that brings efficiency and organization to task management within teams. By harnessing the power of the PERN stack and modern frontend technologies, the platform provides a seamless experience for both administrators and users, fostering collaboration and productivity.

&nbsp;

## SETUP INSTRUCTIONS


# Server Setup

## Environment variables
First, create the environment variables file `.env` in the server folder. The `.env` file contains the following environment variables:

- SUPABASE_URL = `your Supabase Project URL`
- SUPABASE_KEY = `your Supabase API Key (Anon or Service Role)`
- JWT_SECRET = `any secret key - must be secured`
- PORT = `8800` or any port number
- NODE_ENV = `development`


&nbsp;

## Folder Structure

- `controllers/`: Contains the business logic and route handler functions.
- `middleware/`: Custom middleware for route protection (authentication, admin checks) and error handling.
- `routes/`: Express routers defining the application endpoints.
- `utils/`: Utility functions like `supabase.js` client setup.

## Set Up Supabase (PostgreSQL):

1. Setting up Supabase involves a few steps:
    - Visit the Supabase Website: [https://supabase.com/](https://supabase.com/).
    - Create an Account or Log In.
    - Create a New Project.
    - Wait for the project database to spin up.
    - Go to project Settings > API to get your `SUPABASE_URL` and `SUPABASE_KEY`.
    - Go to the **SQL Editor** in your Supabase dashboard.
    - Open the `server/schema.sql` file provided in this repository, copy its contents, and execute it in the Supabase SQL Editor. This will automatically create all necessary tables (`users`, `tasks`, `notices`) with the required structure.

2. Configure the `server/.env` file with your new Supabase Project URL and API Key. 

## Steps to run server

1. Open the project in any editor of choice.
2. Navigate into the server directory `cd server`.
3. Run `npm i` or `npm install` to install the packages.
4. Run `npm run dev` to start the server.

If configured correctly, you should see a message indicating that the server is listening on your configured port.

## API Documentation

The server exposes the following endpoints. The base URL for all endpoints is `/api`.

### Authentication and Authorization

- **`protectRoute`**: Middleware that ensures a user is logged in by verifying the JWT cookie.
- **`isAdminRoute`**: Middleware that ensures the authenticated user has Admin privileges.

### User Routes (`/api/user`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user | Public |
| `POST` | `/login` | Authenticate user and issue JWT | Public |
| `POST` | `/logout` | Logout user (clears JWT cookie) | Public |
| `GET` | `/get-team` | Get a list of all team members | **Admin** |
| `GET` | `/notifications` | Get the logged-in user's notifications | Private |
| `GET` | `/get-status` | Get user task status statistics | **Admin** |
| `PUT` | `/profile` | Update the logged-in user's profile | Private |
| `PUT` | `/read-noti` | Mark notifications as read | Private |
| `PUT` | `/change-password` | Change the logged-in user's password | Private |
| `PUT` | `/:id` | Activate/Deactivate a user profile | **Admin** |
| `DELETE` | `/:id` | Delete a user profile | **Admin** |

### Task Routes (`/api/task`)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/create` | Create a new task | **Admin** |
| `POST` | `/duplicate/:id` | Duplicate an existing task | **Admin** |
| `POST` | `/activity/:id` | Post a new activity/comment to a task | Private |
| `GET` | `/dashboard` | Get dashboard statistics (task counts by status, priority) | Private |
| `GET` | `/` | Get a paginated and filtered list of tasks | Private |
| `GET` | `/:id` | Get details of a specific task | Private |
| `PUT` | `/create-subtask/:id` | Add a subtask to an existing task | **Admin** |
| `PUT` | `/update/:id` | Update task details | **Admin** |
| `PUT` | `/change-stage/:id` | Change the stage of a task (e.g., todo, in progress, completed) | Private |
| `PUT` | `/change-status/:taskId/:subTaskId` | Toggle the completion status of a subtask | Private |
| `PUT` | `/:id` | Move a task to the trash | **Admin** |
| `DELETE` | `/delete-restore/:id?` | Permanently delete or restore trashed tasks | **Admin** |

---

## Data Models

### User Model
Stores user details including `name`, `title`, `role`, `email`, `password` (hashed with `bcryptjs`), `isAdmin` flag, `isActive` flag, and a reference to assigned `tasks`.

### Task Model
Stores task information such as `title`, `priority` (high, medium, normal, low), `stage` (todo, in progress, completed), `activities` (comments/logs), `subTasks`, `description`, `team` assignments, and an `isTrashed` flag.

&nbsp;

# Client Side Setup

## Environment variables
First, create the environment variables file `.env` in the client folder. The `.env` file contains the following environment variables:

- VITE_APP_BASE_URL = `http://localhost:8800` #Note: Change the port 8800 to your port number.
- VITE_APP_FIREBASE_API_KEY = `Firebase api key`

## Steps to run client

1. Navigate into the client directory `cd client`.
2. Run `npm i` or `npm install` to install the packages.
3. Run `npm start` to run the app on `http://localhost:3000`.
4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

