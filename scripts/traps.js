let trapTemplate;
let trapContainer;
let trapNumber = 4;
let maxTrapChoose = 4;
let trapImgPath = './public/traps/';

let traps = {};
let trapsOrder = {};

let trapCode = '';
let trapCodeInput;
let trapCodeButtonLock;
let trapCodeButtonCopy;
let trapCodeButtonUpdate;
let trapLock = false;

function initTraps() {
	trapTemplate = document.querySelector('#case-template[type="trap"]');
	if (!trapTemplate) return false;
	const checkSymbol = trapTemplate.querySelector('.symbol');
	if (!checkSymbol) return false;
	const checkOrder = trapTemplate.querySelector('.order');
	if (!checkOrder) return false;

	trapContainer = document.getElementById('traps');
	if (!trapContainer) return false;

	trapCodeInput = document.getElementById('trap-code-input');
	if (!trapCodeInput) return false;
	trapCodeInput.setAttribute('locked', true);
	trapCodeInput.setAttribute('readonly', true);
	trapCodeInput.disabled = true;

	trapCodeButtonLock = document.getElementById('trap-lock');
	if (!trapCodeButtonLock) return false;

	trapCodeButtonCopy = document.getElementById('trap-copy');
	if (!trapCodeButtonCopy) return false;

	trapCodeButtonUpdate = document.getElementById('trap-update');
	if (!trapCodeButtonUpdate) return false;

	return true;
}

function createTraps() {
	for (let i = 1; i < maxTrapChoose + 1; i++) {
		trapsOrder[i] = {
			el: undefined,
		};
	}

	for (let i = 1; i < trapNumber + 1; i++) {
		let trap = trapTemplate.cloneNode(true);
		trap.setAttribute('type', 'trap');
		trap.setAttribute('order', -1);
		trap.setAttribute('style', '--data-order: -1');
		trap.setAttribute('id', `trap-${i}`);
		trap.setAttribute('index', i);

		const symbol = trap.querySelector('.symbol');
		const imgs = symbol.querySelectorAll('img');
		for (let j = 0; j < imgs.length; j++) {
			imgs[j].setAttribute('src', `${trapImgPath}${i}.png`);
		}
		trapContainer.appendChild(trap);
		traps[i] = {
			el: trap,
		};

		trap.addEventListener('click', (event) => clickTrap(event.target));
	}
}

function clickTrap(trap) {
	if (trapLock) {
		alert('Traps are locked.');
		return;
	}
	const order = trap.getAttribute('order');

	if (order == -1) {
		return placeTrap(trap);
	}

	return removeTrap(trap);
}

function placeTrap(trap) {
	for (let i = 1; i <= maxTrapChoose; i++) {
		if (trapsOrder[i].el === trap) {
			return removeTrap(trap);
		}
	}

	const selectedCount = Object.values(trapsOrder).filter(
		(entry) => entry.el !== undefined,
	).length;

	if (selectedCount >= maxTrapChoose) {
		const lastTrapIndex = maxTrapChoose;
		const lastTrap = trapsOrder[lastTrapIndex].el;

		if (lastTrap) {
			lastTrap.setAttribute('order', -1);
			lastTrap.setAttribute('style', '--data-order: -1');
		}

		trap.setAttribute('order', lastTrapIndex);
		trap.setAttribute('style', `--data-order: ${lastTrapIndex}`);
		trapsOrder[lastTrapIndex].el = trap;

		repositionTrapsInContainer();
		return;
	}

	for (let i = 1; i <= maxTrapChoose; i++) {
		if (trapsOrder[i].el === undefined) {
			trap.setAttribute('order', i);
			trap.setAttribute('style', `--data-order: ${i}`);
			trapsOrder[i].el = trap;
			break;
		}
	}

	repositionTrapsInContainer();
}

function removeTrap(trap) {
	const order = trap.getAttribute('order');

	if (trapsOrder[order] == trap) {
		trap.setAttribute('order', -1);
		trap.setAttribute('style', '--data-order: -1');
		trapsOrder[order].el = undefined;
		return shiftTraps();
	} else {
		let orderFix = -1;
		for (let i = 1; i < maxTrapChoose + 1; i++) {
			if (trapsOrder[i].el == trap) {
				orderFix = i;
				break;
			}
		}

		if (orderFix != -1) {
			trap.setAttribute('order', -1);
			trap.setAttribute('style', '--data-order: -1');
			trapsOrder[orderFix].el = undefined;
			return shiftTraps();
		}
	}
}

