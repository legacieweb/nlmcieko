# Grace Church Website

A comprehensive church website built with React, Express, MongoDB, and custom styling. The website focuses on spreading the Gospel and helping people understand Jesus Christ through biblical teachings and a free Christian book with sermons.

## Features

- **Beautiful Homepage** with thought-provoking biblical questions
- **Free Christian Book** with sermons about Jesus Christ and John the Baptist
- **Contact Form** with email notifications via Nodemailer
- **About Page** with church mission and values
- **Responsive Design** that works on all devices
- **MongoDB Backend** for storing books and contact messages
- **Email Integration** for automated responses

## Project Structure

```
word/
├── server/                 # Express backend
│   ├── config/            # Database configuration
│   ├── controllers/        # Route handlers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── scripts/           # Seed scripts
│   ├── utils/             # Utility functions (mailer)
│   ├── data/              # Content data
│   ├── server.js          # Express server entry point
│   ├── package.json       # Server dependencies
│   └── .env.example       # Environment variables template
│
└── client/                # React frontend
    ├── public/            # Static files
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/        # Page components
    │   ├── services/     # API services
    │   ├── styles/       # CSS files
    │   ├── App.js        # Main app component
    │   └── index.js      # React entry point
    └── package.json      # Client dependencies
```

## Prerequisites

- **Node.js** (v14+)
- **npm** or **yarn**
- **MongoDB** (MongoDB Atlas or local instance)
- **Gmail Account** (for Nodemailer email functionality)

## Installation & Setup

### 1. Clone or Extract the Project

```bash
cd word
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd server
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/church-website
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NODE_ENV=development
```

**Note on Gmail Password:**
- Go to [Google Account Security](https://myaccount.google.com/apppasswords)
- Enable 2-factor authentication if not already done
- Generate an app password for Gmail
- Use the 16-character password as `EMAIL_PASSWORD`

#### Seed the Database
```bash
npm run seed
```

This will populate the MongoDB database with the free Christian book content.

#### Start the Server
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd client
npm install
```

#### Start the Development Server
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## Configuration

### MongoDB Atlas Setup
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user and password
3. Add your IP to the whitelist
4. Copy the connection string to `.env`

### Email Configuration
The contact form and book download features use Nodemailer with Gmail. You must:
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Add both the email and app password to `.env`

## API Endpoints

### Get Book
```
GET /api/book
```

### Download Book
```
POST /api/book/download
Body: { email: "user@example.com" }
```

### Submit Contact Form
```
POST /api/contact/submit
Body: {
  name: "John Doe",
  email: "john@example.com",
  phone: "555-1234",
  subject: "Question about faith",
  message: "I have a question..."
}
```

## Website Content

### Homepage
- Welcomes visitors with "Do You Really Know Jesus Christ?"
- Presents 6 profound questions about faith
- Introduces the free Christian book with sermons
- Download form for the book

### About Page
- Church mission and values
- What the church believes
- Why Bible study is important
- Call to action

### Contact Page
- Contact form with validation
- Contact information
- Frequently Asked Questions (FAQ)
- Information about service times

## Free Christian Book Content

The book includes:
1. **Who is Jesus Christ?** - Understanding Christ's identity and nature
2. **John the Baptist** - The role of John and his ministry
3. **Repentance and Salvation** - True repentance and being born again
4. **The Cross** - Why Jesus died and the meaning of the resurrection
5. **Living as a Christian** - Knowing God and understanding eternity

Each section includes:
- In-depth sermons
- Direct biblical references
- Verses for confirmation and study
- Practical application for faith

## Styling

The website uses custom CSS with:
- Professional color scheme (blues, golds, earth tones)
- Responsive grid layouts
- Smooth transitions and animations
- Beautiful gradients
- Mobile-first design

## Technologies Used

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Nodemailer** - Email service
- **Cors** - Cross-origin requests
- **Dotenv** - Environment management

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling with custom properties

## Deployment

### Backend Deployment (Heroku)
1. Install Heroku CLI
2. Create a Heroku app: `heroku create your-app-name`
3. Add environment variables: `heroku config:set MONGODB_URI=...`
4. Deploy: `git push heroku main`

### Frontend Deployment (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy the `build` folder to Vercel or Netlify
3. Set `REACT_APP_API_URL` to your backend URL

## Troubleshooting

### Email not sending
- Verify Gmail app password is correct
- Check 2-factor authentication is enabled
- Check SMTP settings in Nodemailer configuration

### Database connection issues
- Verify MongoDB URI is correct
- Check IP whitelist on MongoDB Atlas
- Ensure database user has proper permissions

### CORS errors
- Update CORS in `server.js` with frontend URL
- Ensure `credentials: true` if using cookies

### React not loading data
- Check that backend is running on port 5000
- Verify `REACT_APP_API_URL` environment variable
- Check browser console for errors

## Future Enhancements

- Live streaming of sermons
- Member registration and login
- Event calendar
- Prayer request system
- Community blog
- Multiple language support
- Mobile app

## License

This project is open source and available for church and ministry use.

## Support

For questions or issues, please contact info@gracechurch.com

---

**May God bless your journey of faith through Jesus Christ!**
