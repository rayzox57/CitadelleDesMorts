let busy = false;
let items = [];
let selected = {
	el: undefined,
	to: undefined,
};

function init() {
	items = document.querySelectorAll('.menu-title');
	if (items.length == 0) return false;

	// foreach items
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const arrows = item.querySelectorAll('.arrow');
		if (!arrows.length == 2) {
			item.remove();
			continue;
		}
		const target = item.getAttribute('to');
		const to = document.getElementById(target);
		if (!to) {
			item.remove();
			continue;
		}
		item.addEventListener('click', () => {
			if (busy) return;
			busy = true;

			if (selected.el == item && selected.to == to) {
				item.setAttribute('selected', '0');
				to.setAttribute('selected', '0');
				selected.el = undefined;
				selected.to = undefined;
				busy = false;
				return;
			}

			if (selected.el) selected.el.setAttribute('selected', '0');
			if (selected.to) selected.to.setAttribute('selected', '0');

			item.setAttribute('selected', '1');
			to.setAttribute('selected', '1');
			selected.el = item;
			selected.to = to;
			busy = false;
		});
	}
}

document.addEventListener('DOMContentLoaded', () => {
	init();
});
