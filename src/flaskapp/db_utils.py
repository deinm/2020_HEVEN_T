# Import database module.
# from firebase_admin import db
#
# # Get a database reference to our posts
# ref = db.reference('server/saving-data/fireblog/posts')
#
# # Read the data at the posts reference (this is a blocking operation)
# print(ref.get())

import requests


data = requests.get('https://heven-t.firebaseio.com/')
print(data.text)