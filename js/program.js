js2me.generateProgram = function (stream, constantPool) {
	var generators = [];
	
	
	function generateArrayLoad() {
		return function(context) {
			var index = context.stack.pop();
			var array = context.stack.pop();
			if (array == null) {
				throw new javaRoot.$java.$lang.$NullPointerException();
			}
			if (index < 0 || index >= array.length) {
				throw new javaRoot.$java.$lang.$ArrayIndexOutOfBoundsException();
			}
			context.stack.push(array[index]);
		};
	}
	function generateArrayStore() {
		return function(context) {
			var value = context.stack.pop();
			var index = context.stack.pop();
			var array = context.stack.pop();
			if (array == null) {
				throw new javaRoot.$java.$lang.$NullPointerException();
			}
			if (index < 0 || index >= array.length) {
				throw new javaRoot.$java.$lang.$ArrayIndexOutOfBoundsException();
			}
			array[index] = value;
		};
	}
	// aaload
	generators[0x32] = function (context) {
		return generateArrayLoad();
	}
	// aastore
	generators[0x53] = function () {
		return generateArrayStore();
	}
	// aconst_null
	generators[0x01] = function (context) {
		context.stack.push(null);
	}
	function generateLoad(index) {
		return new Function('context', 'context.stack.push(context.locals[' + index + ']);');
	}
	// aload
	generators[0x19] = function () {
		var index = stream.readUint8();
		return generateLoad(index);
	}
	// aload_0
	generators[0x2a] = function () {
		return generateLoad(0);
	}
	// aload_1
	generators[0x2b] = function () {
		return generateLoad(1);
	}
	// aload_2
	generators[0x2c] = function () {
		return generateLoad(2);
	}
	// aload_3
	generators[0x2d] = function () {
		return generateLoad(3);
	};
	// anewarray
	generators[0xbd] = function () {
		var type = constantPool[stream.readUint16()];
		return function (context) {
			var length = context.stack.pop();
			if (length < 0) {
				throw new javaRoot.$java.$lang.$NegativeArraySizeException();
			}
			var array = new Array(length);
			array.className = type.className;
			context.stack.push(array);
		}
	};
	// areturn
	generators[0xb0] = function (context) {
		context.result = context.stack.pop();
		context.finish = true;
	};
	// arraylength
	generators[0xbe] = function (context) {
		var array = context.stack.pop();
		if (array == null) {
			throw new javaRoot.$java.$lang.$NullPointerException();
		}
		context.stack.push(array.length);
	};
	// astore
	generators[0x3a] = function () {
		var index = stream.readUint8();
		return generateStore(index);
	};
	// astore_0
	generators[0x4b] = function () {
		return generateStore(0);
	};
	// astore_1
	generators[0x4c] = function () {
		return generateStore(1);
	};
	// astore_2
	generators[0x4d] = function () {
		return generateStore(2);
	};
	// astore_3
	generators[0x4e] = function () {
		return generateStore(3);
	};
	// athrow
	generators[0xbf] = function (context) {
		throw context.stack.pop();
	};
	// baload
	generators[0x33] = function (context) {
		return generateArrayLoad();
	};
	// bastore
	generators[0x54] = function (context) {
		return generateArrayStore();
	};
	// bipush
	generators[0x10] = function () {
		var value = stream.readInt8();
		return new Function('context', 'context.stack.push(' + value + ');');
	};
	// caload
	generators[0x34] = function (context) {
		return generateArrayLoad();
	};
	// castore
	generators[0x55] = function (context) {
		return generateArrayStore();
	};
	// checkcast
	generators[0xc0] = function () {
		var type = constantPool[stream.readUint16()];
		return function (context) {
			var ref = context.stack.pop();
			if (ref != null) {
				if (ref.constructor == Array) {
					context.stack.push(ref);
					return;
				}
				var refClass = js2me.findClass(ref.className).prototype;
				var cmpClass = js2me.findClass(type.className).prototype;
				if (refClass.isImplement(cmpClass.className)) {
					context.stack.push(ref);
				} else {
					throw new javaRoot.$java.$lang.$ClassCastException();
				}
			} else {
				context.stack.push(ref);
			}
		}
	};
	// d2i
	generators[0x8e] = function (context) {
		var value = context.stack.pop();
		if (isNaN(value)) {
			context.stack.push(0);
			return;
		}
		if (value < -0x80000000) {
			context.stack.push(-0x80000000);
			return;
		}
		if (value > 0x7fffffff) {
			context.stack.push(0x7fffffff);
			return;
		}
		context.stack.push(value);
	};
	// d2l
	generators[0x8f] = function (context) {
		var value = context.stack.pop();
		if (isNaN(value)) {
			context.stack.push(new js2me.Long(0, 0));
			return;
		}
		if (value < -0x8000000000000000) {
			context.stack.push(new js2me.Long(0x80000000, 0));
			return;
		}
		if (value >= 0x8000000000000000) {
			context.stack.push(new js2me.Long(0x7fffffff, 0xffffffff));
			return;
		}
		if (value < 0) {
			value = Math.abs(value);
			var result = new js2me.Long(Math.floor(value / 0x100000000), Math.floor(value % 0x100000000));
			context.stack.push(result.neg());
		} else {
			value = Math.abs(value);
			var result = new js2me.Long(Math.floor(value / 0x100000000), Math.floor(value % 0x100000000));
			context.stack.push(result);
		}
	};
	// dadd
	generators[0x63] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(new js2me.Double(a.double + b.double));
	};
	// daload
	generators[0x31] = function (context) {
		return generateArrayLoad();
	};
	// dastore
	generators[0x52] = function (context) {
		return generateArrayStore();
	};
	function generateCompareFloats(isDouble, onNaN) {
		var body = 'var b = context.stack.pop()';
		if (isDouble) {
			body += '.double';
		}
		body += ';\n';
		body += 'var a = context.stack.pop()';
		if (isDouble) {
			body += '.double';
		}
		body += ';\n';
		body += 'if (isNaN(a) || isNaN(b)) {\n';
		body += '	context.stack.push(' + onNaN + ');\n';
		body += '}\n'
		body += 'if (a > b) {\n';
		body += '	context.stack.push(1);\n';
		body += '}\n';
		body += 'if (a === b) {\n';
		body += '	context.stack.push(0);\n';
		body += '}\n';
		body += 'if (a < b) {\n';
		body += '	context.stack.push(-1);\n';
		body += '}\n';
		return new Function('context', body);
	}
	// dcmpg
	generators[0x98] = function (context) {
		return generateCompareFloats(true, 1);
	};
	// dcmpl
	generators[0x97] = function (context) {
		return generateCompareFloats(true, -1);
	};
	// dconst_0
	generators[0x0e] = function () {
		return new Function('context', 'context.stack.push(new js2me.Double(0));');
	};
	// dconst_1
	generators[0x0f] = function () {
		return new Function('context', 'context.stack.push(new js2me.Double(1));');
	};
	// ddiv
	generators[0x6f] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(new js2me.Double(a.double / b.double));
	};
	// dload
	generators[0x18] = function () {
		var index = stream.readUint8();
		return generateLoad(index);
	}
	// dload_0
	generators[0x26] = function () {
		return generateLoad(0);
	}
	// dload_1
	generators[0x27] = function () {
		return generateLoad(1);
	}
	// dload_2
	generators[0x28] = function () {
		return generateLoad(2);
	}
	// dload_3
	generators[0x29] = function () {
		return generateLoad(3);
	};
	// dmul
	generators[0x6b] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(new js2me.Double(a.double * b.double));
	};
	// dneg
	generators[0x77] = function (context) {
		var value = context.stack.pop();
		context.stack.push(new js2me.Double(-value.double));
	};
	// drem
	generators[0x73] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(new js2me.Double(a.double % b.double));
	};
	// dreturn
	generators[0xaf] = function (context) {
		context.result = context.stack.pop();
		context.finish = true;
	};
	// dstore
	generators[0x39] = function () {
		var index = stream.readUint8();
		return generateStore(index);
	};
	// dstore_0
	generators[0x47] = function () {
		return generateStore(0);
	};
	// dstore_1
	generators[0x48] = function () {
		return generateStore(1);
	};
	// dstore_2
	generators[0x49] = function () {
		return generateStore(2);
	};
	// dstore_3
	generators[0x4a] = function () {
		return generateStore(3);
	};
	// dsub
	generators[0x67] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(new js2me.Double(a.double - b.double));
	};
	// dup
	generators[0x59] = function () {
		return function (context) {
			var tmp = context.stack.pop();
			context.stack.push(tmp);
			context.stack.push(tmp);
		};
	};
	// dup_x1
	generators[0x5a] = function (context) {
		var a = context.stack.pop();
		var b = context.stack.pop();
		context.stack.push(a);
		context.stack.push(b);
		context.stack.push(a);
	};
	// dup_x2
	generators[0x5b] = function (context) {
		var a = context.stack.pop();
		var b = context.stack.pop();
		if (a.constructor != js2me.Long && a.constructor != js2me.Double) {
			var c = context.stack.pop();
			context.stack.push(a);
			context.stack.push(c);
			context.stack.push(b);
			context.stack.push(a);
		} else {
			context.stack.push(a);
			context.stack.push(b);
			context.stack.push(a);
		}
	};
	// dup2
	generators[0x5c] = function (context) {
		var a = context.stack.pop();
		if (a.constructor != js2me.Long && a.constructor != js2me.Double) {
			var b = context.stack.pop();
			context.stack.push(b);
			context.stack.push(a);
			context.stack.push(b);
			context.stack.push(a);
		} else {
			context.stack.push(a);
			context.stack.push(a);
		}
	};
	// dup2_x1
	generators[0x5d] = function (context) {
		var a = context.stack.pop();
		var b = context.stack.pop();
		if (a.constructor != js2me.Long && a.constructor != js2me.Double) {
			var c = context.stack.pop();
			context.stack.push(b);
			context.stack.push(a);
			context.stack.push(c);
			context.stack.push(b);
			context.stack.push(a);
		} else {
			context.stack.push(a);
			context.stack.push(b);
			context.stack.push(a);
		}
	};
	// dup2_x2
	// who the hell came up with this op!?
	generators[0x5e] = function (context) {
		var a = context.stack.pop();
		var b = context.stack.pop();
		if (a.constructor != js2me.Long && a.constructor != js2me.Double) {
			if (b.constructor != js2me.Long && b.constructor != js2me.Double) {
				context.stack.push(a);
				context.stack.push(b);
				context.stack.push(a);
			} else {
				var c = context.stack.pop();
				context.stack.push(a);
				context.stack.push(c);
				context.stack.push(b);
				context.stack.push(a);
			}
		} else {
			var c = context.stack.pop();
			if (c.constructor != js2me.Long && c.constructor != js2me.Double) {
				context.stack.push(b);
				context.stack.push(a);
				context.stack.push(c);
				context.stack.push(b);
				context.stack.push(a);
			} else {
				var d = context.stack.pop();
				context.stack.push(b);
				context.stack.push(a);
				context.stack.push(d);
				context.stack.push(c);
				context.stack.push(b);
				context.stack.push(a);
			}
		}
	};
	// fadd
	generators[0x62] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a + b);
	};
	// faload
	generators[0x30] = function (context) {
		return generateArrayLoad();
	};
	// fastore
	generators[0x51] = function (context) {
		return generateArrayStore();
	};
	// fcmpg
	generators[0x96] = function (context) {
		return generateCompareFloats(false, 1);
	};
	// fcmpl
	generators[0x95] = function (context) {
		return generateCompareFloats(false, -1);
	};
	// fconst_0
	generators[0x0b] = function (context) {
		context.stack.push(0);
	};
	// fconst_1
	generators[0x0c] = function (context) {
		context.stack.push(1);
	};
	// fconst_2
	generators[0x0d] = function (context) {
		context.stack.push(2);
	};
	// fdiv
	generators[0x6e] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a / b);
	};
	// fload
	generators[0x17] = function () {
		var index = stream.readUint8();
		return generateLoad(index);
	}
	// fload_0
	generators[0x22] = function () {
		return generateLoad(0);
	}
	// fload_1
	generators[0x23] = function () {
		return generateLoad(1);
	}
	// fload_2
	generators[0x24] = function () {
		return generateLoad(2);
	}
	// fload_3
	generators[0x25] = function () {
		return generateLoad(3);
	};
	// fmul
	generators[0x6a] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a * b);
	};
	// fneg
	generators[0x76] = function (context) {
		var value = context.stack.pop();
		context.stack.push(-value);
	};
	// frem
	generators[0x72] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a % b);
	};
	// freturn
	generators[0xae] = function (context) {
		var value = context.stack.pop();
		context.result = value;
		context.finish = true;
	};
	// fstore
	generators[0x38] = function () {
		var index = stream.readUint8();
		return generateStore(index);
	};
	// fstore_0
	generators[0x43] = function () {
		return generateStore(0);
	};
	// fstore_1
	generators[0x44] = function () {
		return generateStore(1);
	};
	// fstore_2
	generators[0x45] = function () {
		return generateStore(2);
	};
	// fstore_3
	generators[0x46] = function () {
		return generateStore(3);
	};
	// fsub
	generators[0x66] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a - b);
	};
	// getfield
	generators[0xb4] = function () {
		var field = constantPool[stream.readUint16()];
		return function (context) {
			var obj = context.stack.pop();
			if (obj == null) {
				throw new javaRoot.$java.$lang.$NullPointerException();
			}
			context.stack.push(obj[field.name]);
		};
	};
	// getstatic
	generators[0xb2] = function () {
		var field = constantPool[stream.readUint16()];
		return function (context) {
			var obj = js2me.findClass(field.className);
			js2me.initializeClass(obj, function () {
				context.stack.push(obj.prototype[field.name]);
			});
		};
	};
	// goto
	generators[0xa7] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			context.position = positionMapping[index];
		};
	};
	// i2l
	generators[0x85] = function (context) {
		var value = context.stack.pop();
		if (value >= 0) {
			context.stack.push(new js2me.Long(0, value));
		} else {
			context.stack.push(new js2me.Long(0xffffffff, value + 4294967296));
		}
	};
	// i2f
	generators[0x86] = function (context) {
	};
	// i2d
	generators[0x87] = function (context) {
		var value = context.stack.pop();
		context.stack.push(new js2me.Double(value));
	};
	// f2i
	generators[0x8b] = function (context) {
		var value = context.stack.pop();
		context.stack.push(Math.floor(value));
	};
	// f2d
	generators[0x8d] = function (context) {
		var value = context.stack.pop();
		context.stack.push(new js2me.Double(value));
	};
	// i2b
	generators[0x91] = function (context) {
		var value = context.stack.pop();
		value = (value + 2147483648) % 256;
		if (value > 127) {
			context.stack.push(value - 256);
		} else {
			context.stack.push(value);
		}
	};
	// i2c
	generators[0x92] = function (context) {
		var value = context.stack.pop();
		context.stack.push(value);
	};
	// i2s
	generators[0x93] = function (context) {
		var value = context.stack.pop();
		value = (value + 2147483648) % 65536;
		if (value > 32767) {
			context.stack.push(value - 65536);
		} else {
			context.stack.push(value);
		}
	};
	// iadd
	generators[0x60] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(js2me.checkOverflow(a + b, 32));
	};
	// iand
	generators[0x7e] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a & b);
	};
	// iaload
	generators[0x2e] = function (context) {
		var index = context.stack.pop();
		var array = context.stack.pop();
		context.stack.push(array[index]);
	};
	// iastore
	generators[0x4f] = function (context) {
		var value = context.stack.pop();
		var index = context.stack.pop();
		var array = context.stack.pop();
		array[index] = value;
	};
	function generateConst(constant) {
		return new Function('context', 'context.stack.push(' + constant + ')');
	}
	// iconst_m1
	generators[0x02] = function () {
		return generateConst(-1);
	};
	// iconst_0
	generators[0x03] = function () {
		return generateConst(0);
	}
	// iconst_1
	generators[0x04] = function () {
		return generateConst(1);
	}
	// iconst_2
	generators[0x05] = function () {
		return generateConst(2);
	}
	// iconst_3
	generators[0x06] = function () {
		return generateConst(3);
	};
	// iconst_4
	generators[0x07] = function () {
		return generateConst(4);
	};
	// iconst_5
	generators[0x08] = function () {
		return generateConst(5);
	};
	// idiv
	generators[0x6c] = function () {
		return function (context) {
			var b = context.stack.pop();
			var a = context.stack.pop();
			context.stack.push(js2me.checkOverflow(Math.floor(a / b), 32));
		};
	};
	// if_acmpeq
	generators[0xa5] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var b = context.stack.pop();
			var a = context.stack.pop();
			if (a === b) {
				context.position = positionMapping[index];
			}
		};
	};
	// if_acmpne
	generators[0xa6] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var b = context.stack.pop();
			var a = context.stack.pop();
			if (a !== b) {
				context.position = positionMapping[index];
			}
		};
	};
	// if_icmpeq
	generators[0x9f] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var b = context.stack.pop();
			var a = context.stack.pop();
			if (a === b) {
				context.position = positionMapping[index];
			}
		};
	};
	
	// if_icmpne
	generators[0xa0] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var b = context.stack.pop();
			var a = context.stack.pop();
			if (a !== b) {
				context.position = positionMapping[index];
			}
		};
	};
	// if_icmplt
	generators[0xa1] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var b = context.stack.pop();
			var a = context.stack.pop();
			if (a < b) {
				context.position = positionMapping[index];
			}
		};
	};
	// if_icmpge
	generators[0xa2] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var b = context.stack.pop();
			var a = context.stack.pop();
			if (a >= b) {
				context.position = positionMapping[index];
			}
		};
	};
	// if_icmpgt
	generators[0xa3] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var b = context.stack.pop();
			var a = context.stack.pop();
			if (a > b) {
				context.position = positionMapping[index];
			}
		};
	};
	// if_icmple
	generators[0xa4] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var b = context.stack.pop();
			var a = context.stack.pop();
			if (a <= b) {
				context.position = positionMapping[index];
			}
		};
	};
	// ifeq
	generators[0x99] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var value = context.stack.pop();
			if (value === 0) {
				context.position = positionMapping[index];
			}
		};
	};
	// ifne
	generators[0x9a] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var value = context.stack.pop();
			if (value !== 0) {
				context.position = positionMapping[index];
			}
		};
	};
	// iflt
	generators[0x9b] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var value = context.stack.pop();
			if (value < 0) {
				context.position = positionMapping[index];
			}
		};
	};
	// ifge
	generators[0x9c] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var value = context.stack.pop();
			if (value >= 0) {
				context.position = positionMapping[index];
			}
		};
	};
	// ifgt
	generators[0x9d] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var value = context.stack.pop();
			if (value > 0) {
				context.position = positionMapping[index];
			}
		};
	};
	// ifle
	generators[0x9e] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var value = context.stack.pop();
			if (value <= 0) {
				context.position = positionMapping[index];
			}
		};
	};
	// ifnonnull
	generators[0xc7] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var value = context.stack.pop();
			if (value != null) {
				context.position = positionMapping[index];
			}
		};
	};
	// ifnull
	generators[0xc6] = function () {
		var index = stream.index + stream.readInt16() - 1;
		return function (context) {
			var value = context.stack.pop();
			if (value == null) {
				context.position = positionMapping[index];
			}
		};
	};
	// iinc
	generators[0x84] = function () {
		var index = stream.readUint8();
		var value = stream.readInt8();
		return new Function('context', 'context.locals[' + index + '] = js2me.checkOverflow(context.locals[' + index + '] + ' + value +', 32);');
	};
	// iload
	generators[0x15] = function () {
		var index = stream.readUint8();
		return generateLoad(index);
	};
	// iload_0
	generators[0x1a] = function () {
		return generateLoad(0);
	};
	// iload_1
	generators[0x1b] = function () {
		return generateLoad(1);
	}
	// iload_2
	generators[0x1c] = function () {
		return generateLoad(2);
	}
	// iload_3
	generators[0x1d] = function () {
		return generateLoad(3);
	}
	// imul
	generators[0x68] = function (context) {
		var a = context.stack.pop();
		var b = context.stack.pop();
		context.stack.push(js2me.checkOverflow(a * b, 32));
		
	}
	// ineg
	generators[0x74] = function (context) {
		var value = context.stack.pop();
		context.stack.push(js2me.checkOverflow(-value, 32));
	}
	// instanceof
	generators[0xc1] = function () {
		var type = constantPool[stream.readUint16()];
		return function (context) {
			var ref = context.stack.pop();
			
			if (ref != null) {
				if (ref.constructor == Array) {
					context.stack.push(ref);
					return;
				}
				var refClass = js2me.findClass(ref.className).prototype;
				var cmpClass = js2me.findClass(type.className).prototype;
				if (refClass.isImplement(cmpClass.className)) {
					context.stack.push(1);
				} else {
					context.stack.push(0);
				}
			} else {
				context.stack.push(0);
			}
		};
	}
	function generateInvoke(static, virtual, garbage) {
		var methodInfo = constantPool[stream.readUint16()];
		if (garbage) {
			stream.readUint16();
		}
		var argumentsCount = methodInfo.type.argumentsTypes.length;
		var body = 'var args = [];\n' +
		'for (var i = 0; i < ' + argumentsCount + '; i++) {\n' +
		'	args.push(context.stack.pop());\n' +
		'}\n' +
		'args.reverse();\n';
		if (static) {
			body += 'var obj = ' + methodInfo.className + ';\n';
		} else {
			body += 'var obj = context.stack.pop();\n' +
			'if (obj == null) {\n' +
			'	throw new javaRoot.$java.$lang.$NullPointerException();\n' +
			'}\n' +
			'if (obj.constructor == Array) {\n' +
			'	obj = new javaRoot.$java.$lang.$ArrayObject(obj);\n' +
			'}\n';
		}
		if (virtual) {
			body += 'var method = obj.' + methodInfo.name + ';\n';
		} else {
			body += 'var method = ' + methodInfo.className + '.prototype.' + methodInfo.name + ';\n';
		}
		body += 'if (!method) {\n' +
		'	throw new Error("Not implemented ' + methodInfo.className + '->' + methodInfo.name + '");\n' + 
		'}' +
		'context.saveResult = ' + (methodInfo.type.returnType != 'V') + ';\n' +
		'var result = method.apply(obj, args);\n' + 
		'if (context.saveResult && !js2me.suspendThread) {\n' +
		'	context.stack.push(result);\n' +
		'}\n';
		return new Function('context', body);
	}
	// invokeinterface
	generators[0xb9] = function () {
		return generateInvoke(false, true, true);
	};
	// invokespecial
	generators[0xb7] = function () {
		return generateInvoke(false, false);
	};
	// invokestatic
	generators[0xb8] = function () {
		return generateInvoke(true, false);
	};
	// invokevirtual
	generators[0xb6] = function () {
		return generateInvoke(false, true);
	};
	// ior
	generators[0x80] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a | b);
	};
	// irem
	generators[0x70] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a % b);
	};
	// ireturn
	generators[0xac] = function (context) {
		var value = context.stack.pop();
		context.result = value;
		context.finish = true;
	};
	// ishl
	generators[0x78] = function (context) {
		var shift = context.stack.pop() % 32;
		var value = context.stack.pop();
		context.stack.push(value << shift);
	};
	// ishr
	generators[0x7a] = function (context) {
		var shift = context.stack.pop() % 32;
		var value = context.stack.pop();
		context.stack.push(value >> shift);
	};
	function generateStore(index) {
		return new Function('context', 'context.locals[' + index + '] = context.stack.pop();');
	}
	// istore
	generators[0x36] = function () {
		var index = stream.readUint8();
		return generateStore(index);
	}
	// istore_0
	generators[0x3b] = function () {
		return generateStore(0);
	}
	// istore_1
	generators[0x3c] = function () {
		return generateStore(1);
	};
	// istore_2
	generators[0x3d] = function () {
		return generateStore(2);
	};
	// istore_3
	generators[0x3e] = function () {
		return generateStore(3);
	};
	// isub
	generators[0x64] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a - b);
	};
	// iushr
	generators[0x7c] = function (context) {
		var shift = context.stack.pop() % 32;
		var value = context.stack.pop();
		if (value >= 0) {
			context.stack.push(value >> shift);
		} else {
			context.stack.push((value >> shift) + (2 << ~shift));
		}
	};
	// ixor
	generators[0x82] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a ^ b);
	};
	// l2d
	generators[0x8a] = function (context) {
		var value = context.stack.pop();
		var double = value.hi;
		if (double >= 0x80000000) {
			double -= 0x100000000;
		}
		double *= 0x100000000;
		double += value.lo;
		context.stack.push(new js2me.Double(double));
	};
	// l2i
	generators[0x88] = function (context) {
		var value = context.stack.pop();
		var int = value.lo;
		if (int >= 0x80000000) {
			int -= 0x100000000;
		} 
		context.stack.push(int);
	};
	// land
	generators[0x61] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a.add(b));
	};
	// laload
	generators[0x2f] = function (context) {
		var index = context.stack.pop();
		var array = context.stack.pop();
		context.stack.push(array[index]);
	};
	// land
	generators[0x7f] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(new js2me.Long(a.hi & b.hi, a.lo & b.lo));
	};
	// lastore
	generators[0x50] = function (context) {
		var value = context.stack.pop();
		var index = context.stack.pop();
		var array = context.stack.pop();
		array[index] = value;
	};
	// lcmp
	generators[0x94] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a.cmp(b));
	};
	// lconst_0
	generators[0x09] = function (context) {
		context.stack.push(new js2me.Long(0, 0));
	};
	// lconst_1
	generators[0x0a] = function (context) {
		context.stack.push(new js2me.Long(0, 1));
	};
	// ldc
	generators[0x12] = function () {
		var value = constantPool[stream.readUint8()];
		return function (context) {
			context.stack.push(value);
		};
	};
	// ldc_w
	generators[0x13] = function () {
		var value = constantPool[stream.readUint16()];
		return function (context) {
			context.stack.push(value);
		};
	};
	// ldc2_w
	generators[0x14] = function () {
		var index = stream.readUint16();
		var value = constantPool[index];
		return function (context) {
			context.stack.push(value);
		};
	};
	// ldiv
	generators[0x6d] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a.div(b).div);
	};
	// lload
	generators[0x16] = function () {
		var index = stream.readUint8();
		return generateLoad(index);
	};
	// lload_0
	generators[0x1e] = function () {
		return generateLoad(0);
	};
	// lload_1
	generators[0x1f] = function () {
		return generateLoad(1);
	};
	// lload_2
	generators[0x20] = function () {
		return generateLoad(2);
	};
	// lload_3
	generators[0x21] = function () {
		return generateLoad(3);
	};
	// lmul
	generators[0x69] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a.mul(b));
	};
	// lneg
	generators[0x75] = function (context) {
		var a = context.stack.pop();
		context.stack.push(a.neg());
	};
	// lookupswitch
	generators[0xab] = function () {
		var start = stream.index - 1;
		while (stream.index % 4 != 0) {
			stream.readUint8();
		}
		var def = start + stream.readInt32();
		var count = stream.readInt32();
		var table = [];
		for (var i = 0; i < count; i++) {
			var match = stream.readInt32();
			var value = start + stream.readInt32();
			table[match] = value;
		}
		return function (context) {
			var offset = table[context.stack.pop()] || def;
			context.position = positionMapping[offset];
		};
	}
	// lor
	generators[0x81] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(new js2me.Long(a.hi | b.hi, a.lo | b.lo));
	};
	// lrem
	generators[0x71] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a.div(b).rem);
	};
	// lreturn
	generators[0xad] = function (context) {
		var value = context.stack.pop();
		context.result = value;
		context.finish = true;
	};
	// lshl
	generators[0x79] = function (context) {
		var shift = context.stack.pop() % 64;
		var value = context.stack.pop();
		context.stack.push(value.shl(shift));
	};
	// lshr
	generators[0x7b] = function (context) {
		var shift = context.stack.pop() % 64;
		var value = context.stack.pop();
		var sign = value.sign();
		if (sign) {
			value = value.neg();
		}
		var result = value.shr(shift);
		if (sign) {
			result = result.neg();
		}
		context.stack.push(result);
	};
	// lstore
	generators[0x37] = function () {
		var index = stream.readUint8();
		return generateStore(index);
	};
	// lstore_0
	generators[0x3f] = function (context) {
		context.locals[0] = context.stack.pop();
	};
	// lstore_1
	generators[0x40] = function (context) {
		context.locals[1] = context.stack.pop();
	};
	// lstore_2
	generators[0x41] = function (context) {
		context.locals[2] = context.stack.pop();
	};
	// lstore_3
	generators[0x42] = function (context) {
		context.locals[3] = context.stack.pop();
	};
	// lsub
	generators[0x65] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a.sub(b));
	};
	// lushr
	generators[0x7d] = function (context) {
		var shift = context.stack.pop() % 64;
		var value = context.stack.pop();
		var result = value.shr(shift);
		context.stack.push(result);
	};
	// monitoenter
	generators[0xc2] = function (context) {
		var obj = context.stack.pop();
		if (obj.monitorCount == null) {
			obj.monitorCount = [];
		}
		if (obj.monitorQueue == null) {
			obj.monitorQueue = [];
		}
		if (obj.monitorCount.length == 0 || obj.monitorCount[0] == js2me.currentThread) {
			obj.monitorCount.push(js2me.currentThread)
		} else {
			obj.monitorQueue.push(js2me.currentThread)
			js2me.suspendThread = true;
			context.finish = true;
			context.saveResult = false;
		}
	};
	// monitoexit
	generators[0xc3] = function (context) {
		var obj = context.stack.pop();
		if (obj.monitorCount == null) {
			obj.monitorCount = [];
		}
		if (obj.monitorQueue == null) {
			obj.monitorQueue = [];
		}
		obj.monitorCount.pop();
		if (obj.monitorCount.length == 0) {
			var threadId = obj.monitorQueue.pop();
			if (threadId != null) {
				setTimeout(function () {
					js2me.restoreThread(threadId);
				}, 1);
			}
		}
	};
	// multinewarray
	generators[0xc5] = function () {
		var type = constantPool[stream.readUint16()].className;
		var dimensions = stream.readUint8();
		return function (context) {
			var counts = [];
			for (var i = 0; i < dimensions; i++) {
				counts[i] = context.stack.pop();
			}
			counts.reverse();
			function setLength(element, depth) {
				if (depth + 1 == dimensions) {
					for (var i = 0; i < counts[depth]; i++) {
						if (type.indexOf('L') == -1) {
							if (type.indexOf('J') != -1) {
								element[i] = new js2me.Long(0, 0);
							} else if (type.indexOf('D') != -1) {
								element[i] = new js2me.Double(0, 0);
							} else {
								element[i] = 0;
							}
						} else {
							element[i] = null;
						}
							
					}
					return;
				}
				for (var i = 0; i < counts[depth]; i++) {
					element[i] = [];
					setLength(element[i], depth + 1);
				}
			}
			var array = [];
			setLength(array, 0);
			context.stack.push(array);
		};
	};
	// new
	generators[0xbb] = function () {
		var classInfo = constantPool[stream.readUint16()];
		require.push(classInfo.className);
		return function (context) {
			var constructor = js2me.findClass(classInfo.className);
			
			if (!constructor) {
				console.error('Not implemented: ' + classInfo.className);
			}
			js2me.initializeClass(constructor, function () {});
			var instance = new constructor();
			context.stack.push(instance);
		};
	};
	// newarray
	generators[0xbc] = function () {
		var type = stream.readUint8();
		return function (context) {
			var length = context.stack.pop();
			var array = new Array(length);
			for (var i = 0; i < length; i++) {
				if (type == 7) {
					array[i] = new js2me.Double(0);
				} else if (type == 11) {
					array[i] = new js2me.Long(0, 0);
				} else {
					array[i] = 0;
				}
			}
			context.stack.push(array);
		};
	}
	// noop
	generators[0x00] = function () {};
	// pop
	generators[0x57] = function () {
		return function(context) {
			context.stack.pop();
		};
	}
	// pop2
	generators[0x58] = function () {
		return function(context) {
			context.stack.pop();
			context.stack.pop();
		};
	}
	// putfield
	generators[0xb5] = function () {
		var field = constantPool[stream.readUint16()];
		return function(context) {
			var value = context.stack.pop();
			var obj = context.stack.pop();
			obj[field.name] = value;
		};
	}
	// putstatic
	generators[0xb3] = function () {
		var field = constantPool[stream.readUint16()];
		return function (context) {
			var value = context.stack.pop();
			var obj = js2me.findClass(field.className);
			js2me.initializeClass(obj, function () {});
			obj.prototype[field.name] = value;
		};
	}
	// return
	generators[0xb1] = function () {
		return function (context) {
			context.finish = true;
		};
	};
	// saload
	generators[0x35] = function (context) {
		var index = context.stack.pop();
		var array = context.stack.pop();
		if (array == null) {
			throw new javaRoot.$java.$lang.$NullPointerException();
		}
		if (index > array.length) {
			throw new javaRoot.$java.$lang.$ArrayIndexOutOfBoundsException();
		}
		context.stack.push(array[index]);
	}
	// sastore
	generators[0x56] = function (context) {
		var value = context.stack.pop();
		var index = context.stack.pop();
		var array = context.stack.pop();
		array[index] = value;
	}
	// sipush
	generators[0x11] = function () {
		var value = stream.readInt16();
		return new Function('context', 'context.stack.push(' + value + ');');
	}
	// swap
	generators[0x5f] = function (context) {
		var b = context.stack.pop();
		var a = context.stack.pop();
		context.stack.push(a);
		context.stack.push(b);
	}
	// tableswitch
	generators[0xaa] = function () {
		var start = stream.index - 1;
		while (stream.index % 4 != 0) {
			stream.readUint8();
		}
		var def = start + stream.readInt32();
		var low = stream.readInt32();
		var high = stream.readInt32();
		var count = high - low + 1;
		var table = [];
		for (var i = 0; i < count; i++) {
			table[low + i] = start + stream.readInt32();
		}
		return function (context) {
			var index = context.stack.pop();
			var offset = table[index] || def;
			context.position = positionMapping[offset];
		}
	}
	// wide
	generators[0xc4] = function (context) {
		var op = stream.readUint8();
		var index = stream.readUint16();
		if (op >= 21 && op <= 25) {
			return new Function('context', 'context.push(context.locals[' + index + ']);'); 
		}
		if (op >= 54 && op <= 58) {
			return new Function('context', 'context.locals[' + index + '] = context.pop();'); 
		}
		if (op == 0x84) {
			var value = stream.readInt16();
			return new Function('context', 'context.locals[' + index + '] += ' + value + ';'); 
		}
		throw new Error('wide: unkown op ' + index);
	}
	var program = [];
	var positionMapping = [];
	var require = [];
	while (!stream.isEnd()) {
		positionMapping[stream.index] = program.length;
		var op = stream.readUint8();
		js2me.usedByteCodes[op] = true;
		if (generators[op]) {
			var func = null;
			try {
				func = generators[op]();
			} catch (e) {
				var wannaBreakpoint = true;
			}
			if (func != null) {
				program.push(func);
			} else {
				program.push(generators[op]);
			}
		} else {
			throw new Error('Op ' + op.toString(16) + ' not supported');
		}
	}
	return {
		content: program,
		mapping: positionMapping,
		require: require
	};
};
