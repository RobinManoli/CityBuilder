function updateFunc(game)
{
	var instance = this;

	// slider extremes must be calculated before acting upton them (ie hiding tiles)
	slider.x = sliderX;
	if (slider.y < sliderYMin) slider.y = sliderYMin;
	else if (slider.y > sliderYMax) slider.y = sliderYMax;

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

		// make all tiles on z == 0 (and their buildings on top) nearer than cursor's y position hide
		if ( tile.data.z == 0 )
		{
			//if ( shiftDown && !animatingShowAllTiles && hoveredTile && tile.y - tileSize > game.input.mousePointer.y )
			if ( !animatingShowAllTiles && tile.y - tileSize > slider.y )
			{
				var z = tileGrid[tile.data.x][tile.data.y];
				for (var i in z)
					z[i].kill();
			}
			else
			{
				var z = tileGrid[tile.data.x][tile.data.y];
				for (var i in z)
					z[i].reset();
			}
		}
	});
}
