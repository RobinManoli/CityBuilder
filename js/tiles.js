var tileTypeData = {};

// icon means whether the tile has a build icon in the ui
tileTypeData.Plains = { icon:false };
tileTypeData.Garbage = { icon:false, buildsOnTopOf:['Plains', 'City'], replaces:['Village'], createdFx:{}, fx:{} };

tileTypeData.Village = { icon:true, work:1, buildsOnTopOf:['Plains'], createdFx:{ Population:1}, fx:{ Garbage: 1} }; // does not stack
tileTypeData.School = { icon:true, hidden:true, work:1, buildsOnTopOf:['Plains'], requiredTiles:{ Village:1 }, createdFx:{ Population:3, Pollution:1 }, fx:{ Garbage:2 } };
tileTypeData.City = { icon:true, hidden:true, work:9, buildsOnTopOf:['Plains', 'City'], requiredTiles:{ Village:1, School:1 }, createdFx:{ Population:3, Pollution:1 }, fx:{ Garbage:2 } };


/*
	"description": "advances can stack to max-height once that level of science is reached"
	,"residential": [
	,"educational": [
	,"debris": [
*/
