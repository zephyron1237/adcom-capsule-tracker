const MAIN_CYCLE = MAIN_GAME_DATA.map(x => (x == "supreme")? "U" : x.charAt(0).toUpperCase()).join('');

const EVENT_CYCLE = EVENT_GAME_DATA.map(x => x.charAt(0).toUpperCase()).join('');

const CYCLES = {
	main: MAIN_CYCLE,
	event: EVENT_CYCLE
};

const CAPSULES = {
	main: [
		{ name: "Wood", symbol: "W" },
		{ name: "Stone", symbol: "S" },
		{ name: "Iron", symbol: "I" },
		{ name: "Epic", symbol: "E" },
		{ name: "Supreme", symbol: "U" }
	],
	event: [
		{ name: "Plastic", symbol: "P" },
		{ name: "Armored", symbol: "A" }
	]
}

var SYMBOL_TO_NAME = {
	1: 'Wild1',
	5: 'Wild5'
};
for (var mode in CAPSULES) {
	for (var capsule of CAPSULES[mode]) {
		SYMBOL_TO_NAME[capsule.symbol] = capsule.name;
	}
}

var currentMode = 'main';

main();



function main() {
	// Parse current URL, import data if needed.
	var splitUrl = window.location.href.split('?');
	if (splitUrl.length == 2) {
		var urlMode = 'main';
		var urlInput = '';
		var urlStart = -1;
		
		var arguments = splitUrl[1].split('&');
		for (var arg of arguments) {
			var keyValue = arg.split('=');
			if (keyValue.length != 2) continue;
			if (keyValue[0] == 'start') {
				urlStart = parseInt(keyValue[1]) - 1;
			} else if (keyValue[0] == 'input') {
				urlInput = keyValue[1];
			} else if (keyValue[0] == 'mode') {
				urlMode = keyValue[1];
			}
		}
		
		// When we change the URL, the page will reload and the mode will
		// be forgotten since it's not typically persisted.  We'll use this
		// 'tempStartupMode' key to persist this through the reload then be forgotten.
		switchMode(urlMode, false);
		localStorage.setItem("tempStartupMode", urlMode);
		
		setCurrentInput(urlInput);
		setStartOverride(urlStart);
		
		window.location.href = splitUrl[0];
	} else if (localStorage.getItem("tempStartupMode")) {
		switchMode(localStorage.getItem("tempStartupMode"), false);
		localStorage.removeItem("tempStartupMode");
	}	

	initializeSaveData();
	updateAfterInput();
}

function addCapsule(symbol) {
	setCurrentInput(getCurrentInput() + symbol);
	updateAfterInput();
}

function removeCapsule() {
	var currentInput = getCurrentInput();
	if (currentInput == '') {
		setStartOverride(-1);
	} else {
		setCurrentInput(currentInput.slice(0, -1));
	}
	updateAfterInput();
}

