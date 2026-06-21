const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

dotenv.config();
connectDB();

// import routes
const userRoutes = require('./routes/userRoute');
const productRoutes = require('./routes/productRoute');
const projectRoutes = require('./routes/projectRoute');
const blogRoutes = require('./routes/blogRoute');
const serviceRoutes = require('./routes/serviceRoute');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.length === 0) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }
    callback(null, false);
  },
  credentials: true
}));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Define your routes here
app.use('/api/auth', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/services', serviceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});