(function($) {
  $.widget("custom.combobox", {
    _create : function() {
      this.wrapper = $("<div>").addClass("custom_combobox").insertAfter(this.element);

      this.element.hide();
      this._createAutocomplete();
      this._createShowAllButton();
      this.input.attr("placeholder", this.element.attr('placeholder'));
    },
    _createAutocomplete : function() {
      var selected = this.element.children(":selected"), value = selected.val() ? selected.text() : "";

      this.input = $("<input>").appendTo(this.wrapper).val(value).addClass("custom_combobox_input ui-state-default combo_left_corner").autocomplete({
        delay : 0,
        minLength : 0,
        source : $.proxy(this, "_source")
      });

      this._on(this.input, {
        autocompleteselect : function(event, ui) {
          ui.item.option.selected = true;
          this._trigger("select", event, {
            item : ui.item.option
          });
        },
        change : "_matchNotExists"
      });
    },
    _createShowAllButton : function() {
      var input = this.input, wasOpen = false;

      $("<a>").attr("tabIndex", -1).attr("name", "customDropDown").appendTo(this.wrapper).button({
        icons : {
          primary : "ui-icon-triangle-1-s"
        },
        text : false
      }).removeClass("ui-corner-all").addClass("custom_combobox_toggle combo_right_corner").mousedown(function() {
        wasOpen = input.autocomplete("widget").is(":visible");
      }).click(function() {
        input.focus();
        if (wasOpen) {
          return;
        }
        input.autocomplete("search", "");
      });
    },
    _source : function(request, response) {
      var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
      response(this.element.children("option").map(function() {
        var text = $(this).text();
        if (this.value && (!request.term || matcher.test(text) ))
          return {
            label : text,
            value : text,
            option : this
          };
      }));
    },
    _matchNotExists : function(event, ui) {
      if (event.type == 'keypress' && event.keyCode !== $.ui.keyCode.ENTER && event.keyCode !== $.ui.keyCode.TAB) {
        return;
      }

      if (ui && ui.item) {
        return;
      }

      var value = this.input.val(), valueLowerCase = value.toLowerCase(), valid = false;
      this.element.children("option").each(function() {
        if ($(this).text().toLowerCase() === valueLowerCase) {
          this.selected = valid = true;
          return false;
        }
      });

      if (valid) {
        return;
      }

      this._trigger("selectchange", event, {
        valid : valid,
        value : value,
        inputbox : this.input,
        element : this.element
      });
    },
    _destroy : function() {
      this.wrapper.remove();
      this.element.show();
    },
    setvalue : function(value) {
      if (value === '') {
        this.input.val('');
        return;
      }

      this.element.children("option").each(function() {
        if ($(this).val() === value) {
          this.selected = true;
          return false;
        }
      });

      var selected = this.element.children(":selected");
      this.input.val(selected.text());
    },
    getvalue : function() {
      return this.input.val();
    }
  });
})(jQuery);
