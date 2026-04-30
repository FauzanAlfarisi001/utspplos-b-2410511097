// filter hak user terhadap query db berdasarkan rolenya

module.exports = function requireRole(...roles) {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];

        if (!userRole || !roles.includes(userRole))
            return res.status(403).json({ message: `Akses ditolak, kamu harus dalam role: ${roles.join(' atau ')}.`, your_role: userRole || 'tidak diketahui',});

        next();
    };
};