const errorHandler = (err, req, res, next) => {
    res.send('some error occured.');
};

module.exports = errorHandler;