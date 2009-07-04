try {
	console.log("Debug mode: On");
	window.DEBUG = true;
}
catch(e) {
	window.DEBUG = false;
}

Event.addBehavior({
		'div#prereqs input:change, div#prereqs input:keyup' : function(e) {
			if(verifyNumericInput(this)) {
				var allValid = true;
				$$('div#prereqs input').each(function(e) {
					if(!verifyNumericInput(e)) {
						allValid = false;	
					}
				});

				if(allValid) {
					populateSplits($('people_count').value);
					ourShow($('splits'));
				}
			}
			else {
				ourHide($('splits'));
				this.focus();
				this.select();
				warning("Please use only numbers.");
			}
		},
});

function populateSplits(nPeople) {
	$$('div#splits div#dynamic')[0].update('');
	template = '';
	template += '<p id="person_%%N%%">';
	template += 'Part %%N1%%: ';
	template += '<input id="person_%%N%%_input" type="text" size="4" value="' + (parseInt($('total_rent').value) / nPeople).toFixed(2) + '" readonly>';
	template += '  Manual: <input type="checkbox" id="person_%%N%%_edit">';
	template += '</p>';

	for(i = 0; i < nPeople; i++) {
		curTemplate = template;
		curTemplate = curTemplate.replace(/%%N1%%/g, (i + 1));
		curTemplate = curTemplate.replace(/%%N%%/g, i);
		$('dynamic').insert({bottom: curTemplate});

	}

	$('total_payment').update(parseInt($F('total_rent')) + ".00");
	
	Event.addBehavior({
		'div#dynamic input[type="text"]:change, div#dynamic input[type="text"]:keyup': function(e) {
			var baseId = this.up().id;

			if(!verifyNumericInput(this)) {
				this.focus();
				this.select();
			}
			else {
				updateTotals();
			}
		},
		
		'div#dynamic input[type="checkbox"]:change': function(e) {
			var baseId = this.up().id;
			var textElem = $$('#' + baseId + ' *[type="text"]')[0];

			if(this.checked) {
				textElem.readOnly = false;
				$(baseId).addClassName('selected');
			}
			else {
				textElem.readOnly = true;
				$(baseId).removeClassName('selected');
			}

			updateTotals();
		}

	});
}

function ourHide(element) {
	element.hide();
}

function ourShow(element) {
	element.show();
}

function ourToggle(element) {
	element.toggle();
}

function warning(warningText) {
	if(window.DEBUG) {
		console.log("Warning:", warningText);
	}
}

function verifyNumericInput(elem) {
	return elem.value.match(/^\d+(\.\d{0,2}){0,1}$/);
}

function updateTotals() {
	var totalStatic = parseFloat($F('total_rent'));
	var total = parseFloat($F('total_rent'));
	var remaining = $$('div#dynamic input[type="checkbox"]').select(function(e) { return !e.checked; }).size();

	$$('div#dynamic input[type="checkbox"]').select(function(e) { return e.checked; }).each(function(e) {
		total -= parseFloat(e.up().down('input[type="text"]').value);
	});

	if(total < 0) {
		total = 0;
	}

	$$('div#dynamic input[type="checkbox"]').select(function(e) { return !e.checked; }).each(function(e) {
		e.up().down('input[type="text"]').value = (total / remaining).toFixed(2);
	});

	var computedTotal = $$('div#dynamic input[type="text"]').inject(0, function(acc, e) { return acc + parseFloat(e.value); }).toFixed(2);

	$('total_payment').update(computedTotal);

	$('total_payment_container').removeClassName('wrong');
	if(computedTotal != totalStatic.toFixed(2)) {
		$('total_payment_container').addClassName('wrong');
		$('total_payment').insert('  (Expected: $' + totalStatic + ')');
	}
}
