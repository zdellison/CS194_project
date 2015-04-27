
class User:
    def __init__(self, id):
        self.id = id
        self.gender = "na"
        self.age = -1
        self.city = None
        self.state = None
        self.country = None
        self.time_zone = None
        self.retweeted_by = []

    def addRetweetedBy(self, user_id):
    	self.retweeted_by.append(user_id)

   	def getRetweetedBy(self):
   		return self.retweeted_by

   	def setGender(self, gender):
   		self.gender = gender

   	def setAge(self, age):
   		self.age = age



class Tweet:
	def __init__(self, id):
		self.id = id
		self.text = None
		self.geo = None
		self.retweets = 0
		self.retweeted_by = []

	def setContent(self, content):
		self.text = content

	def getRetweets(self):
		return self.retweets

	def addRetweet(self, user_id):
		self.retweeted_by.append(user_id)
		retweets += 1

	def getRetweeters(self):
		return self.retweeted_by



