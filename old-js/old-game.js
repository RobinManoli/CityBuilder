require([
      'jsiso/canvas/Control',
      'jsiso/tile/Field',
	  'jsiso/canvas/Input',
      'jsiso/img/load',
      'requirejs/domReady!'
    ],
    function(CanvasControl, TileField, CanvasInput, ImgLoad) {
	  //console.log("CanvasControl, TileField, ImgLoad", CanvasControl, TileField, ImgLoad)
      // RGBA of color to use
      var transparentColor = "(0, 0, 0, 0)";
      var whiteHLColor = "(255, 255, 255, 0.5)";

	  var xWidth = 11;
	  var zWidth = 11;
      var tileMap = []; // a matrix of colors in format such as transparentColor
      var tileHeightMap = []; // matrix of integers with the height of each tile
		
	  for (var i = 0; i < xWidth; i++)
	  {
		  var row = [];
		  var rowHeight = [];
		  for (var j = 0; j < zWidth; j++)
		  {
			  row.push(transparentColor);
			  rowHeight.push(1);
		  }
		  tileMap.push(row)
		  tileHeightMap.push(rowHeight);
	  }
	  
	  // init cursor
	  selectedTileX = 2;
	  selectedTileZ = 5;

	  //console.log( tileMap )
	  tileMap[ selectedTileX ][ selectedTileZ ] = whiteHLColor;
	  //console.log( tileMap )

      // use CanvasControl to create a simple canvas element
      // ID of Canvas,
      // width of Canvas,
      // Height of Canvas,
      // Optioanl: Any Style proprties we wish to apply,
      // Optional: The DOM ID location we wish to place the canvas in, otherwise it appends to Body
      var context = CanvasControl.create("canvas", document.body.clientWidth - 20, window.innerHeight - 20, {}, "canvas");

      var tileLayer = new TileField(context, CanvasControl().height, CanvasControl().width);

      var images = [
        { graphics: ["img/plains.png"] },
        { graphics: ["img/city.png"] },
        { graphics: ["img/garbage.png"] },
      ];
	  
	  var plainsGfx;
	  var cityGfx;
	  var garbageGfx;


	  // imgLoad uses Promises, once the images have loaded we continue and use the returned imgResponse
      ImgLoad(images).then(function(imgResponse) {
        plainsGfx = imgResponse[0].files["plains.png"] 
        cityGfx = imgResponse[1].files["city.png"] 
        garbageGfx = imgResponse[2].files["garbage.png"] 

        tileLayer.setup({
          layout: tileMap,
          isometric: true, // Flag used to layout grid in non isometric format
          tileHeight: 40,
          tileWidth: 80,
          zeroIsBlank: true,
          heightMap: {
            map: tileHeightMap,
            heightTile: plainsGfx, // imgResponse[0] contains the files[] we placed in the graphcis array for loading
            offset: 0
          },
        });

        // Rotate our entire Map 
        tileLayer.rotate("left");

        // Set an offset so our map is on screen
        tileLayer.setOffset(500, 300)
		
		function draw()
		{
			context.clearRect(0, 0, CanvasControl().width, CanvasControl().height);
			// Loop through our tiles and draw the map  
			for (i = 0; i < 0 + xWidth; i++) {
			  for (j = 0; j < 0 + zWidth; j++) {
				gfx = [cityGfx, garbageGfx];
				randChoice = Math.floor(gfx.length * Math.random())
				/*if ( Math.random() > 0.5 ) tileLayer.draw(i,j, gfx[randChoice]), whiteHLColor; // draws sa if on a layer on top for some reason
				else */tileLayer.draw(i,j);
			  }
			}
		}
		draw()
        
        
		var input = new CanvasInput(document, CanvasControl());

		/*input.mouse_action(function(coords) {
			tile_coordinates =  mapLayers[0].applyMouseFocus(coords.x, coords.y); // Get the current mouse location from X & Y Coords
			mapLayers[0].setHeightmapTile(tile_coordinates.x, tile_coordinates.y, mapLayers[0].getHeightMapTile(tile_coordinates.x, tile_coordinates.y) + 1); // Increase heightmap tile 
			mapLayers[0].setTile(tile_coordinates.x, tile_coordinates.y, 9); // Force the chaning of tile graphic
		});*/

		input.mouse_move(function(coords) {
			console.log("mouse_move", coords, tileLayer);
			tileLayer.map(function(layer) {
				console.log("tileLayer map");
				tile_coordinates = layer.applyMouseFocus(coords.x, coords.y); // Apply mouse rollover via mouse location X & Y
				draw();
			});
		}); 


  });


});