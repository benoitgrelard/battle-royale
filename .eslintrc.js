module.exports = {
	extends: 'airbnb-base',

	rules: {
		// best-practices
		'default-case': 0,
		'no-unused-vars': [1, { 'vars': 'local', 'args': 'none' }],

		// es6
		'arrow-parens': [2, 'as-needed'],
		'comma-dangle': [1, "never"],

		// style
		'indent': [2, 'tab', { 'SwitchCase': 1 }],
		'new-cap': 0,
		'no-underscore-dangle': 0
	},

	globals: {
		// can be used by webpack to perform dead code elimination
		"__DEV__": false
	}
}
