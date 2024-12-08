let flaskTemplate;
let flaskContainer;
let flaskNumber = 20;
let maxFlaskChoose = 6;
let flaskImgPath = './public/flasks/';

let flasks = {};
let flasksOrder = {};

let flaskCode = '';
let flaskCodeInput;
let flaskCodeButtonLock;
let flaskCodeButtonCopy;
let flaskCodeButtonUpdate;
let flaskLock = false;

function initFlasks() {
	flaskTemplate = document.querySelector('#case-template[type="flask"]');
	if (!flaskTemplate) return false;
	const checkSymbol = flaskTemplate.querySelector('.symbol');
	if (!checkSymbol) return false;
	const checkOrder = flaskTemplate.querySelector('.order');
	if (!checkOrder) return false;

	flaskContainer = document.getElementById('flasks');
	if (!flaskContainer) return false;

	flaskCodeInput = document.getElementById('flask-code-input');
	if (!flaskCodeInput) return false;
	flaskCodeInput.setAttribute('locked', true);
	flaskCodeInput.setAttribute('readonly', true);
	flaskCodeInput.disabled = true;

	flaskCodeButtonLock = document.getElementById('flask-lock');
	if (!flaskCodeButtonLock) return false;

	flaskCodeButtonCopy = document.getElementById('flask-copy');
	if (!flaskCodeButtonCopy) return false;

	flaskCodeButtonUpdate = document.getElementById('flask-update');
	if (!flaskCodeButtonUpdate) return false;

	return true;
}

function createFlasks() {
	for (let i = 1; i < maxFlaskChoose + 1; i++) {
		flasksOrder[i] = {
			el: undefined,
		};
	}

	for (let i = 1; i < flaskNumber + 1; i++) {
		let flask = flaskTemplate.cloneNode(true);
		flask.setAttribute('type', 'flask');
		flask.setAttribute('order', -1);
		flask.setAttribute('style', '--data-order: -1');
		flask.setAttribute('id', `flask-${i}`);
		flask.setAttribute('index', i);

		const symbol = flask.querySelector('.symbol');
		const imgs = symbol.querySelectorAll('img');
		for (let j = 0; j < imgs.length; j++) {
			imgs[j].setAttribute('src', `${flaskImgPath}${i}.png`);
		}
		flaskContainer.appendChild(flask);
		flasks[i] = {
			el: flask,
		};

		flask.addEventListener('click', (event) => clickFlask(event.target));
	}
}

function clickFlask(flask) {
	if (flaskLock) {
		alert('Flasks are locked.');
		return;
	}
	const order = flask.getAttribute('order');

	if (order == -1) {
		return placeFlask(flask);
	}

	return removeFlask(flask);
}

function placeFlask(flask) {
	for (let i = 1; i <= maxFlaskChoose; i++) {
		if (flasksOrder[i].el === flask) {
			return removeFlask(flask);
		}
	}

	const selectedCount = Object.values(flasksOrder).filter(
		(entry) => entry.el !== undefined,
	).length;

	if (selectedCount >= maxFlaskChoose) {
		const lastFlaskIndex = maxFlaskChoose;
		const lastFlask = flasksOrder[lastFlaskIndex].el;

		if (lastFlask) {
			lastFlask.setAttribute('order', -1);
			lastFlask.setAttribute('style', '--data-order: -1');
		}

		flask.setAttribute('order', lastFlaskIndex);
		flask.setAttribute('style', `--data-order: ${lastFlaskIndex}`);
		flasksOrder[lastFlaskIndex].el = flask;

		repositionFlasksInContainer();
		return;
	}

	for (let i = 1; i <= maxFlaskChoose; i++) {
		if (flasksOrder[i].el === undefined) {
			flask.setAttribute('order', i);
			flask.setAttribute('style', `--data-order: ${i}`);
			flasksOrder[i].el = flask;
			break;
		}
	}

	repositionFlasksInContainer();
}

function removeFlask(flask) {
	const order = flask.getAttribute('order');
	if (flasksOrder[order] == flask) {
		flask.setAttribute('order', -1);
		flask.setAttribute('style', '--data-order: -1');
		flasksOrder[order].el = undefined;
		return shiftFlasks();
	} else {
		let orderFix = -1;
		for (let i = 1; i < maxFlaskChoose + 1; i++) {
			if (flasksOrder[i].el == flask) {
				orderFix = i;
				break;
			}
		}

		if (orderFix != -1) {
			flask.setAttribute('order', -1);
			flask.setAttribute('style', '--data-order: -1');
			flasksOrder[orderFix].el = undefined;
			return shiftFlasks();
		}
	}
}

