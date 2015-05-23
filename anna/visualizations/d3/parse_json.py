import json
import sys
import os.path


def main():

	tweet_info_directory = sys.argv[1]
	prettify_directory = sys.argv[2]

	for filename in os.listdir (tweet_info_directory):
		with open(tweet_info_directory + "/" + filename, 'r') as handle:
			parsed = json.load(handle)


		prettified_name = "prettified_" + filename
		prettified = json.dumps(parsed, indent=4, sort_keys=True)
		output_file = open(prettify_directory + "/prettified_json2.json", "w")

		output_file.write(prettified)

		output_file.close()



if __name__ == '__main__':
    main()

