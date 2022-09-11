input_credit_card = function (input) {
  var format_and_pos = function (char, backspace) {
    var start = 0;
    var end = 0;
    var pos = 0;
    var separator = " ";
    var value = input.value;

    if (char !== false) {
      start = input.selectionStart;
      end = input.selectionEnd;

      if (backspace && start > 0) {
        // handle backspace onkeydown
        start--;

        if (value[start] == separator) {
          start--;
        }
      }
      // To be able to replace the selection if there is one
      value = value.substring(0, start) + char + value.substring(end);

      pos = start + char.length; // caret position
    }

    var d = 0; // digit count
    var dd = 0; // total
    var gi = 0; // group index
    var newV = "";
    var groups = /^\D*3[47]/.test(value) // check for American Express
      ? [4, 6, 5]
      : [4, 4, 4, 4];

    for (var i = 0; i < value.length; i++) {
      if (/\D/.test(value[i])) {
        if (start > i) {
          pos--;
        }
      } else {
        if (d === groups[gi]) {
          newV += separator;
          d = 0;
          gi++;

          if (start >= i) {
            pos++;
          }
        }
        newV += value[i];
        d++;
        dd++;
      }
      if (d === groups[gi] && groups.length === gi + 1) {
        // max length
        break;
      }
    }
    input.value = newV;

    if (char !== false) {
      input.setSelectionRange(pos, pos);
    }
  };

  input.addEventListener("keypress", function (e) {
    var code = e.charCode || e.keyCode || e.which;

    // Check for tab and arrow keys (needed in Firefox)
    if (
      code !== 9 &&
      (code < 37 || code > 40) &&
      // and CTRL+C / CTRL+V
      !(e.ctrlKey && (code === 99 || code === 118))
    ) {
      e.preventDefault();

      var char = String.fromCharCode(code);

      // if the character is non-digit
      // OR
      // if the value already contains 15/16 digits and there is no selection
      // -> return false (the character is not inserted)

      if (
        /\D/.test(char) ||
        (this.selectionStart === this.selectionEnd &&
          this.value.replace(/\D/g, "").length >=
            (/^\D*3[47]/.test(this.value) ? 15 : 16))
      ) {
        // 15 digits if Amex
        return false;
      }
      format_and_pos(char);
    }
  });

  // backspace doesn't fire the keypress event
  input.addEventListener("keydown", function (e) {
    if (e.keyCode === 8 || e.keyCode === 46) {
      // backspace or delete
      e.preventDefault();
      format_and_pos("", this.selectionStart === this.selectionEnd);
    }
  });

  input.addEventListener("paste", function () {
    // A timeout is needed to get the new value pasted
    setTimeout(function () {
      format_and_pos("");
    }, 50);
  });

  input.addEventListener("blur", function () {
    // reformat onblur just in case (optional)
    format_and_pos(this, false);
  });

  //append numbers from form to virtual
  input.addEventListener("keyup", function () {
    document.getElementById("virtual-number").innerHTML = this.value;

    if (this.value === "") {
      document.getElementById("numberErr").innerHTML = "Can't be blank...";
      document.getElementById("numberErr").style.opacity = "1";
      input.style.border = "1px solid var(--input-error)";
      input.style.outlineColor = "var(--input-error)";
    } else if (this.value.length < 19) {
      document.getElementById("numberErr").innerHTML =
        "Can't be less than 16 characters...";
      document.getElementById("numberErr").style.opacity = "1";
      input.style.border = "1px solid var(--input-error)";
      input.style.outlineColor = "var(--input-error)";
    } else {
      document.getElementById("numberErr").innerHTML = "&#8203";
      document.getElementById("numberErr").style.opacity = "0";
      input.style.border = "1px solid grey";
      input.style.outlineColor = "var(--input-gradient-2)";
    }
  });
};

input_credit_card(document.getElementById("credit-card"));

const appendInput = (card, virtual, err) => {
  document.getElementById(card).addEventListener("keyup", function () {
    document.getElementById(virtual).innerHTML = this.value;

    if (this.value === "") {
      document.getElementById(err).innerHTML = "Can't be blank...";
      document.getElementById(err).style.opacity = "1";
      document.getElementById(card).style.border =
        "1px solid var(--input-error)";
      document.getElementById(card).style.outlineColor = "var(--input-error)";
    } else {
      document.getElementById(err).innerHTML = "&#8203";
      document.getElementById(err).style.opacity = "0";
      document.getElementById(card).style.border = "1px solid grey";
      document.getElementById(card).style.outlineColor =
        "var(--input-gradient-2)";
    }

    // SPECIAL CASES
    switch (card) {
      case "card-name":
        if (/\d/.test(document.getElementById("card-name").value)) {
          document.getElementById(err).innerHTML = "Can't have numbers...";
          document.getElementById(err).style.opacity = "1";
          document.getElementById(card).style.border =
            "1px solid var(--input-error)";
          document.getElementById(card).style.outlineColor =
            "var(--input-error)";
        }
        break;
    }
  });
};
