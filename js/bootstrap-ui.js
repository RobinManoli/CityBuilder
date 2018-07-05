// https://css-tricks.com/reactive-uis-vanillajs-part-1-pure-functional-style/

function modalFunc(tile_name)
{
	document.querySelector('#tile-info').innerHTML = `
		<div class="modal fade" id="" tabindex="-1" role="dialog" aria-labelledby="exampleModalLongTitle" aria-hidden="true">
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
						On plains you can build anything.
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
						<button type="button" class="btn btn-primary">Save changes</button>
					</div>
				</div>
			</div>
		</div>
	`;
	$('#tile-info .modal').modal('toggle');
}

