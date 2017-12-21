logger = {
  LEVELS : {
    emerg     : 0,
    emergency : 0,
    alert     : 1,
    crit      : 2,
    critical  : 2,
    err       : 3,
    error     : 3,
    log       : 4,
    warn      : 4,
    warning   : 4,
    notice    : 5,
    info      : 6,
    debug     : 7
  }
}
logger.level = logger.LEVELS.warning;
logger.label = "<LABEL>";
logger.sub_label = undefined;

logger.debug = function(msg) {
  if ( logger.LEVELS['debug'] <= logger.level ) {
    if ( typeof msg !== "string" ) {
     msg = JSON.stringify(msg, null, 3);
    }
    if ( typeof logger.label !== "string" ) {
     logger.label = "<LABEL>";
    }
    var label = ("         " + logger.label.toUpperCase() + ": ").slice(-12);
    if ( typeof logger.sub_label == "string" ) {
     label = label + "[" + logger.sub_label + "] ";
    }
    var now   = new Date();
    var date  = now.getFullYear() + "-" + ("0" + ( now.getMonth() + 1 ).toString()).slice(-2) + "-" + ("0" + now.getDate().toString()).slice(-2);
    var time  = ("0" + now.getHours().toString()).slice(-2) + ":" + ("0" + now.getMinutes().toString()).slice(-2) + ":" + ("0" + now.getSeconds().toString()).slice(-2);
    console.log(date + " " + time  + "    DEBUG: " + label + msg);
  }
}

logger.info = function(msg) {
  if ( logger.LEVELS['info'] <= logger.level ) {
    if ( typeof msg !== "string" ) {
     msg = JSON.stringify(msg, null, 3);
    }
    if ( typeof logger.label !== "string" ) {
     logger.label = "<LABEL>";
    }
    var label = ("         " + logger.label.toUpperCase() + ": ").slice(-12);
    if ( typeof logger.sub_label == "string" ) {
     label = label + "[" + logger.sub_label + "] ";
    }
    var now   = new Date();
    var date  = now.getFullYear() + "-" + ("0" + ( now.getMonth() + 1 ).toString()).slice(-2) + "-" + ("0" + now.getDate().toString()).slice(-2);
    var time  = ("0" + now.getHours().toString()).slice(-2) + ":" + ("0" + now.getMinutes().toString()).slice(-2) + ":" + ("0" + now.getSeconds().toString()).slice(-2);
    console.log(date + " " + time  + "     INFO: " + label + msg);
  }
}

logger.notice = function(msg) {
  if ( logger.LEVELS['notice'] <= logger.level ) {
    if ( typeof msg !== "string" ) {
     msg = JSON.stringify(msg, null, 3);
    }
    if ( typeof logger.label !== "string" ) {
     logger.label = "<LABEL>";
    }
    var label = ("         " + logger.label.toUpperCase() + ": ").slice(-12);
    if ( typeof logger.sub_label == "string" ) {
     label = label + "[" + logger.sub_label + "] ";
    }
    var now   = new Date();
    var date  = now.getFullYear() + "-" + ("0" + ( now.getMonth() + 1 ).toString()).slice(-2) + "-" + ("0" + now.getDate().toString()).slice(-2);
    var time  = ("0" + now.getHours().toString()).slice(-2) + ":" + ("0" + now.getMinutes().toString()).slice(-2) + ":" + ("0" + now.getSeconds().toString()).slice(-2);
    console.log(date + " " + time  + "   NOTICE: " + label + msg);
  }
}

logger.warning = function(msg) {
  if ( logger.LEVELS['warning'] <= logger.level ) {
    if ( typeof msg !== "string" ) {
     msg = JSON.stringify(msg, null, 3);
    }
    if ( typeof logger.label !== "string" ) {
     logger.label = "<LABEL>";
    }
    var label = ("         " + logger.label.toUpperCase() + ": ").slice(-12);
    if ( typeof logger.sub_label == "string" ) {
     label = label + "[" + logger.sub_label + "] ";
    }
    var now   = new Date();
    var date  = now.getFullYear() + "-" + ("0" + ( now.getMonth() + 1 ).toString()).slice(-2) + "-" + ("0" + now.getDate().toString()).slice(-2);
    var time  = ("0" + now.getHours().toString()).slice(-2) + ":" + ("0" + now.getMinutes().toString()).slice(-2) + ":" + ("0" + now.getSeconds().toString()).slice(-2);
    console.log(date + " " + time  + "  WARNING: " + label + msg);
  }
}

logger.warn = function(msg) {
  logger.warning(msg);
}

