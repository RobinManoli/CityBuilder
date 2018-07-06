//var game = new Phaser.Game(800, 400, Phaser.AUTO, 'test', null, true, false);
//var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO, 'game');
var game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.CANVAS, 'game'); // auto makes page not even work on mobile
var BasicGame = function (game) {};
BasicGame.Boot = function (game) {};
var isoGroup;

var tileGrid = []; // all tiles in a 3D-tensor
var tileSize = 42; // half of pixelsize, so half image is drawn in front of other tile, + 2 so corner of front tile does not cover back tile
var toolTiles = [];
var hoveredTile; // current tile being hovered

var roundFinishedSprite;
var toolTipBackground;
var displayedStats = [];
var displayedStatsTimeStamp = 0;

var cursorPos, cursorTool, clickTimer;

var slider, sliderX, sliderYMin, sliderYMax;

var keyEsc;
var keySpace;
//var keyShift;
//var shiftDown = false;

//var Work = 1;
var nRound = 1;

var animatingShowAllTiles = false;

function defined( variable )
{
	return typeof variable !== 'undefined';
}

BasicGame.Boot.prototype = {
	preload: preloadFunc,
	create: createFunc,
	update: updateFunc,
	render: renderFunc,

	createTile: function(xx, yy, zz, name) {
		var tile = game.add.isoSprite(xx * tileSize, yy * tileSize, zz*tileSize, name, 0, isoGroup);
		//tile.scale.set(1.5, 1.5); // don't scale this as it messes up tile highlighting
		tile.anchor.set(0.5);
		tile.inputEnabled = true;
		tile.events.onInputDown.add(this.clickTile, this);
		tile.name = name;
		tile.data = {}; // this object should exist on later versions of phaser
		tile.data.x = xx;
		tile.data.y = yy;
		tile.data.z = zz;
		tile.typeData = tileTypeData[name];
		if ( !tile.typeData.count ) tile.typeData.count = 0;
		if ( !tile.typeData.tiles ) tile.typeData.tiles = [tile];
		else tile.typeData.tiles.push( tile );
		tileGrid[xx][yy].push(tile); // add tile to gridmap

		if ( tile.typeData.work )
		{
			// set low opacity on creation, since actual opacity will be set when work is applied eg on click
			tile.alpha = 0.25;
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

	getRandomGridTile: function()
	{
		xx = Math.floor( Math.random() * tileGrid.length );
		yy = Math.floor( Math.random() * tileGrid[xx].length );
		zz = Math.floor( Math.random() * tileGrid[xx][yy].length );
		return tileGrid[xx][yy][zz];
	},

	getRandomEmptyTile: function()
	{
		// try this many times before giving up
		for (var i=0; i<100; i++)
		{
			var gridTile = this.getRandomGridTile();
			//console.log( gridTile, tileGrid );
			// if the z array has length 1 it has only a plains tile, ie it is empty
			//console.log( tileGrid[gridTile.data.x][gridTile.data.y].length );
			if ( tileGrid[gridTile.data.x][gridTile.data.y].length === 1 ) return gridTile;
		}
		return;
	},

	addGarbage: function() {
		var instance = this;
		// animate adding garbage
		animatingShowAllTiles = true;
		for ( var i = stats.Garbage; i > 1; i -= 2 )
		{
			//console.log("Setting garbage timer");
			// delay loop to make it easier to see
			setTimeout( function(){
				//console.log();
				plainsTile = instance.getRandomEmptyTile();
				if ( plainsTile ) instance.createTile( plainsTile.data.x, plainsTile.data.y, 1, 'Garbage' )
				else
				{
					if ( !stats.hasOwnProperty('Pollution') ) stats.Pollution = 0;
					stats.Pollution++; // found no empty tile, so burn the garbage and create pollution
				}
				stats.Garbage -= 2;
			}, 200 * i);
		}
	},

	removeGarbage: function() {
		var instance = this;
		while ( stats.Garbage <= -2 && tileTypeData.Garbage.tiles.length )
		{
			// select first created garbage
			garbageTile = tileTypeData.Garbage.tiles[0];
			tileTypeData.Garbage.tiles.splice(0, 1) // remove first created garbage
			//console.log( "Removing garbage tile:", stats.Garbage, garbageTile );
			var index = garbageTile.data.z;
			tileGrid[ garbageTile.data.x ][ garbageTile.data.y ].splice(index, 1); // remove tile from grid
			garbageTile.destroy();
			stats.Garbage += 2;
		}
		if ( stats.Garbage < 0 ) stats.Garbage = 0;
	},

	startRound: function() {
		var instance = this;
		//console.log("starting round:", nRound);
		stats.Work = stats.Population;
		nRound++;
		roundFinished = false;
		animatingShowAllTiles = false; // show all tiles when animating until pressing space

		// remove designated work from workforce, and disable tiles if necessary
		isoGroup.forEach( function(tile) {
			instance.designateWorkOrDisableTile(tile);
		});
	},

	finishRound: function() {
		//console.log("finishing round:", nRound);
		var instance = this;

		// apply effects
		isoGroup.forEach( function(gridTile) {
			var tileType = tileTypeData[ gridTile.name ];
			//console.log(gridTile, tileType);
			if (tileType.fx && !gridTile.data.workLeft && !gridTile.data.disabled)
			{
				instance.applyFx( tileType.fx );
			}
		});

		if (stats.Garbage) this.addGarbage();

		// after all animations are done
		game.time.events.add(250 * (stats.Garbage || 0), function(){
			//console.log("round finished:", nRound);
			this.startRound();
		}, this);

	},

	applyWork: function( tile, workAmount ) {
		// applies work to a tile whose tileData.work is set
		//console.log("applying work to tile:", tile);

		// init work on tile
		if ( !tile.data.workLeft && tile.data.workLeft !== 0 ) tile.data.workLeft = tile.typeData.work;

		stats.Work -= workAmount;
		tile.data.workLeft -= workAmount;

		if ( tile.data.workLeft <= 0 )
		{
			tile.data.workLeft = 0;
			tile.typeData.count++;
			tile.alpha = 1
			this.applyFx( tile.typeData.cost );
		}
		else
		{
			//console.log( tile.data.workLeft, tile.typeData, tile.tint);
			var completed = 1 - tile.data.workLeft / tile.typeData.work;
			tile.alpha = 0.5 + completed / 4; // work in progress will render opacity from 0.5 to 0.75
			//tile.alpha = 1 - tile.data.workLeft / tile.typeData.work;
		}
	},

	applyFx: function( fx ) {
		//console.log("applying fx:", fx);
		var i = 1;
		for (var stat in fx)
		{
			if ( !stats.hasOwnProperty(stat) ) stats[stat] = 0;
			//console.log("applying fx to:", stat, stats[stat], fx[stat]);
			if ( stat != 'Work' ) stats[stat] += fx[stat]; // Work is designated so not applied here
			i++;
		}

		this.removeGarbage();
	},

	unhideTools: function() {
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

	clickTile: function(tile, ptr) {
		//console.log('clickTile:', tile); //this is the clicked tile according to phaser/iso plugin, which is often wrong, so use hoveredTile to be sure
		//console.log('clickTile:', hoveredTile);
		//hoveredTile.destroy(); // for testing that correct tile is accessed when clicked

		if (hoveredTile)
		{
			//console.log("clickTile", hoveredTile, tile);
			// click tile with active tool
			if (cursorTool && cursorTool.alive)
			{
				if (stats.Work >= 1)
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
						this.designateWorkOrDisableTile( gridTile );
					}
				}
			}

			// click tile without active tool
			else
			{
				//console.log(clickTimer);
				//modalFunc( hoveredTile.name );
				if ( stats.Work >= 1 && hoveredTile.data.workLeft )
				{
					// add work points to building
					this.applyWork(hoveredTile, 1);
				}
				else
					// show tileinfo or doubleclick
					document.getElementById('tileClicker').click();
			}
		}

		// unhide tools 
		this.unhideTools();
	},

	enableDisableTile: function() {
		console.log('enableDisableTile');
		if (hoveredTile && hoveredTile.typeData.disablable)
		{
			hoveredTile.data.disabled = !hoveredTile.data.disabled;
			if ( hoveredTile.data.disabled ) stats.Work -= hoveredTile.typeData.fx.Work;
			else this.designateWorkOrDisableTile(hoveredTile);
			console.log(hoveredTile.data.disabled, stats.Work);
		}
	},

	designateWorkOrDisableTile: function(tile) {
		if (tile.typeData.fx && tile.typeData.fx.Work && !tile.data.disabled)
		{
			if ( !tile.data.workLeft && stats.Work + tile.typeData.fx.Work < 0 ) tile.data.disabled = true;
			else stats.Work += tile.typeData.fx.Work;
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
		//document.body.style.cursor = 'none'; // hides normal cursor and replaces with sprite, but it makes the cursor feel slow
	},

	setDefaultTool: function()
	{
		if (cursorTool)
		{
			cursorTool.kill();
			//console.log( cursorTool );
			//document.body.style.cursor = ''; // resets cursor, depr
		}
	},

	/*tooltip: function(text) {
		game.debug.text(text, game.input.mousePointer.x, game.input.mousePointer.y);
	},*/
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');