function shiftFlasks() {
	for (let i = 1; i < maxFlaskChoose; i++) {
		if (!flasksOrder[i].el) {
			for (let j = i + 1; j <= maxFlaskChoose; j++) {
				if (flasksOrder[j].el) {
					const flaskToMove = flasksOrder[j].el;
					flaskToMove.setAttribute('order', i);
					flaskToMove.setAttribute('style', `--data-order: ${i}`);
					flasksOrder[i].el = flaskToMove;
					flasksOrder[j].el = undefined;
					break;
				}
			}
		}
	}
	repositionFlasksInContainer();
}

function repositionFlasksInContainer() {
	const orderedFlasks = [];
	for (let i = 1; i <= maxFlaskChoose; i++) {
		if (flasksOrder[i].el) {
			orderedFlasks.push(flasksOrder[i].el);
		}
	}

	while (flaskContainer.firstChild) {
		flaskContainer.removeChild(flaskContainer.firstChild);
	}

	for (const flask of orderedFlasks) {
		flaskContainer.appendChild(flask);
	}

	for (const flask of Object.values(flasks)) {
		if (flask.el.getAttribute('order') == -1) {
			flaskContainer.appendChild(flask.el);
		}
	}

	updateFlaskCode();
}

function updateFlaskCode() {
	let newcode = '';
	/* for each flash order */
	for (let i = 1; i <= maxFlaskChoose; i++) {
		const flask = flasksOrder[i].el;
		if (flask) newcode += `${flask.getAttribute('index')}_`;
		else newcode += '-1_';
	}
	newcode = newcode.slice(0, -1);
	flaskCodeInput.value = newcode;
}

function FlaskswitchLock() {
	flaskLock = !flaskLock;
	flaskCodeButtonLock.innerHTML = flaskLock ? 'Unlock' : 'Lock';
	flaskCodeButtonUpdate.setAttribute('locked', flaskLock);
	flaskCodeButtonUpdate.disabled = flaskLock;
}

function copyFlaskCode() {
	if (navigator.clipboard && flaskCodeInput) {
		navigator.clipboard
			.writeText(flaskCodeInput.value)
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
function refreshFlaskCode() {
	if (flaskLock) {
		alert('Flasks are locked.');
		return;
	}

	let flaskCode = null;
	let input = prompt('Paste the flask code:');
	if (input) flaskCode = input;

	if (flaskCode == null) return;

	if (
		!flaskCode.match(
			/^(-?[0-9]+)_(-?[0-9]+)_(-?[0-9]+)_(-?[0-9]+)_(-?[0-9]+)_(-?[0-9]+)$/,
		)
	) {
		alert(
			'Invalid flask code format. Please use the following format: "1_2_3_4_5_6" or "1_2_3_-1_-1_-1"',
		);
		return;
	}

	flaskCode = flaskCode.split('_');

	for (let i = 0; i < flaskCode.length; i++) {
		const flaskIndex = parseInt(flaskCode[i]);

		if (flaskIndex == -1) {
			let nextFlaskIndex = flaskCode[i + 1];
			if (!nextFlaskIndex) continue;
			nextFlaskIndex = parseInt(nextFlaskIndex);
			if (nextFlaskIndex == -1) continue;
			else {
				alert(
					`The flask index -1 is not allowed if one of the next flask index is not -1.`,
				);
				return;
			}
		}

		if (flaskIndex < 0 || flaskIndex > flaskNumber) {
			alert(`Flask index ${flaskIndex} is out of range.`);
			return;
		}
		if (flaskCode.indexOf(flaskCode[i], i + 1) !== -1) {
			alert(`Flask index ${flaskCode[i]} is not unique.`);
			return;
		}
	}

	for (let i = 1; i <= maxFlaskChoose; i++) {
		const flask = flasksOrder[i].el;
		if (flask) {
			flask.setAttribute('order', -1);
			flask.setAttribute('style', '--data-order: -1');
		}
		flasksOrder[i].el = undefined;
	}

	for (let i = 0; i < flaskCode.length; i++) {
		const flaskIndex = parseInt(flaskCode[i]);
		if (flaskIndex < 0) {
			flasksOrder[i + 1].el = undefined;
		} else {
			const fl = flasks[flaskIndex];
			if (fl) {
				fl.el.setAttribute('order', i + 1);
				fl.el.setAttribute('style', `--data-order: ${i + 1}`);
				flasksOrder[i + 1].el = fl.el;
			}
		}
	}
	repositionFlasksInContainer();
}

document.addEventListener('DOMContentLoaded', () => {
	if (initFlasks()) {
		flaskCodeButtonLock.addEventListener('click', FlaskswitchLock);
		flaskCodeButtonCopy.addEventListener('click', copyFlaskCode);
		flaskCodeButtonUpdate.addEventListener('click', refreshFlaskCode);

		createFlasks();
	}
});
