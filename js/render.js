function renderFunc(game)
{
	var yy = 0;
	linespacing = 20;
	yy += linespacing;
	game.debug.text("FPS: " + game.time.fps || '--', 10, yy, "#a7aebe");
	//yy += linespacing;
	//game.debug.text("FPS: " + game.time.totalElapsedSeconds() || '--', 10, yy, "#a7aebe");
	//yy += linespacing;
	//game.debug.text("FPS: " + displayedStatsTimeStamp || '--', 10, yy, "#a7aebe");

	// render stat effects gradually
	for (stat in stats)
	{
		if ( !displayedStats.hasOwnProperty(stat) ) displayedStats[stat] = 0;

		// since the stat change is checked for every stat each frame, only change the stats when spotting a difference
		// otherwise the update will only happen to the first stat in the array
		if ( game.time.totalElapsedSeconds() - displayedStatsTimeStamp > 0.3 && displayedStats[stat] != stats[stat])
		{
			if ( displayedStats[stat] < stats[stat] ) displayedStats[stat]++;
			else if (displayedStats[stat] > stats[stat]) displayedStats[stat]--;
			displayedStatsTimeStamp = game.time.totalElapsedSeconds();
		}

		yy += linespacing;
		var text = stat + ': ' + displayedStats[stat];
		game.debug.text(text, 10, yy, "#a7aebe");
		//yy += linespacing;
		//var text = stat + ': ' + stats[stat];
		//game.debug.text(text, 10, yy, "#a7aebe");
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
		//tooltip.push('Workforce left: ' + Work);
		if ( hoveredTile.data.workLeft )
		{
			tooltip.push("Click to work");
			tooltip.push('Work left: ' + hoveredTile.data.workLeft + '/' + tileType.work);
		}
		else if ( hoveredTile.typeData.click )
		{
			tooltip.push("Click to use");
		}

		//game.debug.text(text, game.input.mousePointer.x + tileSize + 5, game.input.mousePointer.y + tileSize / 2);
		//yyy += 20;

		//tooltip.push("tile.x: " + hoveredTile.x);
		//tooltip.push("tile.y: " + hoveredTile.y);

		/*if (cursorTool && cursorTool.alive)
		{
			//console.log( cursorTool );
		}*/
	}

	else if (cursorTool && cursorTool.alive)
	{
		cursorTool.x = game.input.mousePointer.x - tileSize/2;
		cursorTool.y = game.input.mousePointer.y - tileSize/2;
		tooltip.push('Build: ' + cursorTool.name);
		//tooltip.push('Workforce left: ' + Work);
		tooltip.push('Work required: ' + tileTypeData[cursorTool.name].work);
	}


	if (tooltip.length)
	{
		var yyy = 0;
		toolTipBackground.x = game.input.mousePointer.x - toolTipBackground.width/2;
		toolTipBackground.y = game.input.mousePointer.y + tileSize;
		toolTipBackground.height = tooltip.length * 20 + 10;
		if (toolTipBackground.x < 0) toolTipBackground.x = 0;
		else if (toolTipBackground.x > game.width - toolTipBackground.width) toolTipBackground.x = game.width - toolTipBackground.width;
		if (toolTipBackground.y < 0) toolTipBackground.y = 0;
		else if (toolTipBackground.y > game.height - toolTipBackground.height) toolTipBackground.y = game.height - toolTipBackground.height;
		game.debug.geom( toolTipBackground, 'rgba(0,0,32,0.5)');
		for (var i in tooltip)
			game.debug.text(tooltip[i], toolTipBackground.x + 10, toolTipBackground.y + 20 + 20 * i);
	}
	else
		toolTipBackground.x = 999999;

	if (roundFinished)
	{
		game.debug.geom( roundFinishedBackground, 'rgba(0,0,255,0.3)');
		game.debug.text("Round " + nRound + " finished", game.width/2 - 90, 105);
	}
}