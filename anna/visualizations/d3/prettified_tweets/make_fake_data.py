import json
import sys
import os.path
import numpy as np
import random
from math import trunc
from decimal import Decimal


def main():

	# will pull desired info from each tweet in the tweets_directory and compile a new json file
	# with just the desired info
	tweets_directory = sys.argv[1]
	output_file_name = sys.argv[2]



	# united states
# +48.987386 is the northern most latitude 
# +18.005611 is the southern most latitude 
# -124.626080 is the west most longitude 
# -62.361014 is a east most longitude 

	tweet_info = "{ \"tweets\": [ "

	# hashtag_info["hashtags"] = []

	for filename in os.listdir (tweets_directory):
		tweet_file = tweets_directory + "/" + filename
		with open(tweet_file, 'r') as tweet:
			tweet_data = json.load(tweet)
		favorite_count = tweet_data["favorite_count"]
		retweet_count = tweet_data["retweet_count"]
		tweet_text = tweet_data["text"]
		# longitude first, then latitude
		longitude = random.uniform(-124.626080, -62.361014)# make this random
		latitude = random.uniform(20.005611, 48.987386) #make this random

		longitude = Decimal('%.4f' % (longitude * 10000 / 10000))

		latitude = Decimal('%.4f' % (latitude * 10000 / 10000))

		gender = random.choice([0,1,2]) # 0 is female and 1 is male, 2 is unspecified

		hashtag_text = ""
		for hashtag in tweet_data["entities"]["hashtags"]:
			hashtag_text += "\"" + str(hashtag["text"]) + "\", "

		if (len(hashtag_text) > 0 ) :
			hashtag_text = hashtag_text[:-2]
		



		tweet_info += "{ \"tweet_text\": "
		tweet_info += "\"" + tweet_text + "\""
		tweet_info += ", \"hashtags\": [" + hashtag_text + "]"
		# tweet_info += "\"" + hashtag_text + "\""
		tweet_info += ", \"coordinates\": ["
		tweet_info += str(longitude)
		tweet_info += ", "
		tweet_info += str(latitude) + "]"
		tweet_info += ", \"gender\": "
		tweet_info += str(gender)
		tweet_info += ", \"favorite_count\": "
		tweet_info += str(favorite_count) 
		tweet_info += ", \"retweet_count\": "
		tweet_info += str(retweet_count)
		tweet_info += " },"

	tweet_info = tweet_info[:-1]
	tweet_info += "]}"


	output_file = open(output_file_name, 'w')
	parsed_json = json.loads(tweet_info)
	prettified = json.dumps(parsed_json, indent=4, sort_keys=True)
	output_file.write(prettified)
	output_file.close()



if __name__ == '__main__':
    main()

