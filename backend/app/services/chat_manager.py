from typing import Dict, Set
from fastapi import WebSocket
import uuid
import json

class ConnectionManager:
    def __init__(self):
        # user_id -> set of active WebSockets
        self.active_connections: Dict[uuid.UUID, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: uuid.UUID):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
            # Broadcast online status if this is their first connection
            await self.broadcast_status(user_id, True)
        self.active_connections[user_id].add(websocket)

    async def disconnect(self, websocket: WebSocket, user_id: uuid.UUID):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                # Broadcast offline status
                await self.broadcast_status(user_id, False)

    async def send_personal_message(self, message: dict, user_id: uuid.UUID):
        """Send a message to all active connections of a specific user."""
        if user_id in self.active_connections:
            text_data = json.dumps(message)
            # Send to all their devices/tabs
            dead_sockets = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(text_data)
                except Exception:
                    dead_sockets.add(connection)
            
            # Clean up dead sockets
            for ds in dead_sockets:
                await self.disconnect(ds, user_id)

    async def broadcast_status(self, user_id: uuid.UUID, online: bool):
        """Broadcast user online/offline status to all connected users."""
        message = {
            "type": "user.status",
            "data": {
                "user_id": str(user_id),
                "online": online
            }
        }
        text_data = json.dumps(message)
        for uid, connections in self.active_connections.items():
            if uid == user_id:
                continue
            for connection in connections:
                try:
                    await connection.send_text(text_data)
                except Exception:
                    pass

    async def broadcast_typing(self, sender_id: uuid.UUID, recipient_ids: list[uuid.UUID], conversation_id: uuid.UUID, is_typing: bool):
        message = {
            "type": "typing",
            "data": {
                "user_id": str(sender_id),
                "conversation_id": str(conversation_id),
                "is_typing": is_typing
            }
        }
        for recipient_id in recipient_ids:
            await self.send_personal_message(message, recipient_id)

    def is_online(self, user_id: uuid.UUID) -> bool:
        return user_id in self.active_connections

chat_manager = ConnectionManager()
