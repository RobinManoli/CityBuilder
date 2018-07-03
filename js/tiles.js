var tileTypeData = {};

// icon means whether the tile has a build icon in the ui
tileTypeData.Plains = { icon:false };
tileTypeData.Garbage = { icon:false, buildsOnTopOf:['Plains', 'City'], replaces:['Village'], createdFx:{}, fx:{} };

tileTypeData.Village = { icon:true, work:1, buildsOnTopOf:['Plains'], createdFx:{ Population:1, Funds:-1 }, fx:{ Garbage:1, Funds:1 } }; // does not stack
tileTypeData.School = { icon:true, hidden:true, work:1, buildsOnTopOf:['Plains'], requiredTiles:{ Village:1 }, createdFx:{ Science:1, Funds:-1 }, fx:{ Science:1, Funds:-1 } };
tileTypeData.City = { icon:true, hidden:true, work:3, buildsOnTopOf:['Plains', 'City'], requiredTiles:{ Village:2, School:2 }, createdFx:{ Population:3, Pollution:1, Funds:-3 }, fx:{ Garbage:3, Funds:3 } };


/*
	"description": "advances can stack to max-height once that level of science is reached"
	,"residential": [
	,"educational": [
	,"debris": [
*/
