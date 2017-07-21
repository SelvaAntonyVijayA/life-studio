module.exports = {
  "name": "Tilist",
  "agileNodePath": "/ili/ili-tilist/agilenode/",
  "dbhost": "ec2-54-87-188-83.compute-1.amazonaws.com",   
  "dbport": "27017",
  "dbnames": ["tilist-core", "tilist-users", "tilist-service"],
  "dbauth": {
    "tilist-core": {
      "user": "ilroot",
      "password": "M@tsy@2011",
      "name": "ilicore"
    },
    "tilist-users": {
      "user": "ilroot",
      "password": "M@tsy@2011",
      "name": "iliuser"
    },
    "tilist-service": {
      "user": "ilroot",
      "password": "M$tsy$2011", 
      "name": "iliservice"
    }
  },
  "domain": "http://localhost:90",
  "authDomain": "http://ec2-52-203-33-209.compute-1.amazonaws.com",
  "mysql": {
    "host": "localhost",
    "port": "3306",
    "user": "ilireport",
    "password": "ili@report5",
    "db": "test"
  }
}