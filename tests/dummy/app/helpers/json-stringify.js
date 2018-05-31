import { helper } from '@ember/component/helper';
// TODO: When support for importing CJS modules lands then import this library instead of copy-pasting
//const safeStringify = require('safe-json-stringify');
//import * as safeStringify from 'safe-json-stringify';

const hasProp = Object.prototype.hasOwnProperty;

function throwsMessage(err) {
	return '[Throws: ' + (err ? err.message : '?') + ']';
}

function safeGetValueFromPropertyOnObject(obj, property) {
	if (hasProp.call(obj, property)) {
		try {
			return obj[property];
		}
		catch (err) {
			return throwsMessage(err);
		}
	}

	return obj[property];
}

function ensureProperties(obj) {
	const seen = [ ]; // store references to objects we have seen before

	function visit(obj) {
		if (obj === null || typeof obj !== 'object') {
			return obj;
		}

		if (seen.indexOf(obj) !== -1) {
			return '[Circular]';
		}
		seen.push(obj);

		if (typeof obj.toJSON === 'function') {
			try {
				const fResult = visit(obj.toJSON());
				seen.pop();
				return fResult;
			} catch(err) {
				return throwsMessage(err);
			}
		}

		if (Array.isArray(obj)) {
			const aResult = obj.map(visit);
			seen.pop();
			return aResult;
		}

		const result = Object.keys(obj).reduce(function(result, prop) {
			// prevent faulty defined getter properties
			result[prop] = visit(safeGetValueFromPropertyOnObject(obj, prop));
			return result;
		}, {});
		seen.pop();
		return result;
	}

	return visit(obj);
}

function safeStringify(data, replacer, space) {
	return JSON.stringify(ensureProperties(data), replacer, space);
}

export function jsonStringify(params, { spaces=2 }) {
  //return JSON.stringify(params[0], null, spaces);
  //const startTime = Date.now();
  const result = safeStringify(params[0], null, spaces);
  //const endTime = Date.now();
  //console.log(`jsonStringify took ${endTime - startTime}ms`);
  return result;
}

export default helper(jsonStringify);
