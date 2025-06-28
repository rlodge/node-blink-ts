module.exports = {
    roots: ["<rootDir>/test"],
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testRegex: "(/__test__/.*|(\\.|/)(test|spec))\\.tsx?$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    // Optionally, if you have module path aliases, add:
    // moduleNameMapper: {
    //   "^@src/(.*)$": "<rootDir>/src/$1"
    // },
};
