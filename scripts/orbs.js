let orbTemplate;
let orbContainer;
let orbNumber = 4;
let maxOrbChoose = 4;
let orbImgPath = './public/orbs/';

let orbs = {};
let orbsOrder = {};

let orbCode = '';
let orbCodeInput;
let orbCodeButtonLock;
let orbCodeButtonCopy;
let orbCodeButtonUpdate;
let orbLock = false;

function initOrbs() {
	orbTemplate = document.querySelector('#case-template[type="orb"]');
	if (!orbTemplate) return false;
	const checkSymbol = orbTemplate.querySelector('.symbol');
	if (!checkSymbol) return false;
	const checkOrder = orbTemplate.querySelector('.order');
	if (!checkOrder) return false;

	orbContainer = document.getElementById('orbs');
	if (!orbContainer) return false;

	orbCodeInput = document.getElementById('orb-code-input');
	if (!orbCodeInput) return false;
	orbCodeInput.setAttribute('locked', true);
	orbCodeInput.setAttribute('readonly', true);
	orbCodeInput.disabled = true;

	orbCodeButtonLock = document.getElementById('orb-lock');
	if (!orbCodeButtonLock) return false;

	orbCodeButtonCopy = document.getElementById('orb-copy');
	if (!orbCodeButtonCopy) return false;

	orbCodeButtonUpdate = document.getElementById('orb-update');
	if (!orbCodeButtonUpdate) return false;

	return true;
}

function createOrbs() {
	for (let i = 1; i < maxOrbChoose + 1; i++) {
		orbsOrder[i] = {
			el: undefined,
		};
	}

	for (let i = 1; i < orbNumber + 1; i++) {
		let orb = orbTemplate.cloneNode(true);
		orb.setAttribute('type', 'orb');
		orb.setAttribute('order', -1);
		orb.setAttribute('style', '--data-order: -1');
		orb.setAttribute('id', `orb-${i}`);
		orb.setAttribute('index', i);

		const symbol = orb.querySelector('.symbol');
		const imgs = symbol.querySelectorAll('img');
		for (let j = 0; j < imgs.length; j++) {
			imgs[j].setAttribute('src', `${orbImgPath}${i}.png`);
		}
		orbContainer.appendChild(orb);
		orbs[i] = {
			el: orb,
		};

		orb.addEventListener('click', (event) => clickOrb(event.target));
	}
}

function clickOrb(orb) {
	if (orbLock) {
		alert('Orbs are locked.');
		return;
	}
	const order = orb.getAttribute('order');

	if (order == -1) {
		return placeOrb(orb);
	}

	return removeOrb(orb);
}

function placeOrb(orb) {
	for (let i = 1; i <= maxOrbChoose; i++) {
		if (orbsOrder[i].el === orb) {
			return removeOrb(orb);
		}
	}

	const selectedCount = Object.values(orbsOrder).filter(
		(entry) => entry.el !== undefined,
	).length;

	if (selectedCount >= maxOrbChoose) {
		const lastOrbIndex = maxOrbChoose;
		const lastOrb = orbsOrder[lastOrbIndex].el;

		if (lastOrb) {
			lastOrb.setAttribute('order', -1);
			lastOrb.setAttribute('style', '--data-order: -1');
		}

		orb.setAttribute('order', lastOrbIndex);
		orb.setAttribute('style', `--data-order: ${lastOrbIndex}`);
		orbsOrder[lastOrbIndex].el = orb;

		repositionOrbsInContainer();
		return;
	}

	for (let i = 1; i <= maxOrbChoose; i++) {
		if (orbsOrder[i].el === undefined) {
			orb.setAttribute('order', i);
			orb.setAttribute('style', `--data-order: ${i}`);
			orbsOrder[i].el = orb;
			break;
		}
	}

	repositionOrbsInContainer();
}

function removeOrb(orb) {
	const order = orb.getAttribute('order');

	if (orbsOrder[order] == orb) {
		orb.setAttribute('order', -1);
		orb.setAttribute('style', '--data-order: -1');
		orbsOrder[order].el = undefined;
		return shiftOrbs();
	} else {
		let orderFix = -1;
		for (let i = 1; i < maxOrbChoose + 1; i++) {
			if (orbsOrder[i].el == orb) {
				orderFix = i;
				break;
			}
		}

		if (orderFix != -1) {
			orb.setAttribute('order', -1);
			orb.setAttribute('style', '--data-order: -1');
			orbsOrder[orderFix].el = undefined;
			return shiftOrbs();
		}
	}
}

