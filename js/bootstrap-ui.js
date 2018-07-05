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
	
	setTimeout(	function(){ $('#tile-info .modal').modal('toggle'); }, 0); // delay before showing the modal, so that there is time to see if the correct tile was tapped (if it was tapped on mobile)
}

 window.app = new Vue({
	el: "#vue-app",
	data: {
		hoveredTile: {},
		spriteData: spriteData,
	},
	methods: {
		setHoveredTile() {
			this.hoveredTile = hoveredTile ? hoveredTile: {};
		}
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
