let c;
let b;
let r = true;

function i() {
	c = document.getElementById('container');
	if (!c) return false;
	b = document.getElementById('roman-arabic-switcher');
	if (!b) return false;
	return true;
}

function sw() {
	r = !r;
	if (!r) {
		c.removeAttribute('roman');
		b.removeAttribute('roman');
		return;
	}

	c.setAttribute('roman', '');
	b.setAttribute('roman', '');
}

document.addEventListener('DOMContentLoaded', () => {
	if (i()) {
		b.addEventListener('click', sw);
	}
});
