var tiles = {};

// icon means whether the tile has a build icon in the ui
tiles.Plains = { icon:false };
tiles.Village = { icon:true, work:1, buildsOnTopOf:['Plains'], unhides:['City'], createdFx:{ Population:1}, fx:{ Garbage: 1} }; // does not stack
tiles.City = { icon:true, hidden:true, work:2, buildsOnTopOf:['Plains', 'City'], replaces:['Village'], createdFx:{ Population:2 }, fx:{ Garbage:2 } };
tiles.Garbage = { icon:true, work:2, buildsOnTopOf:['Plains', 'City'], replaces:['Village'], createdFx:{ Population:2 }, fx:{ Garbage:2 } };

/*
{
	"description": "advances can stack to max-height once that level of science is reached"

	,"residential": [
		{ "name": "village",	"effects": { "population": 1 },		"requires": {},		"max-height": 1 }
	]


	,"educational": [
	]


	,"debris": [
	]
}
*/
