Lexer = ->
  expression = null
  length = 0

  newExp = (exp) ->
    expression = exp
    length = exp.length
    return

  return

Editor = (container) ->
  editor = null
  input = null
  focused = false

  focus = ->
    window.setTimeout(->
        input.focus();
        focused = true;
    ,0);

  update = ->
    expression = null

    lexer = new Lexer()

    expression = input.value
    lexer.newExp(expression)
    console.log('lexer.length')


  setup = ->
    editor = document.getElementById(container)
    editor.setAttribute("tabindex", "1");

    input = document.createElement('textarea')
    input.style.position = 'absolute';
    input.style.width = '100px';
    input.style.position = 'absolute';
    container = document.createElement('div');
    container.appendChild(input);
    #container.style.overflow = 'hidden';
    container.style.width = '1px';
    container.style.height = '0px';
    container.style.position = 'relative';
    wrapper = document.createElement('div');
    wrapper.appendChild(container);
    document.body.appendChild(wrapper);

    editor.addEventListener('mousedown', (e) ->
      focus()
    )

    input.addEventListener('keydown', ->
      update()
    )

  setup()

test = new Editor('Editor')
console.log(test)
