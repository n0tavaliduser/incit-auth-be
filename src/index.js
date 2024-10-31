const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})); 