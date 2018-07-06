var tileTypeData = {};

// icon means whether the tile has a build icon in the ui
// cost means the effects that happen when the building is done, both positive and negative
tileTypeData.Plains = { icon:false };
tileTypeData.Garbage = { icon:false, buildsOnTopOf:['Plains', 'City'], replaces:['Village'], cost:{}, fx:{} };

tileTypeData.Village = { icon:true, work:1, buildsOnTopOf:['Plains'], cost:{ Population:1 }, fx:{ Garbage:1 } }; // does not stack
tileTypeData.School = { icon:true, hidden:true, disablable:true, work:1, buildsOnTopOf:['Plains'], requiredTiles:{ Village:1 }, cost:{ Science:1 }, fx:{ Science:1, Work:-1 } };
tileTypeData.City = { icon:true, hidden:true, work:3, buildsOnTopOf:['Plains', 'City'], requiredTiles:{ Village:2, School:2 }, cost:{ Population:3, Pollution:1 }, fx:{ Garbage:3 } };
tileTypeData.Recycling = { icon:true, hidden:true, disablable:true, work:2, buildsOnTopOf:['Plains'], requiredTiles:{ City:3 }, cost:{}, fx:{ Garbage:-14, Work:-4  } };
tileTypeData.Highschool = { icon:true, hidden:true, disablable:true, work:3, buildsOnTopOf:['Plains'], requiredTiles:{ City:4, Recycling:2 }, cost:{}, fx:{ Work:-2, Science:4  } };


/*
	"description": "advances can stack to max-height once that level of science is reached"
	,"residential": [
	,"educational": [
	,"debris": [
*/

var spriteData = {};

spriteData.Plains = 'img/plains.png';
spriteData.Village = 'img/village.png';
spriteData.School = 'img/school.png';
spriteData.Garbage = 'img/garbage.png';
spriteData.City = 'img/city.png';
spriteData.Recycling = 'img/recycling.png';
spriteData.Highschool = 'img/highschool.png';

spriteData.Cursor = 'img/cursor3D.png';
