const { SocketProvider } = require('../../../shared/socket/provider');

// ── In-memory presence map: username → { lastSeen: Date, socketId }
const presenceMap = new Map();

module.exports = function (socket) {
    // Track user as online once authenticated
    const markOnline = (username) => {
        presenceMap.set(username, { lastSeen: new Date(), socketId: socket.id });
    };

    let trackedOnline = false;

    // Join a channel room
    SocketProvider.socketOn(socket, 'channel:join', function (data) {
        if (!trackedOnline && socket.username) {
            markOnline(socket.username);
            trackedOnline = true;
        }
        if (data.data && data.data.channel_id) {
            SocketProvider.joinRoom(socket, `channel_${data.data.channel_id}`);
        }
    });

    // Leave a channel room
    SocketProvider.socketOn(socket, 'channel:leave', function (data) {
        if (data.data && data.data.channel_id) {
            SocketProvider.leaveRoom(socket, `channel_${data.data.channel_id}`);
        }
    });

    // Typing indicator
    SocketProvider.socketOn(socket, 'channel:typing', function (data) {
        if (data.data && data.data.channel_id) {
            SocketProvider.IOEmitToRoom(
                `channel_${data.data.channel_id}`,
                'channel:typing',
                { channel_id: data.data.channel_id, username: data.username }
            );
        }
    });

    // Stop typing
    SocketProvider.socketOn(socket, 'channel:stop_typing', function (data) {
        if (data.data && data.data.channel_id) {
            SocketProvider.IOEmitToRoom(
                `channel_${data.data.channel_id}`,
                'channel:stop_typing',
                { channel_id: data.data.channel_id, username: data.username }
            );
        }
    });

    // ── Presence: heartbeat (client sends periodically to stay "online")
    SocketProvider.socketOn(socket, 'presence:heartbeat', function (data) {
        markOnline(data.username);
    });

    // ── Presence: query (client asks for status of specific users)
    SocketProvider.socketOn(socket, 'presence:query', function (data) {
        const usernames = (data.data && data.data.usernames) || [];
        const result = {};
        const now = Date.now();
        usernames.forEach(u => {
            const p = presenceMap.get(u);
            if (p) {
                const diffMs = now - new Date(p.lastSeen).getTime();
                result[u] = { online: diffMs < 120000, lastSeen: p.lastSeen }; // 2 min threshold
            } else {
                result[u] = { online: false, lastSeen: null };
            }
        });
        socket.emit('presence:status', result);
    });

    // ── Disconnect: keep lastSeen but mark socket as null
    SocketProvider.socketOn(socket, 'disconnect', function (data) {
        if (data.username) {
            const entry = presenceMap.get(data.username);
            if (entry && entry.socketId === socket.id) {
                presenceMap.set(data.username, { lastSeen: new Date(), socketId: null });
            }
        }
    });
};