function updateAfterInput() {
	var currentInput = getCurrentInput();
	var startOverride = getStartOverride();
	
	var foundIndices = findIndicesOfInput();
	var nextIndices = new Set(foundIndices.map(x => x.nextIndex));
	
	// Update the "capsule history" list
	var table_html = "";
	var label_text = "&nbsp;";
	var path_index = 0;
	var cur_label_index = (nextIndices.size != 1) ? -1 : foundIndices[0].path[0];
	
	if (startOverride != -1) {		
		var symbol_class = SYMBOL_TO_NAME[getCycle(startOverride)];
		var override_label = startOverride + 1;
		table_html += "<a href='#' onclick='setStartOverride(-1)'><span class='startOverride label capsule " + symbol_class + "'>" + override_label + "</span></a>";
	}
	
	for (var symbol of currentInput) {
		var inputClass = SYMBOL_TO_NAME[symbol];
		if (nextIndices.size == 1) {
			inputClass += " path";
			if (symbol != '5') { // 5 means special 1-5 wildcard
				label_text = (cur_label_index + 1);
				cur_label_index = (cur_label_index + 1) % getCycleLength();
			} else {
				label_text = "&nbsp;";
				path_index++;
				cur_label_index = foundIndices[0].path[path_index];
			}			
		}
		table_html += "<span class='label capsule " + inputClass + "'>" + label_text + "</span>";
	}
	document.getElementById("currentCapsules").innerHTML = table_html || "&nbsp;";
	
	var exportUrl = "https://zephyron1237.github.io/adcom-capsule-tracker/?";
	exportUrl += 'mode=' + currentMode + '&';
	if (nextIndices.size == 1) {
		 exportUrl += "start=" + (foundIndices[0].lastIndex + 1);
	} else {
		if (startOverride != -1) {
			exportUrl += "start=" + (startOverride + 1) + "&";
		}
		exportUrl += "input=" + currentInput;
	}
	document.getElementById("exportUrl").value = exportUrl;

	// Update the Cycle table
	drawCycleTable();
	
	// Highlight Cycle table
	if (startOverride != -1) {
		document.getElementById(startOverride).classList.add('startOverride');
	}
	if (nextIndices.size == 1) {
		for (var index = foundIndices[0].startIndex; index != foundIndices[0].nextIndex; index = (index + 1) % getCycleLength()) {
			if (index == startOverride) continue;
			document.getElementById(index).classList.add('path');
		}		
	}

	// Determine results and display them
	if (currentInput.length == 0 && startOverride == -1) {
		document.getElementById("results").innerHTML = "<ul><li>Add capsules in <strong>History</strong> to see possibilities for the next capsule.</li><li>You can also choose a capsule in the <strong>Cycle</strong> to start your history.</li></ul>";
		return;
	}	

	var soonestCapsules = [];
	var symbolCounts = {};
	for (var capsule of getCapsules()) {
		symbolCounts[capsule.symbol] = 0;
	}

	for (var nextIndex of nextIndices) {
		document.getElementById(nextIndex).classList.add("possible-end");
		symbolCounts[getCycle(nextIndex)]++;
		
		// Find the minimum number of capsules after lastIndex before you open each type of capsule
		var capsuleDistance = {};
		var capsulesFound = 0;
		var searchIndex = nextIndex;
		while (capsulesFound < getCapsulesLength() &&
			(searchIndex % getCycleLength() != nextIndex || searchIndex == nextIndex)) {
			
			if (!(getCycle(searchIndex % getCycleLength()) in capsuleDistance)) {
				capsuleDistance[getCycle(searchIndex % getCycleLength())] =
					(searchIndex - nextIndex + getCycleLength() + 1) % getCycleLength() || getCycleLength();
				capsulesFound++;
			}
			searchIndex++;
		}
		
		soonestCapsules.push(capsuleDistance);
	}
	
	var resultsElement = document.getElementById("results");
	var results_html = "";
	if (nextIndices.size == 0) {
		results_html = "<strong>Invalid history</strong>. You can use the <strong>'minus' button</strong> to remove the most recent capsule.";
		resultsElement.classList.add('bg-warning');
	} else {
		resultsElement.classList.remove('bg-warning');
		if (nextIndices.size > 1) {
			results_html = "Total possibilities: " + nextIndices.size + "<br />";
		}
		// Calculate table cell values
		var tableElements = {};
		for (var capsule of getCapsules()) {
			var tableElement = {};
			var count = symbolCounts[capsule.symbol];
			var percent = Math.round(100 * count / foundIndices.length);
			var distances = soonestCapsules.map(distsPerSymbol => distsPerSymbol[capsule.symbol])
			var min = Math.min(...distances);
			var max = Math.max(...distances);
			var label = "&nbsp;";
			var capsuleClass = capsule.name;
			if (nextIndices.size == 1) {
				if (count > 0) {
					capsuleClass += " possible-end";
				}
				label = ((foundIndices[0].nextIndex + min - 1) % getCycleLength()) + 1;
			}
			tableElement.range_text = (min == max) ? min : min + "-" + max;
			tableElement.count_text = (count == 0) ? "&nbsp;" : count + " (" + percent + "%)";
			tableElement.image_html = "<span class='label capsule " + capsuleClass + "'>" + label + "</span>";
			tableElements[capsule.symbol] = tableElement;
		}

		// Construct the table
		results_html += "<table id='resultsTable'><tr><th>&nbsp;</th>";
		for (var capsule of getCapsules()) {
			results_html += "<td>" + tableElements[capsule.symbol].image_html + "</td>";
		}
		
		if (nextIndices.size > 1) {
			results_html += "</tr><tr><th>Next</th>";
			for (var capsule of getCapsules()) {
				results_html += "<td>" + tableElements[capsule.symbol].count_text + "</td>";
			}
		}
		
		results_html += "</tr><tr><th>Until</th>";
		for (var capsule of getCapsules()) {
			results_html += "<td>" + tableElements[capsule.symbol].range_text + "</td>";
		}
		results_html += "</tr></table>";
	}
	resultsElement.innerHTML = results_html;
}

function findIndicesOfInput() {
	var startOverride = getStartOverride();
	if (startOverride == -1) {
		return findIndicesOf(getCurrentInput(), 0, 0, getCycleLength() - 1);
	} else {
		var nextIndex = (startOverride + 1) % getCycleLength();
		return findIndicesOf(getCurrentInput(), 0, nextIndex, nextIndex);
	}
}

