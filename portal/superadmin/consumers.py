import json
import time

from asgiref.sync import async_to_sync
from celery.result import AsyncResult
from channels.generic.websocket import WebsocketConsumer


from log.log import logger


class AdminConsumer(WebsocketConsumer):
    def connect(self):
        self.admin_name = self.scope['url_route']['kwargs']['admin_name']
        self.room_group_name = 'superadmin'
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.accept()        

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        print(message)
        result = AsyncResult(message)
        while True:
            print(result.status)
            if result.ready():
                if result.status == "FAILURE":
                    logger.error(result.collect().__next__()[1])
                    res = "Lỗi không xác định"
                else:
                    res = result.collect().__next__()[1]
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': res,
                    }
                )
                break
            else:
                time.sleep(3)

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']
        try:
            network = event['network']
            sshkey = event['sshkey']
            # Send message to WebSocket
            self.send(text_data=json.dumps({
                'message': message,
                'network': network,
                'sshkey': sshkey,
            }))
        except:
            # Send message to WebSocket
            self.send(text_data=json.dumps({
                'message': message,
            }))