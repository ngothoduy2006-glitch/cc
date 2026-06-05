const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Serve frontend build if it exists (so visiting backend root shows the app)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
	app.use(express.static(frontendDist));
	app.get('/*', (req, res) => {
		res.sendFile(path.join(frontendDist, 'index.html'));
	});
}

app.use(errorMiddleware);

module.exports = app;
