import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

cred = credentials.Certificate('mykey.json')
firebase_admin.initialize_app(cred,{'databaseURL':'https://heven-t.firebaseio.com/'})


ref = db.reference()
ref.update({'날씨' : 'good'})