function shiftTraps() {
	for (let i = 1; i < maxTrapChoose; i++) {
		if (!trapsOrder[i].el) {
			for (let j = i + 1; j <= maxTrapChoose; j++) {
				if (trapsOrder[j].el) {
					const trapToMove = trapsOrder[j].el;
					trapToMove.setAttribute('order', i);
					trapToMove.setAttribute('style', `--data-order: ${i}`);
					trapsOrder[i].el = trapToMove;

					trapsOrder[j].el = undefined;
					break;
				}
			}
		}
	}
	repositionTrapsInContainer();
}

function repositionTrapsInContainer() {
	const orderedTraps = [];
	for (let i = 1; i <= maxTrapChoose; i++) {
		if (trapsOrder[i].el) {
			orderedTraps.push(trapsOrder[i].el);
		}
	}

	while (trapContainer.firstChild) {
		trapContainer.removeChild(trapContainer.firstChild);
	}

	for (const trap of orderedTraps) {
		trapContainer.appendChild(trap);
	}

	for (const trap of Object.values(traps)) {
		if (trap.el.getAttribute('order') == -1) {
			trapContainer.appendChild(trap.el);
		}
	}

	updateTrapCode();
}

function updateTrapCode() {
	let newcode = '';
	for (let i = 1; i <= maxTrapChoose; i++) {
		const trap = trapsOrder[i].el;
		if (trap) newcode += `${trap.getAttribute('index')}_`;
		else newcode += '-1_';
	}
	newcode = newcode.slice(0, -1);
	trapCodeInput.value = newcode;
}

function TrapswitchLock() {
	trapLock = !trapLock;
	trapCodeButtonLock.innerHTML = trapLock ? 'Unlock' : 'Lock';
	trapCodeButtonUpdate.setAttribute('locked', trapLock);
	trapCodeButtonUpdate.disabled = trapLock;
}

function copyTrapCode() {
	if (navigator.clipboard && trapCodeInput) {
		navigator.clipboard
			.writeText(trapCodeInput.value)
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
function refreshTrapCode() {
	if (trapLock) {
		alert('Traps are locked.');
		return;
	}

	let trapCode = null;

	let input = prompt('Paste the trap code:');
	if (input) trapCode = input;

	if (trapCode == null) return;

	if (!trapCode.match(/^(-?[0-9]+)_(-?[0-9]+)_(-?[0-9]+)_(-?[0-9]+)$/)) {
		alert(
			'Invalid trap code format. Please use the following format: "1_2_3_4" or "1_2_3_-1"',
		);
		return;
	}

	trapCode = trapCode.split('_');

	for (let i = 0; i < trapCode.length; i++) {
		const trapIndex = parseInt(trapCode[i]);

		if (trapIndex == -1) {
			let nextTrapIndex = trapCode[i + 1];
			if (!nextTrapIndex) continue;
			nextTrapIndex = parseInt(nextTrapIndex);
			if (nextTrapIndex == -1) continue;
			else {
				alert(
					`The trap index -1 is not allowed if one of the next trap index is not -1.`,
				);
				return;
			}
		}

		if (trapIndex < 0 || trapIndex > trapNumber) {
			alert(`Trap index ${trapIndex} is out of range.`);
			return;
		}
		if (trapCode.indexOf(trapCode[i], i + 1) !== -1) {
			alert(`Trap index ${trapCode[i]} is not unique.`);
			return;
		}
	}

	for (let i = 1; i <= maxTrapChoose; i++) {
		const trap = trapsOrder[i].el;
		if (trap) {
			trap.setAttribute('order', -1);
			trap.setAttribute('style', '--data-order: -1');
		}
		trapsOrder[i].el = undefined;
	}

	for (let i = 0; i < trapCode.length; i++) {
		const trapIndex = parseInt(trapCode[i]);
		if (trapIndex < 0) {
			trapsOrder[i + 1].el = undefined;
		} else {
			const fl = traps[trapIndex];
			if (fl) {
				fl.el.setAttribute('order', i + 1);
				fl.el.setAttribute('style', `--data-order: ${i + 1}`);
				trapsOrder[i + 1].el = fl.el;
			}
		}
	}
	repositionTrapsInContainer();
}

document.addEventListener('DOMContentLoaded', () => {
	if (initTraps()) {
		trapCodeButtonLock.addEventListener('click', TrapswitchLock);
		trapCodeButtonCopy.addEventListener('click', copyTrapCode);
		trapCodeButtonUpdate.addEventListener('click', refreshTrapCode);

		createTraps();
	}
});
