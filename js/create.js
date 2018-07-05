function createFunc(game)
{
	instance = this;
	// Create a group for our tiles, so we can use Group.sort
	isoGroup = game.add.group();

	// Provide a 3D position for the cursor
	cursorPos = new Phaser.Plugin.Isometric.Point3();

	sliderX = game.width/2;
	sliderYMin = game.height;
	sliderYMax = 0;
	// draw starting tiles, and create grid -- but don't add grid tiles here (do it with this.createTile)
	for (var xx = 0; xx < 5; xx++) {
		tileGrid.push([]); // add position for x = 0...1...2...
		for (var yy = 0; yy < 5; yy++) {
			tileGrid[xx].push([]); // add all y positions for x = 0...1...2
			// Create a cube using the new game.add.isoSprite factory method at the specified position.
			// The last parameter is the group you want to add it to (just like game.add.sprite)
			tileGrid[xx][yy] = []; // add a list for z = 0 for all x and y positions
			var tile = this.createTile(xx, yy, 0, 'Plains');
			sliderYMin = Math.min(sliderYMin, tile.y - tileSize); // sliderYMin must allow only top tile to be visible, but never hide it
			sliderYMax = Math.max(sliderYMax, tile.y - tileSize/2);
			sliderX = Math.max(sliderX, tile.x + tileSize * 2);
			//tileGrid[xx][yy][0] = tile; // make tile accessible from its x,y,z data // do this in createTile

			/*
			// Add a slightly different tween to each cube so we can see the depth sorting working more easily.
			game.add.tween(cube).to({
				isoZ: 10
			}, 100 * ((xx + yy) % 10), Phaser.Easing.Quadratic.InOut, true, 0, Infinity, true);
			*/
		}
	}
	//game.iso.simpleSort(isoGroup); // done in createTile
	//console.log( tileGrid ); // print the 3D tensor

	// key presses
	keyEsc = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
	keyEsc.onDown.add(this.setDefaultTool, this);
	//keySpace = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	//keySpace.onDown.add(this.startRound, this);
	//keyShift = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
	//keyShift.onDown.add(function(){ shiftDown = true; }, this);
	//keyShift.onUp.add(function(){ shiftDown = false; }, this);

	// (non sprite/clickable object) clicks
	// click anywhere
	window.addEventListener("click", function(){ if (!hoveredTile) instance.startRound()});

	// tool ui
	// cursor
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

	toolTipBackground = new Phaser.Rectangle( 0, 0, 400, 300 ) ;
	roundFinishedBackground = new Phaser.Rectangle( game.width/2 - 200, 80, 400, 40 ) ;


	var sliderRect = game.add.graphics(999999, 999999);
	sliderRect.beginFill(0x0000FF);
	sliderRect.drawRect(0, 0, 30, tileSize * 2);
	//slider = new Phaser.Rectangle( game.width - tileSize * 3, ymax, 20, 60);

	slider = game.add.sprite(sliderX, sliderYMax, sliderRect.generateTexture());
	slider.alpha = 0.6;
	slider.inputEnabled = true;
    slider.input.enableDrag(); // works only on sprites
	//slider.events.onDragStart.add(dragUpdateFunc);
	//slider.events.onDragUpdate.add(dragUpdateFunc); // doesn't exist in Phaser v 2.1.1

}
