from channels.sessions import channel_session
from channels.auth import channel_session_user, channel_session_user_from_http
from urllib.parse import parse_qs
from channels import Group
import json

# Connected to websocket.connect
@channel_session_user_from_http
def ws_connect(message, room_name):
    message.reply_channel.send({"accept": True})

    message.channel_session["username"] = message.user.username
    Group("chat-%s" % room_name).add(message.reply_channel)

# Connected to websocket.receive
@channel_session_user
def ws_message(message, room_name):
    #room_name = message.content
    Group("chat-%s" % room_name).send({
        "text": json.dumps({
            "type": json.loads(message.content['text'])['type'],
            "text": json.loads(message.content['text'])['text'],
            "username": message.user.username
        }),
    })

# Connected to websocket.disconnect
@channel_session_user
def ws_disconnect(message, room_name):
    Group("chat-%s" % room_name).discard(message.reply_channel)