logger.log = function(msg) {
  logger.warning(msg);
}

logger.error = function(msg) {
  if ( logger.LEVELS['error'] <= logger.level ) {
    if ( typeof msg !== "string" ) {
     msg = JSON.stringify(msg, null, 3);
    }
    if ( typeof logger.label !== "string" ) {
     logger.label = "<LABEL>";
    }
    var label = ("         " + logger.label.toUpperCase() + ": ").slice(-12);
    if ( typeof logger.sub_label == "string" ) {
     label = label + "[" + logger.sub_label + "] ";
    }
    var now   = new Date();
    var date  = now.getFullYear() + "-" + ("0" + ( now.getMonth() + 1 ).toString()).slice(-2) + "-" + ("0" + now.getDate().toString()).slice(-2);
    var time  = ("0" + now.getHours().toString()).slice(-2) + ":" + ("0" + now.getMinutes().toString()).slice(-2) + ":" + ("0" + now.getSeconds().toString()).slice(-2);
    console.log(date + " " + time  + "    ERROR: " + label + msg);
  }
}

logger.err = function(msg) {
  logger.error(msg);
}

logger.critical = function(msg) {
  if ( logger.LEVELS['error'] <= logger.level ) {
    if ( typeof msg !== "string" ) {
     msg = JSON.stringify(msg, null, 3);
    }
    if ( typeof logger.label !== "string" ) {
     logger.label = "<LABEL>";
    }
    var label = ("         " + logger.label.toUpperCase() + ": ").slice(-12);
    if ( typeof logger.sub_label == "string" ) {
     label = label + "[" + logger.sub_label + "] ";
    }
    var now   = new Date();
    var date  = now.getFullYear() + "-" + ("0" + ( now.getMonth() + 1 ).toString()).slice(-2) + "-" + ("0" + now.getDate().toString()).slice(-2);
    var time  = ("0" + now.getHours().toString()).slice(-2) + ":" + ("0" + now.getMinutes().toString()).slice(-2) + ":" + ("0" + now.getSeconds().toString()).slice(-2);
    console.log(date + " " + time  + "    ERROR: " + label + msg);
  }
}

logger.crit = function(msg) {
  logger.critical(msg);
}

logger.alert = function(msg) {
  if ( logger.LEVELS['alert'] <= logger.level ) {
    if ( typeof msg !== "string" ) {
     msg = JSON.stringify(msg, null, 3);
    }
    if ( typeof logger.label !== "string" ) {
     logger.label = "<LABEL>";
    }
    var label = ("         " + logger.label.toUpperCase() + ": ").slice(-12);
    if ( typeof logger.sub_label == "string" ) {
     label = label + "[" + logger.sub_label + "] ";
    }
    var now   = new Date();
    var date  = now.getFullYear() + "-" + ("0" + ( now.getMonth() + 1 ).toString()).slice(-2) + "-" + ("0" + now.getDate().toString()).slice(-2);
    var time  = ("0" + now.getHours().toString()).slice(-2) + ":" + ("0" + now.getMinutes().toString()).slice(-2) + ":" + ("0" + now.getSeconds().toString()).slice(-2);
    console.log(date + " " + time  + "    ALERT: " + label + msg);
    if (window && window.alert) {
      window.alert(date + " " + time  + "    ALERT: " + label + msg);
    }
  }
}

logger.emergency = function(msg) {
  if ( logger.LEVELS['emergency'] <= logger.level ) {
    if ( typeof msg !== "string" ) {
     msg = JSON.stringify(msg, null, 3);
    }
    if ( typeof logger.label !== "string" ) {
     logger.label = "<LABEL>";
    }
    var label = ("         " + logger.label.toUpperCase() + ": ").slice(-12);
    if ( typeof logger.sub_label == "string" ) {
     label = label + "[" + logger.sub_label + "] ";
    }
    var now   = new Date();
    var date  = now.getFullYear() + "-" + ("0" + ( now.getMonth() + 1 ).toString()).slice(-2) + "-" + ("0" + now.getDate().toString()).slice(-2);
    var time  = ("0" + now.getHours().toString()).slice(-2) + ":" + ("0" + now.getMinutes().toString()).slice(-2) + ":" + ("0" + now.getSeconds().toString()).slice(-2);
    console.log(date + " " + time  + " EMERGNCY: " + label + msg);
    if (window && window.alert) {
      window.alert(date + " " + time  + " EMERGNCY: " + label + msg);
    }
  }
}

logger.emerg = function(msg) {
  logger.emergency(msg);
}
