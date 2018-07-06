// https://css-tricks.com/reactive-uis-vanillajs-part-1-pure-functional-style/

function modalFunc(tile_name)
{
	if (hoveredTile.typeData.maxEmployees) employeesHtml = `<button type="button" class="btn btn-sm btn-outline-primary">-</button><button type="button" class="btn btn-sm btn-outline-primary">+</button>`;
	else employeesHtml = '';

	document.querySelector('#tile-info').innerHTML = `
		<div class="modal" id="" tabindex="-1" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="exampleModalLongTitle">${ tile_name }</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div class="modal-body">
						<img src="${ spriteData[tile_name]} ">
						<br>
						${ employeesHtml }
						<div class="d-block d-sm-none">XS</div>
						<div class="d-none d-sm-block d-md-none">SM</div>
						<div class="d-none d-md-block d-lg-none">MD</div>
						<div class="d-none d-lg-block d-xl-none">LG</div>
						<div class="d-none d-xl-block">XL</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
						<button type="button" class="btn btn-primary">Save changes</button>
					</div>
				</div>
			</div>
		</div>
	`;
	
	/*
	// add tools
	for (var i in toolTiles)
	{
		var tool = toolTiles[i];
		var $toolContainer = document.querySelector('#build-tools')
		//console.log(tool);
		//var html = `<img src="${ spriteData[tool] }">`;
		//$toolContainer.innerHTML += html;
		//console.log( $toolContainer );
		var $img = document.createElement('img');
		$img.setAttribute("src", spriteData[tool]);
		$toolContainer.appendChild($img);
		$img.addEventListener("click", function(){ $('#tile-info .modal').modal('toggle'); modalFunc(tool) });
	}
	*/
	
	setTimeout( function(){ $('#tile-info .modal').modal('toggle'); }, 0); // delay before showing the modal, so that there is time to see if the correct tile was tapped (if it was tapped on mobile)
}

 window.app = new Vue({
	el: "#vue-app",
	data: {
		gameFuncs: game.state.states.Boot,
		hoveredTile: {},
		spriteData: spriteData,
	},
	methods: {
		setHoveredTile() {
			this.hoveredTile = hoveredTile ? hoveredTile: {};
		},
		clickTile() {
				var instance = this;
				this.setHoveredTile();
				if (clickTimer)
				{
					// double click occured, since a click happened when there exists a timeout from an earlier click
					//console.log('dlick', game);
					clearTimeout(clickTimer);
					clickTimer = false;
					this.gameFuncs.enableDisableTile();
				}
				else
					clickTimer = setTimeout( function(){ instance.$refs.tileinfo.show(); clickTimer=false }, 300 );
		},
	}
	})

/*
function resizeGame() {
    game.scale.setGameSize($( window ).width(), $( window ).height());
}

$( window ).resize(function() {
    resizeGame();
}); 
*/