function shiftOrbs() {
	for (let i = 1; i < maxOrbChoose; i++) {
		if (!orbsOrder[i].el) {
			for (let j = i + 1; j <= maxOrbChoose; j++) {
				if (orbsOrder[j].el) {
					const orbToMove = orbsOrder[j].el;
					orbToMove.setAttribute('order', i);
					orbToMove.setAttribute('style', `--data-order: ${i}`);
					orbsOrder[i].el = orbToMove;

					orbsOrder[j].el = undefined;
					break;
				}
			}
		}
	}
	repositionOrbsInContainer();
}

function repositionOrbsInContainer() {
	const orderedOrbs = [];
	for (let i = 1; i <= maxOrbChoose; i++) {
		if (orbsOrder[i].el) {
			orderedOrbs.push(orbsOrder[i].el);
		}
	}

	while (orbContainer.firstChild) {
		orbContainer.removeChild(orbContainer.firstChild);
	}

	for (const orb of orderedOrbs) {
		orbContainer.appendChild(orb);
	}

	for (const orb of Object.values(orbs)) {
		if (orb.el.getAttribute('order') == -1) {
			orbContainer.appendChild(orb.el);
		}
	}

	updateOrbCode();
}

function updateOrbCode() {
	let newcode = '';
	for (let i = 1; i <= maxOrbChoose; i++) {
		const orb = orbsOrder[i].el;
		if (orb) newcode += `${orb.getAttribute('index')}_`;
		else newcode += '-1_';
	}
	newcode = newcode.slice(0, -1);
	orbCodeInput.value = newcode;
}

function OrbswitchLock() {
	orbLock = !orbLock;
	orbCodeButtonLock.innerHTML = orbLock ? 'Unlock' : 'Lock';
	orbCodeButtonUpdate.setAttribute('locked', orbLock);
	orbCodeButtonUpdate.disabled = orbLock;
}

function copyOrbCode() {
	if (navigator.clipboard && orbCodeInput) {
		navigator.clipboard
			.writeText(orbCodeInput.value)
			.then(() => {
				alert('Copied to clipboard!');
			})
			.catch((err) => {
				alert('Failed to copy.');
			});
	} else {
		alert('Clipboard API not supported.');
	}
}

function refreshOrbCode() {
	if (orbLock) {
		alert('Orbs are locked.');
		return;
	}

	let orbCode = null;

	let input = prompt('Paste the orb code:');
	if (input) orbCode = input;
	if (orbCode == null) return;

	if (!orbCode.match(/^(-?[0-9]+)_(-?[0-9]+)_(-?[0-9]+)_(-?[0-9]+)$/)) {
		alert(
			'Invalid orb code format. Please use the following format: "1_2_3_4" or "1_2_3_-1"',
		);
		return;
	}

	orbCode = orbCode.split('_');

	for (let i = 0; i < orbCode.length; i++) {
		const orbIndex = parseInt(orbCode[i]);

		if (orbIndex == -1) {
			let nextOrbIndex = orbCode[i + 1];
			if (!nextOrbIndex) continue;
			nextOrbIndex = parseInt(nextOrbIndex);
			if (nextOrbIndex == -1) continue;
			else {
				alert(
					`The orb index -1 is not allowed if one of the next orb index is not -1.`,
				);
				return;
			}
		}

		if (orbIndex < 0 || orbIndex > orbNumber) {
			alert(`Orb index ${orbIndex} is out of range.`);
			return;
		}
		if (orbCode.indexOf(orbCode[i], i + 1) !== -1) {
			alert(`Orb index ${orbCode[i]} is not unique.`);
			return;
		}
	}

	for (let i = 1; i <= maxOrbChoose; i++) {
		const orb = orbsOrder[i].el;
		if (orb) {
			orb.setAttribute('order', -1);
			orb.setAttribute('style', '--data-order: -1');
		}
		orbsOrder[i].el = undefined;
	}

	for (let i = 0; i < orbCode.length; i++) {
		const orbIndex = parseInt(orbCode[i]);
		if (orbIndex < 0) {
			orbsOrder[i + 1].el = undefined;
		} else {
			const fl = orbs[orbIndex];
			if (fl) {
				fl.el.setAttribute('order', i + 1);
				fl.el.setAttribute('style', `--data-order: ${i + 1}`);
				orbsOrder[i + 1].el = fl.el;
			}
		}
	}
	repositionOrbsInContainer();
}

document.addEventListener('DOMContentLoaded', () => {
	if (initOrbs()) {
		orbCodeButtonLock.addEventListener('click', OrbswitchLock);
		orbCodeButtonCopy.addEventListener('click', copyOrbCode);
		orbCodeButtonUpdate.addEventListener('click', refreshOrbCode);

		createOrbs();
	}
});
