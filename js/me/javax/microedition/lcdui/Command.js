js2me.createClass({
	$SCREENI: 1,
	$BACKI: 2,
	$CANCELI: 3,
	$OKI: 4,
	$HELPI: 5,
	$STOPI: 6,
	$EXITI: 7,
	$ITEMI: 8,
	_init$Ljava_lang_String_II$V: function (label, commandType, priority) {
		this.label = label;
		this.commandType = commandType;
		this.priority = priority;
	},
	$getPriority$$I: function () {
		return this.priority;
	}
});

