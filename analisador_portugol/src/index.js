

import reservedWords from './languages/reservedWords.js';
import operators from './languages/operators.js';
import delimiters from './languages/delimiter.js';



function checkToken(current_token, trail) {
  let newCurrentToken = {}
  const char = current_token.toUpperCase()
  if (current_token != '') {
    switch (trail) {
      case "nada":
        break;

      case "comentario":
        newCurrentToken = insertTable(char, 'Comentário');
        break;

      case "letra":
        if (reservedWords.includes(char)) {
          newCurrentToken = insertTable(char, 'Palavra Reservada');
        } else if (char != "\n") {
          newCurrentToken = insertTable(char, 'Identificador');
        }
        break;

      case "operador":
        if (char == ':=')
          newCurrentToken = insertTable(char, 'Atribuição');
        else
          newCurrentToken = insertTable(char, 'Operador');
        break;

      case "constante":
        newCurrentToken = insertTable(char, 'Constante Numérica');
        break;

      case "literal":
        newCurrentToken = insertTable(char, 'Constante Literal');
        break;

      case "delimitador":
        if (char == ',')
          newCurrentToken = insertTable(char, 'Separador');
        else if (char == ';')
          newCurrentToken = insertTable(char, 'Terminador');
        else if (char == '(' || char == '{' || char == '[')
          newCurrentToken = insertTable(char, 'Delimitador - Abertura');
        else if (char == ')' || char == '}' || char == ']')
          newCurrentToken = insertTable(char, 'Delimitador - Fechamento');
        else
          newCurrentToken = insertTable(char, 'Delimitador');
        break;

    }
  }

  return { ...newCurrentToken, char: "" };
}

function insertTable(id, token_type) {
  var token = "";
  switch (token_type) {
    case 'Identificador':
    case 'Constante Numérica':
    case 'Constante Literal':
      token = `<${token_type}, ${id}>`;
      break;

    case 'Comentário':
      token = `< ${token_type} , ${id} >`;
      id = 'Comentário';
      break;

    default:
      token = `< ${id} , >`;
      break;
  }
  return { token: token, lexema: id, descrição: token_type }
  // cvsFile += `${token};\t ${id};\t ${token_type}\n`;

}

function is_space(char) {
  return char === ' ';
}
function is_Enter(char) {
  return char == "\n";
}
function is_enterMac(char) {
  return char == "\r";
}

function is_commentLine(current_token) {
  return current_token === '//';
}

function is_commentBlock(current_token) {
  return current_token === '/*';
}

function is_operator(char) {
  return operators.includes(char);
}

function is_delimiter(char) {
  return delimiters.includes(char)
}

function is_number(char) {
  var n = parseInt(char);
  return Number.isInteger(n);
}

// console.log(AnaliseLexico(` INICIO teste

// INTEIRO a;

// a:=2;

// escreva(a);

// FIM `))

export default function AnaliseLexico(program) {
  const tokens = []
  var trail = "nada";
  var current_token = { token: '', lexema: "", descrição: "", char: "" };
  var $VerifyBlock = "";
  var commentLine = false;
  var commentBlock = false;
  var open_quotes = false;
  var type_open_quotes = ""
  var backslash = true;
  // if (current_token = '')
  // checkToken(current_token);
  for (let char of program) {
    if (open_quotes) {
      current_token.char += char;

      if (!backslash && char == type_open_quotes) {
        open_quotes = !open_quotes;
        trail = "literal";
        current_token = checkToken(current_token.char, trail);
        if (current_token?.descrição) {
          tokens.push({ descrição: current_token.descrição, lexema: current_token.lexema, token: current_token.token })
        }
      }

      if (!backslash && char == '\\')
        backslash = true;
      else
        backslash = false;

      trail = "delimitador";

    } else if (commentBlock) {
      if (char == "*") {
        $VerifyBlock = "*";
      } else {
        $VerifyBlock += char;
      }

      current_token.char += char;
      if ($VerifyBlock == '*/') {
        commentBlock = false;
        trail = "comentario";
        current_token = checkToken(current_token.char, trail);
        if (current_token?.descrição) {
          tokens.push({ descrição: current_token.descrição, lexema: current_token.lexema, token: current_token.token })
        }
      }

    } else if (commentLine) {
      if (char == "\n" || char == "\r") {
        commentLine = false;
        trail = "comentario";
        current_token = checkToken(current_token.char, trail);
        if (current_token?.descrição) {
          tokens.push({ descrição: current_token.descrição, lexema: current_token.lexema, token: current_token.token })
        }
      } else {
        current_token.char += char;
      }

    } else {
      if (!is_space(char) && !is_Enter(char) && !is_enterMac(char)) {

        if (!is_operator(char)) {

          if (!is_delimiter(char)) {

            if (!is_number(char)) {
              if (char == "." && is_number(current_token.char)) {
                current_token.char += char;
                trail = "constante";
              } else {
                if (trail != "letra") {
                  current_token = checkToken(current_token.char, trail);
                  if (current_token?.descrição) {
                    tokens.push({ descrição: current_token.descrição, lexema: current_token.lexema, token: current_token.token })
                  }
                }

                current_token.char += char;
                trail = "letra";
              }

            } else if (is_number(current_token[0]) && is_number(char)) {
              current_token.char += char;
              trail = "constante";

            } else {
              current_token = checkToken(current_token.char, trail);
              if (current_token?.descrição) {
                tokens.push({ descrição: current_token.descrição, lexema: current_token.lexema, token: current_token.token })
              }
              current_token.char += char;
              trail = "constante";

            }

          } else {
            if (char == '"' || char == '\'') {
              type_open_quotes = char;
              current_token.char = char;
              open_quotes = !open_quotes;
            } else {
              current_token = checkToken(current_token.char, trail);
              if (current_token?.descrição) {
                tokens.push({ descrição: current_token.descrição, lexema: current_token.lexema, token: current_token.token })
              }
              current_token.char += char;
              trail = "delimitador";
              current_token = checkToken(current_token.char, trail);
              if (current_token?.descrição) {
                tokens.push({ descrição: current_token.descrição, lexema: current_token.lexema, token: current_token.token })
              }
            }

          }

        } else if (operators.includes(current_token.char[0])) {
          current_token.char += char;
          trail = "operador";
          if (is_commentLine(current_token))
            commentLine = true;
          if (is_commentBlock(current_token))
            commentBlock = true;

        } else {
          current_token = checkToken(current_token.char, trail);
          if (current_token?.descrição) {
            tokens.push({ descrição: current_token.descrição, lexema: current_token.lexema, token: current_token.token })
          }
          current_token.char += char;
          trail = "operador";

        }

      } else {
        current_token = checkToken(current_token.char, trail);
        if (current_token?.descrição) {
          tokens.push({ descrição: current_token.descrição, lexema: current_token.lexema, token: current_token.token })
        }
        trail = "nada";
      }

    }

  }

  return tokens
}
