$(function() {

var fn = {};

fn.Token = {
	Operator : "opr",
	Identifier : "ide",
	Number : "num",
	BlankSpace : "bln"
}

fn.Lexer = function () {

	var exp = '',
		length = 0,
		index = 0,
		holder = 0,
		t = fn.Token;

	function newExp(expression) {
		exp = expression;
		index = 0;
		length = expression.length;
	}

	function next () {
		var token;

		if (index >= length) {
			return undefined;
		}

		token = scan();

		return token;
	}

	function createToken(type, value) {
		return {
			type : type,
			value : value
		}
	}


	/*
	* TODO - scan for each operator, create a tokenizer.
	*
	* \x00 == null
	*/
	function scan() {
		var idx = index, ch = "\x00";

		ch = getNextChar();

		if (isNumeric(ch)) {
			return createToken(t.Number, ch);
		}else if (isOperator(ch)) {
			return createToken(t.Operator, ch);
		}else if (isIdentifier(ch)){
			return createToken(t.Identifier, ch)
		}else if (isBlankSpace(ch)){
			return createToken(t.BlankSpace, ch);
		}

	}

	function getNextChar() {
		var idx = index, ch = "\x00";

		if (idx < length) {
			ch = exp.charAt(idx);
			index += 1;
		}
		return ch;
	}

	function isNumeric(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function isOperator (ch) {
		if (typeof ch === 'number') {
			return false;
		}else {
			return ch.match(/[()=+\-*/.]/);
		}
	}

	function isIdentifier (ch) {
		if (typeof ch === 'number') {
			return false;
		}else {
			return ch.match(/^[a-z0-9]+$/i);
		}
	}

	function isBlankSpace(ch){
			if (typeof ch === 'number') {
				return false;
			}else if (ch.match(/^[a-z0-9]+$/i)){
				return false;
			}else if ((ch.match(/[()=+\-*/.]/))){
				return false;
			}else{
				return ' ';

			}
		}

	return {
		newExp  : newExp,
		next : next
	}

}

fn.Editor = function (editor) {
	var input, editor, cursor, lexer, blinkTimer, focused = false, message;

	editor = editor;

	function updateCursor () {
		var start, end, x, y, i, el, cls;

		if (typeof cursor === 'undefined') {
            return;
        }

        if (cursor.getAttribute('id') !== 'cursor') {
            return;
        }

		start = input.selectionStart;
		end = input.selectionEnd;
        if (start > end) {
            end = input.selectionStart;
            start = input.selectionEnd;
        }

        if (editor.childNodes.length <= start) {
            return;
        }

		el = editor.childNodes[start];

		if (el) {
            x = el.offsetLeft;
            y = el.offsetTop;
            cursor.style.left = x + 'px';
            cursor.style.top = y + 'px';
            cursor.style.opacity = 1;
        }

        cursor.style.opacity = (start === end) ? 1 : 0;
        for (i = 0; i < editor.childNodes.length; i += 1) {
            el = editor.childNodes[i];
            cls = el.getAttribute('class');
            if (cls !== null) {
                cls = cls.replace(' selected', '');
                if (i >= start && i < end) {
                    cls += ' selected';
                }
                el.setAttribute('class', cls);
            }
        }
	}

	function blinkCursor() {
        var visible = true;
        if (blinkTimer) {
            window.clearInterval(blinkTimer);
        }
        blinkTimer = window.setInterval(function () {
            cursor.style.visibility = visible ? '' : 'hidden';
            visible = !visible;
        }, 423);
    }

	function updateEditor() {
		var expression = '', tokens, token, html = [], string = '';

		if(typeof lexer === "undefined"){
			lexer = new fn.Lexer();
		}

		tokens = [];


		try {
			expression = input.value;
			lexer.newExp(expression);

			while(true){
				token = lexer.next();

				if (typeof token === 'undefined') {
	            	break;
	            }
	            tokens.push(token);
			}

			for(var i = 0; i < tokens.length; i += 1) {
				string = '<span class="';
				string += tokens[i].type + '">';
				string += tokens[i].value;
				string += '</span>';
				html.push(string);
			}

		}finally {
			html.push('<span class="cursor" id="cursor">\u00A0</span>');
			var a = html.join("");
			if (a !== editor.innerHTML) {
                editor.innerHTML = a;
                cursor = document.getElementById('cursor');
                if(focused){
                	blinkCursor();
            	}else {
            		cursor.style.visibility = 'hidden';
            	}
                updateCursor();
            }
		}
	}

	function focus () {
        window.setTimeout(function () {
            input.focus();
            blinkCursor();
            updateCursor();
            focused = true;
        }, 0);
    }

    function deselect() {
    	var el, cls;
        input.selectionEnd = input.selectionStart;
        el = editor.firstChild;
        while (el) {
            cls = el.getAttribute('class');
            if (cls && cls.match('selected')) {
                cls = cls.replace('selected', '');
                el.setAttribute('class', cls);
            }
            el = el.nextSibling;
        }
    }

	function setup () {
		var container, wrapper;

		message = document.getElementById('message');

		input = document.createElement('textarea');
        input.style.position = 'absolute';
        input.style.width = '100px';
        input.style.position = 'absolute';

        container = document.createElement('div');
        container.appendChild(input);
        container.style.overflow = 'hidden';
        container.style.width = '1px';
        container.style.height = '0px';
        container.style.position = 'relative';

        wrapper = document.createElement('div');
        wrapper.appendChild(container);
        document.body.appendChild(wrapper);

        // create a on mousedown listener
    	editor.addEventListener('mousedown', function (e) {
    		var x, y, i, el, x1, y1, x2, y2, anchor;

    		if(message != null && message.innerHTML != ""){
    			message.innerHTML = "";
    			message = null;
    		}

    		deselect();

    		x = e.clientX;
	        y = e.clientY;
	        for (i = 0; i < editor.childNodes.length; i += 1) {
	            el = editor.childNodes[i];
	            x1 = el.offsetLeft;
	            x2 = x1 + el.offsetWidth;
	            y1 = el.offsetTop;
	            y2 = y1 + el.offsetHeight;
	            if (x1 <= x && x < x2 && y1 <= y && y < y2) {
	                input.selectionStart = i;
	                input.selectionEnd = i;
	                anchor = i;
	                blinkCursor();
	                break;
	            }
	        }

	        focus();
	        updateEditor();
    	});

    	input.addEventListener('keyup', function (e) {
    		updateEditor();
    	});
    }

	setup();
}

fn.Editor(document.getElementById('Editor'));

});
