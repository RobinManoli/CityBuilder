//var game = new Phaser.Game(800, 400, Phaser.AUTO, 'test', null, true, false);
var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'game');
var BasicGame = function (game) {};
BasicGame.Boot = function (game) {};
var isoGroup;

var tileMap = []; // all tiles in a 3D-tensor
var tileSize = 40; // half of pixelsize, so half image is drawn in front of other tile
var toolTiles = [];
var hoveredTile; // current tile being hovered

var cursorPos;
var cursorTool;

var keyEsc;

var Work = 1;

function defined( variable )
{
	return typeof variable !== 'undefined';
}

BasicGame.Boot.prototype = {
	preload: function () {
		game.load.image('Plains', 'img/plains.png');
		game.load.image('Village', 'img/village.png');
		game.load.image('School', 'img/village2.png');
		game.load.image('City', 'img/city.png');
		game.load.image('Garbage', 'img/garbage.png');

		game.load.image('Cursor', 'img/cursor.png');
		game.time.advancedTiming = true;

		game.plugins.add(new Phaser.Plugin.Isometric(game));

		// This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
		// this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
		game.iso.anchor.setTo(0.5, 0.3);
	},

	createTile: function(xx, yy, zz, name) {
		var tile = game.add.isoSprite(xx * tileSize, yy * tileSize, zz*tileSize, name, 0, isoGroup);
		//tile.scale.set(1.5, 1.5); // don't scale this as it messes up tile highlighting
		tile.anchor.set(0.5);
		tile.inputEnabled = true;
		tile.events.onInputDown.add(this.clickedTile, this);
		tile.name = name;
		tile.data = {}; // this object should exist on later versions of phaser
		tile.data.x = xx;
		tile.data.y = yy;
		tile.data.z = zz;
		tile.typeData = tileTypeData[name];
		if ( !tile.typeData.count ) tile.typeData.count = 1;
		else tile.typeData.count += 1;
		tileMap[xx][yy].push(tile); // add tile to gridmap

		if ( tile.typeData.work )
		{
			// set low opacity on creation, since actual opacity will be set when work is applied eg on click
			tile.alpha = 0.1;
		}

		game.iso.simpleSort(isoGroup);
		game.add.tween(tile).from({
			isoZ: zz*tileSize + 10
		}, 100 * ((xx + yy) % 10), Phaser.Easing.Quadratic.InOut, true, 0);

		//console.log("created tile:", name, xx, tile.x); // note that tile.x is not the same as xx, which is why tile.data.x is created
		return tile;
	},

	createTool: function(name){
		if ( toolTiles.indexOf(name) < 0 )
		{
			//console.log("creating tool:", name);
			var yy = 120 + (tileSize + 10) * toolTiles.length;
			var sprite = game.add.sprite( game.width - tileSize - 50, yy, name );
			sprite.scale.setTo(0.5, 0.5);
			//game.debug.text( name, game.width - tileSize, yy + tileSize + 15 );
			sprite.name = name;
			sprite.inputEnabled = true;
			sprite.events.onInputDown.add(this.clickedTool, this);
			toolTiles.push( name );

			game.add.tween(sprite.scale).from({
				x:2, y:2
			}, 500, Phaser.Easing.Bounce.In, true, 0);
		}
	},

	create: function () {
		// Create a group for our tiles, so we can use Group.sort
		isoGroup = game.add.group();

		// Provide a 3D position for the cursor
		cursorPos = new Phaser.Plugin.Isometric.Point3();

		// draw starting tiles, and create grid -- but don't add grid tiles here (do it with this.createTile)
		for (var xx = 0; xx < 5; xx++) {
			tileMap.push([]); // add position for x = 0...1...2...
			for (var yy = 0; yy < 5; yy++) {
				tileMap[xx].push([]); // add all y positions for x = 0...1...2
				// Create a cube using the new game.add.isoSprite factory method at the specified position.
				// The last parameter is the group you want to add it to (just like game.add.sprite)
				tileMap[xx][yy] = []; // add a list for z = 0 for all x and y positions
				var tile = this.createTile(xx, yy, 0, 'Plains');
				//tileMap[xx][yy][0] = tile; // make tile accessible from its x,y,z data // do this in createTile

				/*
				// Add a slightly different tween to each cube so we can see the depth sorting working more easily.
				game.add.tween(cube).to({
					isoZ: 10
				}, 100 * ((xx + yy) % 10), Phaser.Easing.Quadratic.InOut, true, 0, Infinity, true);
				*/
			}
		}
		//game.iso.simpleSort(isoGroup); // done in createTile
		//console.log( tileMap ); // print the 3D tensor

		// tool ui
		// cursor
		keyEsc = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		keyEsc.onDown.add(this.setDefaultTool, this);
		var btn = game.add.button(game.width - tileSize - 50, 100, 'Cursor', this.setDefaultTool, this);

		// buildings
		for (var key in tileTypeData)
		{
			var tileType = tileTypeData[key];
			//console.log( tileType.icon );
			if ( tileType.icon && !tileType.hidden )
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

			if ( !tile.selected && tile.data.workLeft )
			{
				//console.log( tile );
				tile.tint = 0xffff00;
			}
		});
	},
	render: function () {
		var yy = 0;
		linespacing = 20;
		yy += linespacing;
		game.debug.text("FPS: " + game.time.fps || '--', 10, yy, "#a7aebe");
		for (stat in stats)
		{
			yy += linespacing;
			var text = stat + ': ' + stats[stat]
			game.debug.text(text, 10, yy, "#a7aebe");
		}
		yy += linespacing;

		// tooltip
		//if (typeof hoveredTile !== 'undefined' && hoveredTile)
		var tooltip = [];
		if (hoveredTile && (!cursorTool || !cursorTool.alive) )
		{
			var tileType = tileTypeData[ hoveredTile.name ];
			///console.log( tileType, hoveredTile );
			tooltip.push(hoveredTile.name);
			if ( hoveredTile.data.workLeft )
			{
				tooltip.push('Workforce left: ' + Work);
				tooltip.push('Work left:' + (tileType.work - hoveredTile.data.workLeft) + '/' + tileType.work);
			}
			//game.debug.text(text, game.input.mousePointer.x + tileSize + 5, game.input.mousePointer.y + tileSize / 2);
			//yyy += 20;

			if (cursorTool && cursorTool.alive)
			{
				//console.log( cursorTool );
			}
		}

		else if (cursorTool && cursorTool.alive)
		{
			cursorTool.x = game.input.mousePointer.x;
			cursorTool.y = game.input.mousePointer.y;
			tooltip.push('Build: ' + cursorTool.name);
			tooltip.push('Workforce left: ' + Work);
			tooltip.push('Work required: ' + tileTypeData[cursorTool.name].work);
		}
		else
		{
		}
		var yyy = 0;
		for (var i in tooltip)
			game.debug.text(tooltip[i], game.input.mousePointer.x + tileSize + 5, game.input.mousePointer.y + tileSize / 2 + 20 * i);
	},

	getRandomGridTile: function()
	{
		xx = Math.floor( Math.random() * tileMap.length );
		yy = Math.floor( Math.random() * tileMap[xx].length );
		zz = Math.floor( Math.random() * tileMap[xx][yy].length );
		return tileMap[xx][yy][zz];
	},

	getRandomEmptyTile: function()
	{
		// try this many times before giving up
		for (var i=0; i<100; i++)
		{
			var gridTile = this.getRandomGridTile();
			//console.log( gridTile, tileMap );
			// if the z array has length 1 it has only a plains tile, ie it is empty
			//console.log( tileMap[gridTile.data.x][gridTile.data.y].length );
			if ( tileMap[gridTile.data.x][gridTile.data.y].length === 1 ) return gridTile;
		}
		return;
	},

	finishRound: function() {
		//console.log("finished round:");
		var instance = this;
		Work = stats.Population;


		// apply effects
		isoGroup.forEach( function(gridTile) {
			var tileType = tileTypeData[ gridTile.name ];
			//console.log(gridTile.name, tileType);
			if (tileType.fx) instance.applyFx( tileType.fx );
		});


		// draw excess garbage
		for ( var i = stats.Garbage; i > 1; i -= 2 )
		{
			// delay loop to make it easier to see
			setTimeout( function(){
				plainsTile = instance.getRandomEmptyTile();
				if ( plainsTile ) instance.createTile( plainsTile.data.x, plainsTile.data.y, 1, 'Garbage' )
				stats.Garbage -= 2;
			}, 200 * i);
		}

	},

	applyWork: function( tile, workAmount ) {
		// applies work to a tile whose tileData.work is set
		//console.log("applying work to tile:", tile);

		// init work on tile
		if ( !tile.data.workLeft && tile.data.workLeft !== 0 ) tile.data.workLeft = tile.typeData.work;

		Work -= workAmount;
		tile.data.workLeft -= workAmount;

		if ( tile.data.workLeft <= 0 )
		{
			tile.data.workLeft = 0;
			tile.alpha = 1
			this.applyFx( tile.typeData.createdFx );
		}
		else
		{
			//console.log( tile.data.workLeft, tile.typeData, tile.tint);
			tile.alpha = 1 - tile.data.workLeft / tile.typeData.work;
		}

		if (Work == 0) this.finishRound(); // remove this when keypress/button is implemented
	},

	applyFx: function( fx ) {
		//console.log("applying fx:", fx);
		for (var stat in fx)
		{
			//console.log("applying fx to:", stat, stats[stat], fx[stat]);
			stats[stat] += fx[stat];
		}
	},

	unhideTiles: function() {
		//console.log();
		for (var tile_name in tileTypeData)
		{
			var outer_continue = false;
			var tileType = tileTypeData[tile_name];
			if ( tileType.hidden )
			{
				//console.log(tileType);
				for (var required_tile_name in tileType.requiredTiles)
				{
					var required_tile_count = tileType.requiredTiles[required_tile_name];
					//console.log( tile_name, required_tile_name, required_tile_count );
					if ( !tileTypeData[required_tile_name].count || tileTypeData[required_tile_name].count < required_tile_count )
					{
						outer_continue = true;
						break;
					}
				}
				if (outer_continue) continue; // this tile type is not to be unhidden
				tileType.hidden = false;
				this.createTool(tile_name);
				//console.log(tile_name, 'now unhidden');
			}
		}
	},

	clickedTile: function(tile, ptr) {
		//console.log('clickedTile:', tile); //this is the clicked tile according to phaser/iso plugin, which is often wrong, so use hoveredTile to be sure
		//console.log('clickedTile:', hoveredTile);
		//hoveredTile.destroy(); // for testing that correct tile is accessed when clicked

		if (hoveredTile)
			// click tile with active tool/building
			if (cursorTool && cursorTool.alive)
			{
				var replacedTileType = tileTypeData[ hoveredTile.name ];
				var replacingTileType = tileTypeData[ cursorTool.name ];
				//console.log( replacedTileType, replacingTileType );
				if ( replacingTileType.buildsOnTopOf.indexOf(hoveredTile.name) >= 0 )
				{
					//console.log('creating tile');
					var gridTile = this.createTile( hoveredTile.data.x, hoveredTile.data.y, hoveredTile.data.z + 1, cursorTool.name );
					gridTile.data.workLeft -= 1;
					//game.iso.simpleSort(isoGroup); // needed when added tile doesn't display correctly in 3D space

					this.applyWork( gridTile, 1 );
					this.unhideTiles();
				}
			}

			// clicked tile with no tool active
			else if ( tile.data.workLeft )
			{
				// add work points to building
				this.applyWork(tile, 1);
			}
		
	},

	clickedTool: function(tool, ptr) {
		//console.log('clickedTool:', tool, cursorTool);
		if ( !cursorTool ) cursorTool = game.add.sprite( game.input.mousePointer.x, game.input.mousePointer.y, tool.name );
		else
		{
			cursorTool.loadTexture( tool.name );
			cursorTool.reset();
		}
		cursorTool.name = tool.name;
		cursorTool.scale.setTo(0.5, 0.5);
	},

	setDefaultTool: function()
	{
		if (cursorTool)
		{
			cursorTool.kill();
			//console.log( cursorTool );
		}
	},

	/*tooltip: function(text) {
		game.debug.text(text, game.input.mousePointer.x, game.input.mousePointer.y);
	},*/
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');

