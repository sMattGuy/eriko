const fs = require('fs');
const { users, cb, todayshits } = require('./dbObjects.js');

const files = fs.readdirSync('./databases').filter(file => file.endsWith(`.json`));

for(const file of files){
	let startDate = file.substring(0,8);
	let endDate = file.substring(file.length-13,file.length-5);
	let serverID = file.substring(8,file.length-13)
	
	let fileData = fs.readFileSync(`./databases/${file}`);
	let JSONData = JSON.parse(fileData);
	
	let cbNumber = JSONData.num;
	
	cb.upsert({'server_id': serverID, 'cb_id': cbNumber, 'start_date': startDate, 'end_date': endDate});
	for(let i=0;i<JSONData.users.length;i++){
		users.upsert({'user_id': JSONData.users[i].id, 'server_id': serverID,'hits': 0});
		for(let j=0;j<JSONData.users[i].total.length;j++){
			todayshits.upsert({'user_id':JSONData.users[i].id,'server_id':serverID,'date':JSONData.users[i].total[j].date,'hits':JSONData.users[i].total[j].hits,'cb':cbNumber});
		}
	}
}