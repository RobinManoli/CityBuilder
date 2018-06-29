//var game = new Phaser.Game(800, 400, Phaser.AUTO, 'test', null, true, false);
var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'game');
var BasicGame = function (game) {};
BasicGame.Boot = function (game) {};
var isoGroup;

var tileSize = 55; // half of pixelsize, so half image is drawn in front of other tile
var hoveredTile; // current tile being hovered

BasicGame.Boot.prototype = {
	preload: function () {
		game.load.image('cube', 'img/plains.png');
		game.time.advancedTiming = true;

		game.plugins.add(new Phaser.Plugin.Isometric(game));

		// This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
		// this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
		game.iso.anchor.setTo(0.5, 0.3);
	},

	create: function () {
		// Create a group for our tiles, so we can use Group.sort
		isoGroup = game.add.group();

		// Provide a 3D position for the cursor
		cursorPos = new Phaser.Plugin.Isometric.Point3();

		// draw starting tiles
		var cube;
		for (var xx = 0; xx < 9; xx++) {
			for (var yy = 0; yy < 9; yy++) {
				// Create a cube using the new game.add.isoSprite factory method at the specified position.
				// The last parameter is the group you want to add it to (just like game.add.sprite)
				cube = game.add.isoSprite(xx * tileSize, yy * tileSize, 0, 'cube', 0, isoGroup);
				cube.anchor.set(0.5)
				cube.inputEnabled = true;
				cube.events.onInputDown.add(this.clickedTile, this);

				/*
				// Add a slightly different tween to each cube so we can see the depth sorting working more easily.
				game.add.tween(cube).to({
					isoZ: 10
				}, 100 * ((xx + yy) % 10), Phaser.Easing.Quadratic.InOut, true, 0, Infinity, true);
				*/
			}
		}
		game.iso.simpleSort(isoGroup);

	},
	update: function () {
		// Update the cursor position.
		// It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
		// determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
		game.iso.unproject(game.input.activePointer.position, cursorPos, 1*tileSize);

		// Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
		isoGroup.forEach(function (tile) {
			var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);
			// If it does, do a little animation and tint change.
			if (!tile.selected && inBounds) {
				hoveredTile = tile;
				tile.selected = true;
				tile.tint = 0x86bfda;
				game.add.tween(tile).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);
			}
			// If not, revert back to how it was.
			else if (tile.selected && !inBounds) {
				tile.selected = false;
				tile.tint = 0xffffff;
				game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
			}
		});
	},
	render: function () {
		game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
	},

	clickedTile: function(tile, ptr) {
		//console.log('clickedTile:', tile); this is the clicked tile according to phaser, which is often wrong, so use hoveredTile to be sure
		hoveredTile.destroy();
	}
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');

