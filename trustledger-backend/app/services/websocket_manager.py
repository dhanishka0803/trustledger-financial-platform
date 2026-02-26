from fastapi import WebSocket
from typing import Dict, List
import json
import asyncio

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"Client {client_id} connected")
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            print(f"Client {client_id} disconnected")
    
    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
            except:
                # Connection closed, remove it
                self.disconnect(client_id)
    
    async def broadcast(self, message: str):
        disconnected_clients = []
        for client_id, connection in self.active_connections.items():
            try:
                await connection.send_text(message)
            except:
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    async def send_fraud_alert(self, client_id: str, alert_data: dict):
        message = {
            "type": "fraud_alert",
            "data": alert_data
        }
        await self.send_personal_message(json.dumps(message), client_id)
    
    async def send_market_update(self, client_id: str, market_data: dict):
        message = {
            "type": "market_update",
            "data": market_data
        }
        await self.send_personal_message(json.dumps(message), client_id)
    
    async def send_transaction_update(self, client_id: str, transaction_data: dict):
        message = {
            "type": "transaction_update",
            "data": transaction_data
        }
        await self.send_personal_message(json.dumps(message), client_id)