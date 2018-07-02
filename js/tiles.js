var tiles = {};

// icon means whether the tile has a build icon in the ui
tiles.Plains = { icon:false };
tiles.Garbage = { icon:false, buildsOnTopOf:['Plains', 'City'], replaces:['Village'], createdFx:{}, fx:{} };

tiles.Village = { icon:true, work:1, buildsOnTopOf:['Plains'], createdFx:{ Population:1}, fx:{ Garbage: 1} }; // does not stack
tiles.School = { icon:true, hidden:true, work:1, buildsOnTopOf:['Plains'], requiredTiles:{ Village:1 }, createdFx:{ Population:3, Pollution:1 }, fx:{ Garbage:2 } };
tiles.City = { icon:true, hidden:true, work:9, buildsOnTopOf:['Plains', 'City'], requiredTiles:{ Village:2, School:2 }, createdFx:{ Population:3, Pollution:1 }, fx:{ Garbage:2 } };


/*
	"description": "advances can stack to max-height once that level of science is reached"
	,"residential": [
	,"educational": [
	,"debris": [
*/
