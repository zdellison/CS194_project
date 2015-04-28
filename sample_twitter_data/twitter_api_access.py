#!/usr/bin/env python
import oauth2 as oauth
import json

# NOTE: This file is creating a client for search api requests based
# on my token, not on an actual clients token as we will want to do
# on the website, i.e. doesn't actually implement OAuth for a user

# Output content of json API request
def output_content(content_json, file_string):
    # file to write to
    f = open(file_string, 'w')
    count = 0
    for status in content_json:
        count += 1
        f.write(json.dumps(status))
        f.write("\n")
    f.close()
    print "Wrote " + str(count) + " tweets to file."

# Search for retweets and output them to separate files
def output_retweets(content_json):
    for status in content_json:
        endpoint = retweet_endpoint + str(status['id']) + '.json'
        retweet_url = twitter_api_url + endpoint
        retweet_resp, retweet_content = client.request(retweet_url, "GET")

        retweet_content_json = json.loads(retweet_content)
        output_content(retweet_content_json, 'sample_retweet_' + str(status['id']) +
                '.txt.')

# Read in API Key, Secret Key, Token and Secret Token
creds = {}
for line in open('twitter_keyfile.txt', 'r'):
    key, value = line.rstrip().split()
    creds[key] = value

# Create your consumer with the proper key/secret.
consumer = oauth.Consumer(key=creds['api_key'], 
            secret = creds['api_secret'])

# Use my token as client for API requests
# Note: This will change if we do logins through Django

token = oauth.Token(creds['token'],
            creds['token_secret'])
client = oauth.Client(consumer, token)

# Build API Search request
twitter_api_url = 'https://api.twitter.com/1.1'
timeline_endpoint = '/statuses/user_timeline.json'
timeline_query_string = 'screen_name=HillaryClinton&count=5&include_rts=1'

# Endpoint + id.json
retweet_endpoint = '/statuses/retweets/'


timeline_url = twitter_api_url + timeline_endpoint + '?' + timeline_query_string

http_method = 'GET'


# The OAuth Client request works just like httplib2 for the most part.
resp, content = client.request(timeline_url, method=http_method)
print resp
print content

content_json = json.loads(content)
output_content(content_json, 'twitter_api_resp_content.txt')
output_retweets(content_json)


