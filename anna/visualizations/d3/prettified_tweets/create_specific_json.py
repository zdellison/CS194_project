import json
import sys
import os.path
import numpy as np


def main():

	# will pull desired info from each tweet in the tweets_directory and compile a new json file
	# with just the desired info
	tweets_directory = sys.argv[1]
	output_file_name = sys.argv[2]


	# tweet_file = open(file_name)
	# tweet_data = json.load(tweet_file)
	# number_of_hashtags = len(tweets["entities"]["hashtags"])
	# hashtag_text = str(tweet_data["entities"]["hashtags"][0]["text"])
	# favorite_count = tweets["favorite_count"]



	hashtag_info = "{ \"hashtags\": [ "

	# hashtag_info["hashtags"] = []

	for filename in os.listdir (tweets_directory):
		tweet_file = tweets_directory + "/" + filename
		with open(tweet_file, 'r') as tweet:
			tweet_data = json.load(tweet)
		favorite_count = tweet_data["favorite_count"]
		retweet_count = tweet_data["retweet_count"]
		for hashtag in tweet_data["entities"]["hashtags"]:
			hashtag_text = str(hashtag["text"])
			print hashtag_text

			# simple_hashtag = {}
			# simple_hashtag["text"] = hashtag["text"]
			# simple_hashtag["favorite_count"] = favorite_count
			# hashtag_info["hashtags"].append(simple_hashtag)

			hashtag_info += "{ \"text\": "
			hashtag_info += "\"" + hashtag_text + "\""
			hashtag_info += ", \"favorite_count\": "
			hashtag_info += str(favorite_count) 
			hashtag_info += ", \"retweet_count\": "
			hashtag_info += str(retweet_count)
			hashtag_info += " },"

	hashtag_info = hashtag_info[:-1]
	hashtag_info += "]}"
	print hashtag_info

	output_file = open(output_file_name, 'w')
	parsed_json = json.loads(hashtag_info)
	prettified = json.dumps(parsed_json, indent=4, sort_keys=True)
	output_file.write(prettified)
	output_file.close()



if __name__ == '__main__':
    main()

