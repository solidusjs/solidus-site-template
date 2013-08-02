var solidus = require('solidus');

// Manually start the Solidus server for services that require a start file
solidus.start({
	port: process.env.PORT
});