var tiles = {};

// icon means whether the tile has a build icon in the ui
tiles.Plains = { icon:false };
tiles.Village = { icon:true, buildsOnTopOf:['Plains'] };

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
