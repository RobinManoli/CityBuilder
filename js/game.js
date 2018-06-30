//var game = new Phaser.Game(800, 400, Phaser.AUTO, 'test', null, true, false);
var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'game');
var BasicGame = function (game) {};
BasicGame.Boot = function (game) {};
var isoGroup;

var tileMap = []; // all tiles in a 3D-tensor
var tileSize = 55; // half of pixelsize, so half image is drawn in front of other tile
var toolTiles = [];
var hoveredTile; // current tile being hovered

var cursorPos;
var cursorTool;

function defined( variable )
{
	return typeof variable !== 'undefined';
}

BasicGame.Boot.prototype = {
	preload: function () {
		game.load.image('Plains', 'img/plains.png');
		game.load.image('Village', 'img/city.png');
		game.load.image('City', 'img/garbage.png');
		game.time.advancedTiming = true;

		game.plugins.add(new Phaser.Plugin.Isometric(game));

		// This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
		// this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
		game.iso.anchor.setTo(0.5, 0.3);
	},

	createTile: function(xx, yy, zz, name) {
		var tile = game.add.isoSprite(xx * tileSize, yy * tileSize, zz*tileSize, name, 0, isoGroup);
		tile.anchor.set(0.5);
		tile.inputEnabled = true;
		tile.events.onInputDown.add(this.clickedTile, this);
		tile.name = name;
		tile.data = {}; // this object should exist on later versions of phaser
		tile.data.x = xx;
		tile.data.y = yy;
		tile.data.z = zz;

		game.add.tween(tile).from({
			isoZ: zz*tileSize + 10
		}, 100 * ((xx + yy) % 10), Phaser.Easing.Quadratic.InOut, true, 0);

		//console.log("created tile:", name, xx, tile.x); // note that tile.x is not the same as xx, which is why tile.data.x is created
		return tile;
	},

	createTool: function(name){
		if ( toolTiles.indexOf(name) < 0 )
		{
			console.log("creating tool:", name);
			var yy = 120 + (tileSize + 20) * toolTiles.length;
			var sprite = game.add.sprite( 10, yy, name );
			sprite.scale.setTo(0.5, 0.5);
			game.debug.text( name, 10, yy + tileSize + 15 );
			sprite.name = name;
			sprite.inputEnabled = true;
			sprite.events.onInputDown.add(this.clickedTool, this);
			toolTiles.push( name );

			game.add.tween(sprite.scale).from({
				x:1, y:1
			}, 500, Phaser.Easing.Bounce.In, true, 0);
		}
	},

	create: function () {
		// Create a group for our tiles, so we can use Group.sort
		isoGroup = game.add.group();

		// Provide a 3D position for the cursor
		cursorPos = new Phaser.Plugin.Isometric.Point3();

		// draw starting tiles
		for (var xx = 0; xx < 9; xx++) {
			tileMap.push([]); // add position for x = 0...1...2...
			for (var yy = 0; yy < 9; yy++) {
				tileMap[xx].push([]); // add all y positions for x = 0...1...2
				// Create a cube using the new game.add.isoSprite factory method at the specified position.
				// The last parameter is the group you want to add it to (just like game.add.sprite)
				var tile = this.createTile(xx, yy, 0, 'Plains');
				tileMap[xx][yy].push([]); // add a list for z = 0 for all x and y positions
				tileMap[xx][yy][0] = tile; // make tile accessible from its x,y,z data

				/*
				// Add a slightly different tween to each cube so we can see the depth sorting working more easily.
				game.add.tween(cube).to({
					isoZ: 10
				}, 100 * ((xx + yy) % 10), Phaser.Easing.Quadratic.InOut, true, 0, Infinity, true);
				*/
			}
		}
		game.iso.simpleSort(isoGroup);
		//console.log( tileMap ); // print the 3D tensor

		// tool ui
		for (var key in tiles)
		{
			var tile = tiles[key];
			//console.log( tile.icon );
			if ( tile.icon && !tile.hidden )
			{
				this.createTool( key );
			}
		}

	},
	update: function () {
		var instance = this;
		// Update the cursor position.
		// It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
		// determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
		game.iso.unproject(game.input.activePointer.position, cursorPos, 1*tileSize);

		hoveredTile = null;
		// Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
		isoGroup.forEach(function (tile) {
			var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);
			// If it does, do a little animation and tint change.
			if (!tile.selected && inBounds) {
				tile.selected = true;
				tile.tint = 0x86bfda;
				game.add.tween(tile).to({ isoZ: 4 + tile.data.z * tileSize}, 200, Phaser.Easing.Quadratic.InOut, true);
				instance.tooltip('hi');
			}
			// If not, revert back to how it was.
			else if (tile.selected && !inBounds) {
				tile.selected = false;
				tile.tint = 0xffffff;
				game.add.tween(tile).to({ isoZ: 0 + tile.data.z * tileSize}, 200, Phaser.Easing.Quadratic.InOut, true);
			}

			if (tile.selected || inBounds)
			{
				// keep track of hovered tile
				hoveredTile = tile;
			}
		});
	},
	render: function () {
		var yy = 0;
		linespacing = 20;
		yy += linespacing;
		game.debug.text("FPS: " + game.time.fps || '--', 10, yy, "#a7aebe");
		yy += linespacing;
		game.debug.text("Pop: " + stats.population, 10, yy, "#a7aebe");
		yy += linespacing;
		game.debug.text("Sci: " + stats.science, 10, yy, "#a7aebe");
		yy += linespacing;
		game.debug.text("Pol: " + stats.pollution, 10, yy, "#a7aebe");
		yy += linespacing;

		// tooltip
		//if (typeof hoveredTile !== 'undefined' && hoveredTile)
		if (hoveredTile)
		{
			var text = hoveredTile.name;
			game.debug.text(hoveredTile.name, game.input.mousePointer.x, game.input.mousePointer.y);
		}

		if (cursorTool)
		{
			cursorTool.x = game.input.mousePointer.x;
			cursorTool.y = game.input.mousePointer.y;
		}
	},

	clickedTile: function(tile, ptr) {
		//console.log('clickedTile:', tile); //this is the clicked tile according to phaser/iso plugin, which is often wrong, so use hoveredTile to be sure
		//console.log('clickedTile:', hoveredTile);
		//hoveredTile.destroy(); // for testing that correct tile is accessed when clicked

		if (cursorTool && hoveredTile)
		{
			var replacedTile = tiles[ hoveredTile.name ];
			var replacingTile = tiles[ cursorTool.name ];
			//console.log( replacedTile, replacingTile );
			if ( replacingTile.buildsOnTopOf.indexOf(hoveredTile.name) >= 0 )
			{
				//console.log('creating tile');
				this.createTile( hoveredTile.data.x, hoveredTile.data.y, hoveredTile.data.z + 1, cursorTool.name );
				game.iso.simpleSort(isoGroup); // needed when added tile doesn't display correctly in 3D space

				for (var i in replacingTile.unhides)
				{
					var hiddenTileName = replacingTile.unhides[i]
					hiddenTile = tiles[ hiddenTileName ];
					hiddenTile.hidden = false;
					console.log( replacingTile.unhides, i, hiddenTile );
					this.createTool( hiddenTileName );
				}
			}
		}
		
	},

	clickedTool: function(tool, ptr) {
		//console.log('clickedTool:', tool, cursorTool);
		if (cursorTool) cursorTool.destroy();
		cursorTool = game.add.sprite( game.input.mousePointer.x, game.input.mousePointer.y, tool.name );
		cursorTool.name = tool.name;
		cursorTool.scale.setTo(0.5, 0.5);
	},

	tooltip: function(text) {
		game.debug.text(text, game.input.mousePointer.x, game.input.mousePointer.y);
	},
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');

