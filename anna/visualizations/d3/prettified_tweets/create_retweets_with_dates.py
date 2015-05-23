import json
import sys
import os.path
import numpy as np


def main():

	# will pull desired info from each tweet in the tweets_directory and compile a new json file
	# with just the desired info
	tweets_directory = sys.argv[1]
	output_file_name = sys.argv[2]



	retweet_date_info = "{ \"tweets\": [ "

	timestamps_to_counts = {};

	for filename in os.listdir (tweets_directory):
		tweet_file = tweets_directory + "/" + filename
		with open(tweet_file, 'r') as tweet:
			tweet_data = json.load(tweet)
		favorite_count = tweet_data["favorite_count"]
		retweet_count = tweet_data["retweet_count"]
		date = tweet_data["created_at"]

		timestamps_to_counts[date] = (favorite_count, retweet_count)

	sorted_keys = sorted(timestamps_to_counts)

	size = len(sorted_keys)
	for key_index in range(0, size):

		retweet_date_info += "{ \"created_at\": "
		timestamp = sorted_keys[size-key_index-1]
		retweet_date_info += "\"" + str(timestamp) + "\""
		retweet_date_info +=", \"favorite_count\": "
		retweet_date_info += str(timestamps_to_counts[timestamp][0]) 
		retweet_date_info += ", \"retweet_count\": "
		retweet_date_info += str(timestamps_to_counts[timestamp][1])
		retweet_date_info += " },"



	retweet_date_info = retweet_date_info[:-1]
	retweet_date_info += "]}"
	print retweet_date_info

	output_file = open(output_file_name, 'w')
	parsed_json = json.loads(retweet_date_info)
	prettified = json.dumps(parsed_json, indent=4, sort_keys=True)
	output_file.write(prettified)
	output_file.close()



if __name__ == '__main__':
    main()

