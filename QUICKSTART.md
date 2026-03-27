# Quick Start Guide

## 5-Minute Setup

### Step 1: Configure MongoDB
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (add 0.0.0.0/0 for development)
5. Copy your connection string

### Step 2: Configure Gmail
1. Enable 2-factor authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password for Gmail
4. Copy the 16-character password

### Step 3: Backend Setup
```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/church-website
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
NODE_ENV=development
```

Seed the database:
```bash
npm run seed
```

Start the server:
```bash
npm run dev
```

### Step 4: Frontend Setup
```bash
cd ../client
npm install
npm start
```

✅ **Done!** Your church website is running at `http://localhost:3000`

## What You Get

### Homepage
- Compelling questions about Jesus Christ
- Introduction to John the Baptist
- Free Christian book download form

### About Page
- Church mission and values
- Biblical beliefs
- Why Bible study matters

### Contact Page
- Contact form with email notifications
- FAQ section
- Service times and location

## Website Features

✨ **Beautiful Design**
- Professional gradient color scheme
- Responsive on all devices
- Smooth animations

📚 **Free Christian Book**
- 5 comprehensive sections
- Sermons about Jesus Christ
- Direct biblical references
- Guides readers straight to Scripture

✉️ **Email Integration**
- Contact form responses
- Automatic book delivery to emails
- Admin notifications

## Customization

### Change Church Name
- Edit in `Navigation.js`
- Update footer information
- Modify contact details

### Update Content
- Edit homepage questions in `HomePage.js`
- Modify book content in `server/data/bookContent.js`
- Update About page in `AboutPage.js`

### Change Colors
- Edit color variables in global CSS files
- Modify `Navigation.css`, `HomePage.css`, etc.
- Primary colors: `#1a3a52`, `#c9a961`, `#8b7355`

## API Endpoints

```
GET  /api/book                 - Get book content
POST /api/book/download        - Send book via email
POST /api/contact/submit       - Submit contact form
```

## Troubleshooting

**Server won't start?**
- Check MongoDB connection string in `.env`
- Verify Node.js is installed: `node --version`
- Run `npm install` again

**Emails not sending?**
- Verify app password is correct (16 characters)
- Check 2-factor auth is enabled on Gmail
- Verify EMAIL_USER matches your Gmail

**React not connecting to backend?**
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API calls use correct URL

## Next Steps

1. **Deploy Backend** to Heroku or AWS
2. **Deploy Frontend** to Vercel or Netlify
3. **Custom Domain** - Set up your church domain
4. **SSL Certificate** - Enable HTTPS
5. **Custom Email** - Replace Gmail with church email

## Need Help?

Refer to the main README.md for detailed documentation.

---

**Build, customize, and share the Gospel with your community!**
