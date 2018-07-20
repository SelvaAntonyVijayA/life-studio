(function(a) {
  var alertsClearTimeOut;

  a.alerts = {
    verticalOffset : -75,
    horizontalOffset : 0,
    repositionOnResize : true,
    overlayOpacity : 0.2,
    overlayColor : "rgb(9, 9, 9)",
    draggable : true,
    okButton : "&nbsp;OK&nbsp;",
    cancelButton : "&nbsp;Cancel&nbsp;",
    continueButton : "&nbsp;Continue&nbsp;",
    dialogClass : null,
    showAlertButton: false,
    alert : function(b, d, c, h, e) {
      if (d == null) {
        d = "Alert";
      }
      a.alerts.okButton = c;
      a.alerts.showAlertButton = h;
      a.alerts._show(d, b, null, "alert", function(f) {
        if (e) {
          e(f);
        }
      });

      if(!h) {
        alertsClearTimeOut = setTimeout(function() {
          a.alerts._hide();
        }, 4000);
      }
    },
    confirm : function(c, e, d, b, f) {
      if (e == null) {
        e = "Confirm";
      }

      a.alerts.okButton = d;
      a.alerts.cancelButton = b;
      a.alerts._show(e, c, null, "confirm", function(g) {
        if (f) {
          f(g);
        }
      });
    },
    questions : function(c, e, d, b, g, f) {
      if (e == null) {
        e = "Confirm";
      }

      a.alerts.okButton = d;
      a.alerts.cancelButton = b;
      a.alerts.continueButton = g;
      a.alerts._show(e, c, null, "questions", function(g) {
        if (f) {
          f(g);
        }
      });
    },
    prompt : function(b, c, d, e) {
      if (d == null) {
        d = "Prompt";
      }

      a.alerts._show(d, b, c, "prompt", function(f) {
        if (e) {
          e(f);
        }
      });
    },
    _show : function(g, f, c, b, i) {
      a.alerts._hide();
      a.alerts._overlay("show");
      a("BODY").append('<div id="popup_container"><div id="popup_close"> <img id="alert_close" src="/img/close_pop.png"/>  </div><h1 id="popup_title"></h1><div id="popup_content"><div id="popup_message"></div></div></div>');
      a("#popup_close").click(function() {
        clearTimeout(alertsClearTimeOut);
        a.alerts._hide();
      });
      a("#popup_close").keypress(function(j) {
        if (j.keyCode == 13 || j.keyCode == 27) {
          a("#popup_close").trigger("click");
        }
      });
      if (a.alerts.dialogClass) {
        a("#popup_container").addClass(a.alerts.dialogClass);
      }
      var h = (jQuery.browser.name == "msie" && parseInt(jQuery.browser.version) <= 6) ? "absolute" : "fixed";
      var h = "absolute";
      a("#popup_container").css({
        position : h,
        zIndex : 99999,
        padding : 0,
        margin : 0
      });
      a("#popup_title").text(g);
      a("#popup_content").addClass(b);
      a("#popup_message").text(f);
      a("#popup_message").html(a("#popup_message").text().replace(/\n/g, "<br />"));
      a("#popup_container").css({
        minWidth : a("#popup_container").outerWidth(),
        maxWidth : a("#popup_container").outerWidth()
      });

      if (b == 'questions') {
        a.alerts._questionsreposition();
      } else {
        a.alerts._reposition();
      }

      a.alerts._maintainPosition(true);

      switch(b) {
        case"alert":
          a("#popup_message").addClass("message_alert");
          var buttonText = '<div id="popup_alert"></div>';

          if(a.alerts.showAlertButton) {
            buttonText = '<div id="popup_alert"><input type="button" value="' + a.alerts.okButton + '" id="popup_ok" /></div>';
          }

          a("#popup_message").after(buttonText);
          a("#popup_ok").click(function() {
            a.alerts._hide();
            i(true);
          });
          a("#popup_ok").focus().keydown(function(j) {
            if (j.keyCode == 13 || j.keyCode == 27) {
              a("#popup_ok").trigger("click");
            }
          });
          break;
        case"confirm":
          a("#popup_message").addClass("other_alert");
          a("#popup_message").after('<div id="popup_panel"><input type="button" value="' + a.alerts.okButton + '" id="popup_ok" /> <input type="button" value="' + a.alerts.cancelButton + '" id="popup_cancel" /></div>');
          a("#popup_ok").click(function() {
            a.alerts._hide();
            if (i) {
              i(true);
            }
          });
          a("#popup_cancel").click(function() {
            a.alerts._hide();
            if (i) {
              i(false);
            }
          });
          a("#popup_ok").focus();
          a("#popup_ok, #popup_cancel").keypress(function(j) {
            if (j.keyCode == 13) {
              a("#popup_ok").trigger("click");
            }
            if (j.keyCode == 27) {
              a("#popup_cancel").trigger("click");
            }
          });
          break;
        case"questions":
          a("#popup_message").addClass("other_alert");
          var html = '<div id="popup_panel">';
          if (a.alerts.okButton != '') {
            html += '<input type="button" value="' + a.alerts.okButton + '" id="popup_ok" />';
          }

          if (a.alerts.cancelButton != '') {
            html += '<input type="button" value="' + a.alerts.cancelButton + '" id="popup_cancel" />';
          }

          if (a.alerts.continueButton != '') {
            html += '<input type="button" value="' + a.alerts.continueButton + '" id="popup_continue" />';
          }

          html += "</div>";

          a("#popup_message").after(html);
          a("#popup_ok").click(function() {
            a.alerts._hide();
            if (i) {
              i(0);
            }
          });
          a("#popup_cancel").click(function() {
            a.alerts._hide();
            if (i) {
              i(1);
            }
          });
          a("#popup_continue").click(function() {
            a.alerts._hide();
            if (i) {
              i(2);
            }
          });
          a("#popup_ok").focus();
          a("#popup_continue,#popup_ok, #popup_cancel").keypress(function(j) {
            if (j.keyCode == 13) {
              a("#popup_ok").trigger("click");
            }
            if (j.keyCode == 27) {
              a("#popup_cancel").trigger("click");
            }
          });
          break;
        case"prompt":
          a("#popup_message").addClass("other_alert");
          a("#popup_message").append('<br /><input type="text" size="30" id="popup_prompt" />').after('<div id="popup_panel"><input type="button" value="' + a.alerts.okButton + '" id="popup_ok" /> <input type="button" value="' + a.alerts.cancelButton + '" id="popup_cancel" /></div>');
          a("#popup_prompt").width(a("#popup_message").width());
          a("#popup_ok").click(function() {
            var e = a("#popup_prompt").val();
            a.alerts._hide();
            if (i) {
              i(e);
            }
          });
          a("#popup_cancel").click(function() {
            a.alerts._hide();
            if (i) {
              i(null);
            }
          });
          a("#popup_prompt, #popup_ok, #popup_cancel").keypress(function(j) {
            if (j.keyCode == 13) {
              a("#popup_ok").trigger("click");
            }
            if (j.keyCode == 27) {
              a("#popup_cancel").trigger("click");
            }
          });
          if (c) {
            a("#popup_prompt").val(c);
          }
          a("#popup_prompt").focus().select();
          break;
      }
      if (a.alerts.draggable) {
        try {
          a("#popup_container").draggable({
            handle : a("#popup_title")
          });

          a("#popup_title").css({
            cursor : "move"
          });
        } catch(d) {
        }
      }
    },
    _hide : function() {
      a("#popup_container").remove();
      a.alerts._overlay("hide");
      a.alerts._maintainPosition(false);
    },
    _overlay : function(b) {
      switch(b) {
        case"show":
          a.alerts._overlay("hide");
          a("BODY").append('<div id="popup_overlay"></div>');
          a("#popup_overlay").css({
            position : "absolute",
            zIndex : 99998,
            top : "0px",
            left : "0px",
            width : "100%",
            height : a(document).height(),
            background : a.alerts.overlayColor,
            opacity : a.alerts.overlayOpacity
          });
          break;
        case"hide":
          a("#popup_overlay").remove();
          break;
      }
    },
    _reposition : function() {
      var c = (a(window).height() / 2) - (a("#popup_container").outerHeight() / 2);
      var b = (a(window).width() / 2) - (a("#popup_container").outerWidth() / 2);
      a("#popup_container").css("position", "fixed");
      a("#popup_container").css("top", c);
      a("#popup_container").css("left", b);
      if (jQuery.browser.name == "msie" && parseInt(jQuery.browser.version) <= 6) {
        c = c + a(window).scrollTop();
      }
      a("#popup_container").css({
        top : "20%",
        left : "40%"
        // "margin-left" : "-150px",
        // "margin-top" : "-250px"
      });
      a("#popup_overlay").height(a(document).height());
    },
    _questionsreposition : function() {
      var c = (a(window).height() / 2) - (a("#popup_container").outerHeight() / 2);
      var b = (a(window).width() / 2) - (a("#popup_container").outerWidth() / 2);
      a("#popup_container").css("position", "fixed");
      a("#popup_container").css("top", c);
      a("#popup_container").css("left", b);

      if (jQuery.browser.name == "msie" && parseInt(jQuery.browser.version) <= 6) {
        c = c + a(window).scrollTop();
      }

      a("#popup_container").css({
        top : "40%",
        left : "40%"
        // "margin-left" : "-100px",
        // "margin-top" : "-250px"
      });

      a("#popup_overlay").height(a(document).height());
    },
    _maintainPosition : function(b) {
      if (a.alerts.repositionOnResize) {
        switch(b) {
          case true:
            a(window).bind("resize", a.alerts._reposition);
            break;
          case false:
            a(window).unbind("resize", a.alerts._reposition);
            break;
        }
      }
    }
  };

  jAlert = function(b, d, c, h, e) {
    a.alerts.alert(b, d, c, h, e);
  };

  jConfirm = function(c, e, d, b, f) {
    a.alerts.confirm(c, e, d, b, f);
  };

  jPrompt = function(b, c, d, e) {
    a.alerts.prompt(b, c, d, e);
  };

  jQuestions = function(c, e, d, b, g, f) {
    a.alerts.questions(c, e, d, b, g, f);
  };
})(jQuery);
