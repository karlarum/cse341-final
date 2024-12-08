/* Defines how the in-memory MongoDB server 
   works during testing */
module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      // mongodb version
      version: "7.0.15",
      // skips file verification = faster downloads
      skipMD5: true,
    },
    // leave instance empty to create dynamic db
    instance: {
      // name of database
      dbName: "team",
    },
    // Won't start automatically
    autoStart: false,
  },
};

/* parallel testing: makes sure each test worker gets its own isolated test database

module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      skipMD5: true,
    },
    autoStart: false,
    instance: {},
  },

  useSharedDBForAllJestWorkers: false,
};
*/

/* Renames the ENV variable used to access the database connection URL

module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '4.0.3',
      skipMD5: true,
    },
    instance: {},
    autoStart: false,
  },
  mongoURLEnvName: 'MONGODB_URI',
};
*/

/* MongoDB acts as a replica set (multiple instances for better reliability). count: 3 means three replicas, and wiredTiger is the default storage engine 

module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      skipMD5: true,
    },
    autoStart: false,
    instance: {},
    replSet: {
      count: 3,
      storageEngine: 'wiredTiger',
    },
  },
};
*/