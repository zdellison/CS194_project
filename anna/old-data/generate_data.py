from twitter_info import User
from twitter_info import Tweet
import random
import json
# import numpy as np



def randomlyGenerateMetaData(users, user_id):
	user = User(user_id)
	gender = random.sample(["female", "male"], 1)
	user.gender = gender[0]
	user.age = random.randint(13, 70)
	users[user_id] = user


def updateConnectedUserInfo(users, pair_of_users):
	user1 = pair_of_users[0]
	user2 = pair_of_users[1]
	if not users.has_key(user1):
		randomlyGenerateMetaData(users, user1)
	if not users.has_key(user2):
		randomlyGenerateMetaData(users, user2)

	users[user1].addRetweetedBy(user2)
	users[user2].addRetweetedBy(user1)




def importRetweetNetwork(filename, connected_users):
	input_file = open(filename)
	input_lines = input_file.readlines()
	for line in input_lines:
		users = (line.strip()).split() 
		connected_users.append((users[0], users[1]))

def writeToOutput(filename, string):
	outputFile = open(filename, "w")
	outputFile.write(string)
	outputFile.close()


def main():
	connected_users = []

	# a dictionary mapping user_id to the Twitter User object
	users = {} 
	serial_user_info = {}

	importRetweetNetwork("higgs-retweet_network.edgelist", connected_users)
	for pair_of_users in connected_users:
		updateConnectedUserInfo(users, pair_of_users)

	for user in users:

		print user + " retweeted by: " + ','.join(users[user].retweeted_by)
		print user + " 's demographics:"
		print "age: " + str(users[user].age)
		print "gender: " + users[user].gender
		serial_user_info[user] = (users[user].retweeted_by, users[user].age, users[user].gender)

	json_data = json.dumps(serial_user_info)
	filename = "random_user_info.json"
	writeToOutput(filename, json_data)


if __name__ == '__main__':
    main()