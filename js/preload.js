var spriteData = {};

spriteData.Plains = 'img/plains.png';
spriteData.Village = 'img/village.png';
spriteData.School = 'img/school.png';
spriteData.Garbage = 'img/garbage.png';
spriteData.City = 'img/city.png';
spriteData.Recycling = 'img/recycling.png';

spriteData.Cursor = 'img/cursor3D.png';

function preloadFunc(game)
{
	for (var sprite_name in spriteData) game.load.image(sprite_name, spriteData[sprite_name]);
	/*game.load.image('Plains', 'img/plains.png');
	game.load.image('Village', 'img/village.png');
	game.load.image('School', 'img/school.png');
	game.load.image('Garbage', 'img/garbage.png');
	game.load.image('City', 'img/city.png');
	game.load.image('Recycling', 'img/recycling.png');

	game.load.image('Cursor', 'img/cursor3D.png');*/
	game.time.advancedTiming = true;

	game.plugins.add(new Phaser.Plugin.Isometric(game));

	// This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
	// this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
	game.iso.anchor.setTo(0.5, 0.3);
}