function findIndicesOf(currentInput, currentInputStart, currentCycleStart, currentCycleEnd) {	
	var result = []
	for (var startIndex = currentCycleStart; startIndex <= currentCycleEnd; startIndex++) {
		var validStartIndex = true;
		for (var inputIndex = currentInputStart; inputIndex < currentInput.length; inputIndex++) {
			if (currentInput[inputIndex] == '5') {
				// 1-5 wildcard, try each possibility
				for (var wildDelta = 1; wildDelta < 6; wildDelta++) {
					var nextIndex = (startIndex + inputIndex + wildDelta - currentInputStart) % getCycleLength();
					var nextResults = findIndicesOf(currentInput, inputIndex + 1, nextIndex, nextIndex);
					result = result.concat(nextResults.map(x => ({...x, startIndex: startIndex, path: [startIndex, ...x.path]})));
				}
				validStartIndex = false;
				break;
			} else if (currentInput[inputIndex] != '1' && currentInput[inputIndex] != getCycle((startIndex + inputIndex - currentInputStart) % getCycleLength())) {
				validStartIndex = false;
				break;
			}
		}
		
		if (validStartIndex) {
			result.push({
				startIndex: startIndex,
				lastIndex: (startIndex + currentInput.length - currentInputStart - 1) % getCycleLength(),
				nextIndex: (startIndex + currentInput.length - currentInputStart) % getCycleLength(),
				path: [startIndex]
			});
		}
	}

	return result;
}

function drawCycleTable() {
	var table_html = "";

	for (var index in getCycle()) {
		table_html += "<a href='#' onclick='switchStartOverride(" + index + ")'><span id='" + index + "' class='label capsule " + SYMBOL_TO_NAME[getCycle(index)] + "'>" + (parseInt(index) + 1) + "</span></a>";
	}

	document.getElementById("table").innerHTML = table_html;
}

function switchStartOverride(startOverride) {
	// TODO: Notify user that this is an (in)valid selection. Maybe a BG color animation?
	var currentInput = getCurrentInput();
	if (startOverride == -1 || currentInput == "") {
		setStartOverride(startOverride);
		updateAfterInput();
	} else {
		var indexAfterStart = (startOverride + 1) % getCycleLength();
		var foundIndices = findIndicesOf(currentInput, 0, indexAfterStart, indexAfterStart);
		if (foundIndices.length > 0) {
			setStartOverride(startOverride);
			updateAfterInput();
		}
	}
}

function toggleBlock(blockId) {
	var exportBlock = document.getElementById(blockId);
	if (exportBlock.style.display != 'block') {
		exportBlock.style.display = 'block'
	} else {
		exportBlock.style.display = 'none'
	}
}

function initializeSaveData() {
	migrateOldSaveData();
	
	if (getLocal('main', 'currentInput') == null) {
		setLocal('main', 'currentInput', '');
	}
	if (getLocal('main', 'startOverride') == null) {
		setLocal('main', 'startOverride', -1);
	}
	if (getLocal('event', 'currentInput') == null) {
		setLocal('event', 'currentInput', '');
	}
	if (getLocal('event', 'startOverride') == null) {
		setLocal('event', 'startOverride', -1);
	}
}

function migrateOldSaveData() {
	var mainInput = localStorage.getItem('currentInput');
	if (mainInput) {
		localStorage.removeItem('currentInput');
		setLocal('main', 'currentInput', mainInput);
	}
	
	var mainStartOverride = localStorage.getItem('startOverride');
	if (mainStartOverride) {
		localStorage.removeItem('startOverride');
		setLocal('main', 'startOverride', mainStartOverride);
	}
	
	var eventInput = localStorage.getItem('currentInputCrusade');
	if (eventInput) {
		localStorage.removeItem('currentInputCrusade');
		setLocal('event', 'currentInput', eventInput);
	}
	
	var eventStartOverride = localStorage.getItem('startOverrideCrusade');
	if (eventStartOverride) {
		localStorage.removeItem('startOverrideCrusade');
		setLocal('event', 'startOverride', eventStartOverride);
	}
}

function setLocal(mode, key, value) {
	localStorage.setItem(mode + "-" + key, value);
}

function getLocal(mode, key) {
	return localStorage.getItem(mode + "-" + key);
}

function getCurrentInput() {
	return getLocal(currentMode, 'currentInput');
}

function getStartOverride() {
	return parseInt(getLocal(currentMode, 'startOverride'));
}

function setCurrentInput(newInput) {
	return setLocal(currentMode, 'currentInput', newInput);
}

function setStartOverride(newStart) {
	return setLocal(currentMode, 'startOverride', newStart);
}

function getCycle(index = null) {
	if (index == null) {
		return CYCLES[currentMode];
	} else {
		return CYCLES[currentMode][index];
	}
}

function getCycleLength() {
	return CYCLES[currentMode].length;
}

function getCapsules() {
	return CAPSULES[currentMode];
}

function getCapsulesLength() {
	return CAPSULES[currentMode].length;
}

function switchMode(mode, shouldUpdate = true) {
	if (mode != currentMode) {
		currentMode = mode;
		
		// Update the highlights on the menubar buttons
		var buttons = {
			main: document.getElementById('mainButton'),
			event: document.getElementById('eventButton')
		};
		for (var button in buttons) {
			buttons[button].classList.remove('active');
		}
		buttons[mode].classList.add('active');
		
		// Update the input buttons
		document.getElementById('main-toolbar').style.display = (mode == 'main') ? 'inline-flex' : 'none';
		document.getElementById('event-toolbar').style.display = (mode == 'event') ? 'inline-flex' : 'none';
		
		if (shouldUpdate) {
			updateAfterInput();
		}
	}
}