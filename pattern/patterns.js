const fs = require('fs')
const locales = require('./countries')

const obj = {}

const dataOptions = (data, code) => {
	const valueOptions = {
		month: data.value.length == 1 ? 'M' : 'MM',
		day: data.value.length == 1 ? 'D' : 'DD',
		year: 'YYYY',
		literal: data.value,
		default: () => {
			return console.error(
				`dataOptions functions says - ${data.type} and  ${data.value} is not a data type - code: ${code}`
			)
		},
	}

	return valueOptions[data.type] || valueOptions.default()
}

const parsePhoneFormat = (code, formatObj) => {
	return formatObj
		.map((dateItem) => dataOptions(dateItem, code))
		.join('')
		.replace(',', '')
}

const getDatesPositions = (format) => {
	let position = 0
	const obj = {}
	format.forEach((item) => {
		if (item.type == 'year' || item.type == 'day' || item.type == 'month') {
			obj[item.type] = position++
		}
	})

	return obj
}

const getRegex = (format) => {
	const obj = {}

	// ^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$

	const regexString = (data) => {
		return {
			month: '(0?[1-9]|1[012])',
			day: '(0?[1-9]|[12][0-9]|3[01])',
			year: '([0-9]{4})',
			literal: data.value,
			default: () => {
				return console.error(
					`getRegex functions says - ${data.type} and ${data.value} is not a data type`
				)
			},
		}
	}

	format.forEach((item) => {
		if (item.type == 'year' || item.type == 'day' || item.type == 'month') {
			obj[item.type] =
				regexString(item)[item.type] || regexString(item).default()
		}
	})

	// obj.complete 

	return obj
}

const hasEra = (formatObj) => {
	const era = formatObj.filter((item) => item.type === 'era')
	return !!era.length
}

for (const key in locales) {
	if (locales.hasOwnProperty(key)) {
		const code = locales[key].code
		const formatObj = new Intl.DateTimeFormat(code).formatToParts(new Date())

		obj[key] = {
			name: locales[key].name,
			code: locales[key].code,
			era: hasEra(formatObj),
			dateFormat: parsePhoneFormat(code, formatObj),
			dateSplitedPositions: getDatesPositions(formatObj),
			dateRegex: getRegex(formatObj),
		}
	}
}

const json = JSON.stringify(obj)
fs.writeFile('./patterns.json', json, 'utf8', function (err) {
	err ? new Error(err) : console.log('Success')
})
