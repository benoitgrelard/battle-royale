module.exports = {
	extends: 'airbnb-base',

	rules: {
		// best-practices

		// es6
		'arrow-parens': [2, 'as-needed'],
		'comma-dangle': [1, "never"],

		// style
		'indent': [2, 'tab', { 'SwitchCase': 1 }],
		'no-underscore-dangle': 0
	}
}
