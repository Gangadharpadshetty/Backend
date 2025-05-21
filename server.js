const express = require('express');
const app = express();
const cors = require('cors');
const authRouter = require('./router/auth-router');
const contactRouter = require('./router/contact_router');
const adminRouter = require('./router/admin-router');
const menteeRouter = require('./router/Mentee-router');
const bookingRoutes = require('./router/bookingRouter');
const connectDB = require('./util/db');
const errorMiddleware = require('./middleware/error_middleware');

// CORS options
const corsOptions = {
  origin: 'http://localhost:5173', // ✅ You might change this to your frontend Render URL in production
  methods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Route handlers
app.use('/api/auth', authRouter);
app.use('/api/form', contactRouter);
app.use('/api/admin', adminRouter);
app.use('/api/data', menteeRouter);
app.use('/api/book', bookingRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Connect to the database and start the server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error connecting to the database:', error.message);
    process.exit(1);
  });
