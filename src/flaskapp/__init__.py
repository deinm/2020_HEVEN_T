import os

from flask import Flask
from flask_session import Session
from flask_talisman import Talisman
from werkzeug.middleware.proxy_fix import ProxyFix


# for security
class SecureFlask(Flask):
    def process_response(self, response):
        # Every response will be processed here first
        response.headers['server'] = 'ZEZEDU'
        super(SecureFlask, self).process_response(response)

        return response


# create app object
app = SecureFlask(__name__)

# filesystem session for msal
app.config['SESSION_TYPE'] = "filesystem"
Session(app)

# for security
app.secret_key = 'zezedu123!@#'

# SSL
if 'SSL_DISABLE' in os.environ:
    app.config['SSL_MODE'] = False
elif not app.debug and not app.testing:
    app.config['SSL_MODE'] = True
    csp = {
        'default-src': ["'self'",
                        ],
        'img-src': ["'self'  data:",
                    "https://i1.daumcdn.net/"
                    ],
        'script-src': ["'self'",
                       "https://code.jquery.com/jquery-3.4.1.min.js",  # jquery
                       "https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js",  # bootstrap
                       "https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js",  # popper
                       "https://www.gstatic.com/firebasejs/7.16.1/firebase-app.js",   # firebase
                       "https://www.gstatic.com/firebasejs/7.16.1/firebase-analytics.js",   # firebase analytics
                       "https://dapi.kakao.com/v2/maps/sdk.js",
                       "https://t1.daumcdn.net/mapjsapi/js/main/4.2.0/kakao.js",
                       ],
        'style-src': ["'self'",
                      "https://stackpath.bootstrapcdn.com/",  # bootstrap
                      'https://fonts.googleapis.com/',  # google web fonts (css)
                      ],
        'font-src': ["https://fonts.gstatic.com/",  # google web fonts (font files)
                     "https://stackpath.bootstrapcdn.com"
                     ]
    }
    Talisman(app,
             force_https=True,
             content_security_policy=csp,
             content_security_policy_nonce_in=['script-src'])

app.wsgi_app = ProxyFix(app.wsgi_app)

from flaskapp import views