const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const sha512 = require('js-sha512').sha512;
module.exports = {
	generateUUIDv4:()=>{return uuidv4()},
	getGMTDatetime:()=>{return (new Date()).toGMTString()},
	parseSqlTemplate:(length,keyStr,valueStr,concatStr,operators)=>{
		return _(Array(length)).map((v,k)=>{
			var ope = '=';
			if(_.isArray(operators)){
				ope = operators[k];
			}
			return `${keyStr}${valueStr?` ${ope} ${valueStr}`:''}`
		}).join(` ${concatStr} `);
	},
	mixSqlTemplateValue:(fields)=>{
		return _(fields).map((v,k)=>{
				return [k,v];
			}).flatten().value()
	},
	sha512:sha512,
	generateToken:(str)=>{
		return sha512.hex(str + Date.now() + Math.random());
	}
}