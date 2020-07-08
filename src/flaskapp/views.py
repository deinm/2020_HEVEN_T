from flaskapp import app
from flask import render_template


@app.route('/')
def route_mainpage():
    return render_template("mainpage.html")