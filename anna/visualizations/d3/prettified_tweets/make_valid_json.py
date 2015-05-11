import json
import sys
import os.path
import numpy as np


def main():

	tweet_info_directory = sys.argv[1]
	prettify_directory = sys.argv[2]

	for filename in os.listdir (tweet_info_directory):
		to_parse = tweet_info_directory + "/" + filename
		# with open(to_parse, 'r') as handle:
			# parsed = json.load(handle)
		input_file = open(to_parse)
		input_lines = input_file.readlines()
		

		i = 0
		for tweet in input_lines:

			extension_index = filename.find('.')
			parsed_json = json.loads(tweet.strip())

			prettified_name = "prettified_" + filename[:extension_index] + str(i) + ".json"
			prettified = json.dumps(parsed_json, indent=4, sort_keys=True)
			output_file_name = prettify_directory + prettified_name
			output_file = open(output_file_name, "w")
			output_file.write(prettified)
			output_file.close()
			i += 1



if __name__ == '__main__':
    main()

