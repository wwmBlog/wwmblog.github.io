#!/usr/bin/env python

import wsgiref.handlers
from google.appengine.ext import webapp
from google.appengine.api import mail

class MyHandler(webapp.RequestHandler):
    def get(self):
        if self.request.get('email') != "" and self.request.get("content") != "" and self.request.get("jsonp") != "" :
                message = mail.EmailMessage()
                message.sender = ""
                message.subject = ""
                message.to = ""
                message.body = """
From %s :
%s
""" % (self.request.get('email'), self.request.get('content'))
                try:
                    message.send()
                    self.response.out.write("%s ({ result: 'success' })" % self.request.get('jsonp'))
                except:
                    self.response.out.write("%s ({ result: 'server error' })" % self.request.get('jsonp'))
        else :
            self.response.out.write("%s ({ result: 'fail' })" % self.request.get('jsonp'))

def main():
    app = webapp.WSGIApplication([(r'.*', MyHandler)], debug=True)
    wsgiref.handlers.CGIHandler().run(app)
if __name__ == "__main__":
    main()
