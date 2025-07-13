const onlineUsers = new Map(); // socketId -> userId
const userSockets = new Map(); // userId -> Set(socketId)
const userRoles = new Map(); // userId -> role

export const notificationSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Notification Socket Connected:', socket.id);

        socket.on('register', ({ userId, role }) => {
            if (!userId || !role) return;

            onlineUsers.set(socket.id, userId);
            userRoles.set(userId, role);

            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);

            console.log(`Registered ${role} with ID: ${userId}`);
        });

        socket.on('disconnect', () => {
            const userId = onlineUsers.get(socket.id);
            if (userId) {
                const sockets = userSockets.get(userId);
                if (sockets) {
                    sockets.delete(socket.id);
                    if (sockets.size === 0) {
                        userSockets.delete(userId);
                        userRoles.delete(userId);
                    }
                }
            }
            onlineUsers.delete(socket.id);
            console.log('Disconnected:', socket.id);
        });
    });
};

// Utility: Send notification to all admins
export const sendNotificationToAdmins = (notification) => {
    for (const [userId, socketsSet] of userSockets.entries()) {
        const role = userRoles.get(userId);
        if (role === 'admin') {
            socketsSet.forEach(socketId => {
                global._io.to(socketId).emit('new-notification', notification);
            });
        }
    }
};

// Utility: Send notification to a specific freelancer
export const sendNotificationToFreelancer = (io, freelancerId, notification) => {
    if (userRoles.get(freelancerId) === 'freelancer') {
        const sockets = userSockets.get(freelancerId);
        if (sockets) {
            sockets.forEach((socketId) => {
                io.to(socketId).emit('new-notification', notification);
            });
        }
    }
};
