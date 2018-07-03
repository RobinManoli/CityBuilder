var tileTypeData = {};

// icon means whether the tile has a build icon in the ui
tileTypeData.Plains = { icon:false };
tileTypeData.Garbage = { icon:false, buildsOnTopOf:['Plains', 'City'], replaces:['Village'], cost:{}, fx:{} };

tileTypeData.Village = { icon:true, work:1, buildsOnTopOf:['Plains'], cost:{ Population:1 }, fx:{ Garbage:1 } }; // does not stack
tileTypeData.School = { icon:true, hidden:true, work:1, buildsOnTopOf:['Plains'], requiredTiles:{ Village:1 }, cost:{ Science:1 }, fx:{ Science:1, Work:-1 } };
tileTypeData.City = { icon:true, hidden:true, work:3, buildsOnTopOf:['Plains', 'City'], requiredTiles:{ Village:2, School:2 }, cost:{ Population:3, Pollution:1 }, fx:{ Garbage:3 } };
tileTypeData.Recycling = { icon:true, hidden:true, work:2, buildsOnTopOf:['Plains'], requiredTiles:{ City:3 }, cost:{}, fx:{ Garbage:-3 } };


/*
	"description": "advances can stack to max-height once that level of science is reached"
	,"residential": [
	,"educational": [
	,"debris": [
*/
