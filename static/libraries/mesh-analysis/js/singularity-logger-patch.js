logger.label = "WORKER";
logger.level = logger.LEVELS.debug;

logger.emergency = function(msg, label) {
  self.postMessage({'action': "log", 'level': "emergency", 'msg': msg, 'sub_label': job.id.toString(), 'label': logger.label});
}

logger.alert = function(msg) {
  self.postMessage({'action': "log", 'level': "alert", 'msg': msg, 'sub_label': job.id.toString(), 'label': logger.label });
}

logger.critical = function(msg) {
  if ( typeof label !== "string" ) {
    label = logger.label;
  }
  self.postMessage({'action': "log", 'level': "critical", 'msg': msg, 'sub_label': job.id.toString(), 'label': logger.label });
}

logger.error = function(msg) {
  if ( typeof label !== "string" ) {
    label = logger.label;
  }
  self.postMessage({'action': "log", 'level': "error", 'msg': msg, 'sub_label': job.id.toString(), 'label': logger.label });
}

logger.warning = function(msg) {
  if ( typeof label !== "string" ) {
    label = logger.label;
  }
  self.postMessage({'action': "log", 'level': "warning", 'msg': msg, 'sub_label': job.id.toString(), 'label': logger.label });
}
