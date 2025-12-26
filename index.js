const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Main route
app.get('/', (req, res) => {
  res.json({ message: 'Profit Desk API is running' });
});

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/employees', require('./src/routes/employees'));
app.use('/api/projects', require('./src/routes/projects'));
app.use('/api/time-entries', require('./src/routes/timeEntries'));
app.use('/api/reports', require('./src/routes/reports'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
