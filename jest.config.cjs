module.exports = {
    verbose: true,
    
      testMatch: [
        "**/tests/**/*.test.js",
        "**/tests/**/*.spec.js"
      ],
      
      // Ignore certain directories
      testPathIgnorePatterns: [
        "/node_modules/",
        "/dist/"
      ],
    
       // Code coverage configuration
       collectCoverage: true,
       coverageDirectory: "./coverage",
       coverageReporters: [
         "text",
         "lcov"
       ],
       
    
      transform: {
        "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
      },
  
  
      
    };
    