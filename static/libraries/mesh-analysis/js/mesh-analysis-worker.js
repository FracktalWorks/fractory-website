self.importScripts("/libraries/mesh-analysis/js/jquery-3.2.1.js");

self.importScripts("/libraries/singularity-logger/js/singularity-logger.js");
self.importScripts("/libraries/mesh-analysis/js/singularity-logger-patch.js");

self.importScripts("/libraries/three/js/three.min.js");

self.importScripts("/libraries/mesh-analysis/js/parsers/parser_stl.js");
self.importScripts("/libraries/mesh-analysis/js/parsers/parser_obj.js");

self.importScripts("/js/configuration.js");

var job = {
  id: "undefined"
};

var status = {
  action            : "status",
  analysis_progress : 0,
  analysis_tag      : "Initialising...",
  upload_progress   : -1,
  errors            : {
    code            : 200,
    fatal           : undefined
  }
};

var cache_template = {
  action            : "cache",
  bounding_box      : {
    x               : undefined,
    y               : undefined,
    z               : undefined
  },
  part_volume       : undefined,
  part_area         : undefined,
  support_volume    : {
    x_plus          : undefined,
    x_minus         : undefined,
    y_plus          : undefined,
    y_minus         : undefined,
    z_plus          : undefined,
    z_minus         : undefined
  },
  support_required  : true,
  support_z_area    : {
    x_plus          : undefined,
    x_minus         : undefined,
    y_plus          : undefined,
    y_minus         : undefined,
    z_plus          : undefined,
    z_minus         : undefined
  },
  support_xy_area   : {
    x_plus          : undefined,
    x_minus         : undefined,
    y_plus          : undefined,
    y_minus         : undefined,
    z_plus          : undefined,
    z_minus         : undefined
  },
  exp_print_time    : undefined,
  act_print_time    : undefined,
  quote             : undefined
};

var prev_analysis_progress = 0;
var prev_upload_progress   = 0;

var temp = {};

var material = new THREE.MeshLambertMaterial({'color':configuration.MESH_COLOR, 'overdraw': 1, 'flatShading': true, 'vertexColors': THREE.FaceColors, 'side': THREE.DoubleSide});
var geometry;
var job_file;
var reader;
var abort = 0;

var params = undefined;
var waiting_for_params = 0;

self.onmessage = function(e) {
  try {
    logger.debug("Received message: " + JSON.stringify(e.data, null, 3));
    if ( typeof job.id != "string" || job.id == "undefined" ) {
      job.id = "undefined";
      logger.sub_label = job.id.toString();
      try {
        reader.abort();
      } catch(err) {}
      reader = undefined;
      if (e.data.action == 'init') {
        job = e.data.job;
        logger.sub_label = job.id.toString();
        job.cache = cache_template;
        if ( e.data.file ) {
          load_from_file( e.data.file );
        } else {
          load_from_data( e.data.data );
        }
      } else {
        logger.critical("Recevied '" + e.data.action + "' message before worker is initialised! Skipping...");
      }
      return;
    }
    switch (e.data.action) {
      case 'init':
        logger.critical("Recevied 'init' message after worker is initialised! Skipping...");
        break;
      case 'settings':
        job.settings = e.data.settings;
        if (job_file) {
          parse_file(job_file);
          job_file = undefined;
        }
        break;
      case 'geometry':
        if (job_file) {
          parse_file(job_file);
          job_file = undefined;
        }
        var vf_data = {action: "geometry", vertices: geometry.vertices, faces: geometry.faces};
        self.postMessage(vf_data);
        break;
      case 'stop':
        break;
      case 'terminate':
        break;
      default:
        logger.error("Worker received invalid action '" + e.data.action + "'");
    }
  } catch(err) {
    logger.error("Something went wrong while parsing command!\n" + err.stack);
  }
}

function volume_iterator_start() {
  job.cache.part_volume                 = -1;
  job.cache.part_area                   = -1;
  temp.volume_iterator              = {};
  temp.volume_iterator.part_volume  = 0;
  temp.volume_iterator.part_area    = 0;
}

function volume_iterator(face_index) {
  var face = geometry.faces[face_index];
  var a = geometry.vertices[face.a];
  var b = geometry.vertices[face.b];
  var c = geometry.vertices[face.c];
  temp.volume_iterator.part_volume +=
    ( -c.x * b.y * a.z +
       b.x * c.y * a.z +
       c.x * a.y * b.z -
       a.x * c.y * b.z -
       b.x * a.y * c.z +
       a.x * b.y * c.z );
  var a_b=a.distanceTo(b);
  var b_c=b.distanceTo(c);
  var c_a=c.distanceTo(a);
  var s=(a_b+b_c+c_a)/2;
  temp.volume_iterator.part_area += Math.sqrt(s*(s-a_b)*(s-b_c)*(s-c_a));
}

function volume_iterator_end() {
  job.cache.part_volume = Math.abs(temp.volume_iterator.part_volume/6) * configuration.MESH_UNIT_SCALING[job.settings.units] * configuration.MESH_UNIT_SCALING[job.settings.units] * configuration.MESH_UNIT_SCALING[job.settings.units];
  job.cache.part_area = temp.volume_iterator.part_area * configuration.MESH_UNIT_SCALING[job.settings.units] * configuration.MESH_UNIT_SCALING[job.settings.units];
  delete temp.volume_iterator
}

function support_iterator_start() {
  job.cache.support_volume = {
    'x_plus' : -1,
    'x_minus' : -1,
    'y_plus' : -1,
    'y_minus' : -1,
    'z_plus' : -1,
    'z_minus' : -1
  };
  job.cache.support_z_area = {
    'x_plus' : -1,
    'x_minus' : -1,
    'y_plus' : -1,
    'y_minus' : -1,
    'z_plus' : -1,
    'z_minus' : -1
  };
  temp.support_iterator = {};
  temp.support_iterator.pcl = {
    'x_plus' : {},
    'x_minus' : {},
    'y_plus' : {},
    'y_minus' : {},
    'z_plus' : {},
    'z_minus' : {}
  };
}

function in_triangle(x, y, a_x, a_y, b_x, b_y, c_x, c_y) {
  var i = ((x - b_x) * (a_y - b_y) - (a_x - b_x) * (y - b_y));
  var j = ((x - c_x) * (b_y - c_y) - (b_x - c_x) * (y - c_y));
  var k = ((x - a_x) * (c_y - b_y) - (c_x - a_x) * (y - a_y));

  return ( (i < 0 && j < 0 && k < 0) || (i > 0 && j > 0 && k > 0) ||
           (i == 0 && ((j < 0 && k < 0) || (j > 0 && k > 0))) ||
           (j == 0 && ((k < 0 && i < 0) || (k > 0 && i > 0))) ||
           (k == 0 && ((i < 0 && j < 0) || (i > 0 && j > 0))) ||
           (i == 0 && j == 0) || (j == 0 && k == 0) || (k == 0 && i == 0) )
}

function support_iterator(face_index) {
  var face = geometry.faces[face_index];

  const a = geometry.vertices[face.a];
  const b = geometry.vertices[face.b];
  const c = geometry.vertices[face.c];

  const x_min = Math.floor(Math.min(a.x, b.x, c.x)*configuration.MESH_UNIT_SCALING[job.settings.units])/configuration.MESH_UNIT_SCALING[job.settings.units];
  const x_max = Math.floor(Math.max(a.x, b.x, c.x)*configuration.MESH_UNIT_SCALING[job.settings.units])/configuration.MESH_UNIT_SCALING[job.settings.units];
  const y_min = Math.floor(Math.min(a.y, b.y, c.y)*configuration.MESH_UNIT_SCALING[job.settings.units])/configuration.MESH_UNIT_SCALING[job.settings.units];
  const y_max = Math.floor(Math.max(a.y, b.y, c.y)*configuration.MESH_UNIT_SCALING[job.settings.units])/configuration.MESH_UNIT_SCALING[job.settings.units];
  const z_min = Math.floor(Math.min(a.z, b.z, c.z)*configuration.MESH_UNIT_SCALING[job.settings.units])/configuration.MESH_UNIT_SCALING[job.settings.units];
  const z_max = Math.floor(Math.max(a.z, b.z, c.z)*configuration.MESH_UNIT_SCALING[job.settings.units])/configuration.MESH_UNIT_SCALING[job.settings.units];

  for ( var x = x_min; x <= x_max; x = x + (1/configuration.MESH_UNIT_SCALING[job.settings.units]) ) {
    for ( var y = y_min; y <= y_max; y = y + (1/configuration.MESH_UNIT_SCALING[job.settings.units]) ) {
      if (in_triangle(x, y, a.x, a.y, b.x, b.y, c.x, c.y)) {
        var p = (a.z+(((y-a.y)*((b.z-a.z)*(c.x-a.x)-(c.z-a.z)*(b.x-a.x))+(x-a.x)*((b.y-a.y)*(c.z-a.z)-(c.y-a.y)*(b.z-a.z)))/((b.y-a.y)*(c.x-a.x)-(c.y-a.y)*(b.x-a.x)))) - geometry.boundingBox.min.z;
        if ( p < 0 ) { p = 0; }

        if (( face.normal.z < -1 * configuration.COSINE_SUPPORT_ANGLE ) || ( face.normal.z > 0 )) {
          p = Math.sign(face.normal.z) * p;
          try {
            temp.support_iterator.pcl['z_plus'][x][y].push(p);
          } catch (err) {
            try {
              temp.support_iterator.pcl['z_plus'][x][y] = [p];
            } catch (err) {
              temp.support_iterator.pcl['z_plus'][x] = {};
              temp.support_iterator.pcl['z_plus'][x][y] = [p];
            }
          }
        }

        if (( face.normal.z > configuration.COSINE_SUPPORT_ANGLE ) || ( face.normal.z < 0 )) {
          p = geometry.boundingBox.max.z - geometry.boundingBox.min.z - p;
          p = Math.sign(face.normal.z) * -1 * p;
          try {
            temp.support_iterator.pcl['z_minus'][x][y].push(p);
          } catch (err) {
            try {
              temp.support_iterator.pcl['z_minus'][x][y] = [p];
            } catch (err) {
              temp.support_iterator.pcl['z_minus'][x] = {};
              temp.support_iterator.pcl['z_minus'][x][y] = [p];
            }
          }
        }
      }
    }

    for ( var z = z_min; z <= z_max; z = z + (1/configuration.MESH_UNIT_SCALING[job.settings.units]) ) {
      if (in_triangle(z, x, a.z, a.x, b.z, b.x, c.z, c.x)) {
        var p = (a.y+(((x-a.x)*((b.y-a.y)*(c.z-a.z)-(c.y-a.y)*(b.z-a.z))+(z-a.z)*((b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y)))/((b.x-a.x)*(c.z-a.z)-(c.x-a.x)*(b.z-a.z)))) - geometry.boundingBox.min.y;
        if ( p < 0 ) { p = 0; }

        if (( face.normal.y < -1 * configuration.COSINE_SUPPORT_ANGLE ) || ( face.normal.y > 0 )) {
          p = Math.sign(face.normal.y) * p;
          try {
            temp.support_iterator.pcl['y_plus'][z][x].push(p);
          } catch (err) {
            try {
              temp.support_iterator.pcl['y_plus'][z][x] = [p];
            } catch (err) {
              temp.support_iterator.pcl['y_plus'][z] = {};
              temp.support_iterator.pcl['y_plus'][z][x] = [p];
            }
          }
        }

        if (( face.normal.y > configuration.COSINE_SUPPORT_ANGLE ) || ( face.normal.y < 0 )) {
          p = geometry.boundingBox.max.y - geometry.boundingBox.min.y - p;
          p = Math.sign(face.normal.y) * -1 * p;
          try {
            temp.support_iterator.pcl['y_minus'][z][x].push(p);
          } catch (err) {
            try {
              temp.support_iterator.pcl['y_minus'][z][x] = [p];
            } catch (err) {
              temp.support_iterator.pcl['y_minus'][z] = {};
              temp.support_iterator.pcl['y_minus'][z][x] = [p];
            }
          }
        }
      }
    }
  }

  for ( var y = y_min; y <= y_max; y = y + (1/configuration.MESH_UNIT_SCALING[job.settings.units]) ) {
    for ( var z = z_min; z <= z_max; z = z + (1/configuration.MESH_UNIT_SCALING[job.settings.units]) ) {
      if (in_triangle(y, z, a.y, a.z, b.y, b.z, c.y, c.z)) {
        var p = (a.x+(((z-a.z)*((b.x-a.x)*(c.y-a.y)-(c.x-a.x)*(b.y-a.y))+(y-a.y)*((b.z-a.z)*(c.x-a.x)-(c.z-a.z)*(b.x-a.x)))/((b.z-a.z)*(c.y-a.y)-(c.z-a.z)*(b.y-a.y)))) - geometry.boundingBox.min.x;
        if ( p < 0 ) { p = 0; }

        if (( face.normal.x < -1 * configuration.COSINE_SUPPORT_ANGLE ) || ( face.normal.x > 0 )) {
          p = Math.sign(face.normal.x) * p;
          try {
            temp.support_iterator.pcl['x_plus'][y][z].push(p);
          } catch (err) {
            try {
              temp.support_iterator.pcl['x_plus'][y][z] = [p];
            } catch (err) {
              temp.support_iterator.pcl['x_plus'][y] = {};
              temp.support_iterator.pcl['x_plus'][y][z] = [p];
            }
          }
        }

        if (( face.normal.x > configuration.COSINE_SUPPORT_ANGLE ) || ( face.normal.x < 0 )) {
          p = geometry.boundingBox.max.x - geometry.boundingBox.min.x - p;
          p = Math.sign(face.normal.x) * -1 * p;
          try {
            temp.support_iterator.pcl['x_minus'][y][z].push(p);
          } catch (err) {
            try {
              temp.support_iterator.pcl['x_minus'][y][z] = [p];
            } catch (err) {
              temp.support_iterator.pcl['x_minus'][y] = {};
              temp.support_iterator.pcl['x_minus'][y][z] = [p];
            }
          }
        }
      }
    }
  }
}

function support_iterator_end_helper(dir) {
  var pcl = temp.support_iterator.pcl[dir];
  var volume = 0;
  var interface_area = 0;
  Object.keys(pcl).forEach(function (x) {
    Object.keys(pcl[x]).forEach(function (y) {
      pcl[x][y] = pcl[x][y].sort(function(a,b){return Math.abs(a)-Math.abs(b)});
      for ( var i = 1; i < pcl[x][y].length; i++ ) {
        if (Math.sign(pcl[x][y][i-1]) == Math.sign(pcl[x][y][i])) {
          pcl[x][y].splice(i-1, 1);
          i = i - 1;
        }
      }
      try {
        if ( pcl[x][y][pcl[x][y].length - 1] > 0 ) { pcl[x][y].pop(); }
      } catch (err) {}
      try {
        if ( pcl[x][y][0] == 0 ) { pcl[x][y].shift(); }
      } catch (err) {}
      volume += pcl[x][y].reduce(function(a, b){return a + b;},0)
    });
  });
  return [-1 * volume, interface_area];
}

function support_iterator_end() {
  [ job.cache.support_volume['x_plus'], job.cache.support_z_area['x_plus'] ] = support_iterator_end_helper('x_plus');
  [ job.cache.support_volume['x_minus'], job.cache.support_z_area['x_minus'] ] = support_iterator_end_helper('x_minus');
  [ job.cache.support_volume['y_plus'], job.cache.support_z_area['y_plus'] ] = support_iterator_end_helper('y_plus');
  [ job.cache.support_volume['y_minus'], job.cache.support_z_area['y_minus'] ] = support_iterator_end_helper('y_minus');
  [ job.cache.support_volume['z_plus'], job.cache.support_z_area['z_plus'] ] = support_iterator_end_helper('z_plus');
  [ job.cache.support_volume['z_minus'], job.cache.support_z_area['z_minus'] ] = support_iterator_end_helper('z_minus');
  delete temp.support_iterator;
}

finish_full_analysis = function() {
  if (abort) {
    logger.debug("Aborting full analysis...");
    return;
  }
  if ( typeof params == 'undefined' ) {
    waiting_for_params++;
    setTimeout(finish_full_analysis, 100);
    logger.debug("Waiting for params...");
  } else if ( params.units == job.settings.units &&
              params.bounding_box.x == job.cache.bounding_box.x &&
              params.bounding_box.y == job.cache.bounding_box.y &&
              params.bounding_box.z == job.cache.bounding_box.z ) {
    logger.debug("Goth params...");
    waiting_for_params = 0;
    var exp_print_time = {};

    exp_print_time.x_plus  = params.x.part_volume * job.cache.part_volume + params.x.part_area * job.cache.part_area + params.x.support_volume * job.cache.support_volume.x_plus +
                               params.x.bounding_box_height * job.cache.bounding_box.x + params.x.bounding_box_area * job.cache.bounding_box.y * job.cache.bounding_box.z +
                               params.x.bounding_box_volume * job.cache.bounding_box.x * job.cache.bounding_box.y * job.cache.bounding_box.z +
                               params.x.support_z_area * job.cache.support_z_area.x_plus;
    exp_print_time.x_minus = params.x.part_volume * job.cache.part_volume + params.x.part_area * job.cache.part_area + params.x.support_volume * job.cache.support_volume.x_minus +
                               params.x.bounding_box_height * job.cache.bounding_box.x + params.x.bounding_box_area * job.cache.bounding_box.y * job.cache.bounding_box.z +
                               params.x.bounding_box_volume * job.cache.bounding_box.x * job.cache.bounding_box.y * job.cache.bounding_box.z +
                               params.x.support_z_area * job.cache.support_z_area.x_minus;

    exp_print_time.y_plus  = params.y.part_volume * job.cache.part_volume + params.y.part_area * job.cache.part_area + params.y.support_volume * job.cache.support_volume.y_plus +
                               params.y.bounding_box_height * job.cache.bounding_box.y + params.y.bounding_box_area * job.cache.bounding_box.z * job.cache.bounding_box.x +
                               params.y.bounding_box_volume * job.cache.bounding_box.x * job.cache.bounding_box.y * job.cache.bounding_box.z +
                               params.y.support_z_area * job.cache.support_z_area.y_plus;
    exp_print_time.y_minus = params.y.part_volume * job.cache.part_volume + params.y.part_area * job.cache.part_area + params.y.support_volume * job.cache.support_volume.y_minus +
                               params.y.bounding_box_height * job.cache.bounding_box.y + params.y.bounding_box_area * job.cache.bounding_box.z * job.cache.bounding_box.x +
                               params.y.bounding_box_volume * job.cache.bounding_box.x * job.cache.bounding_box.y * job.cache.bounding_box.z +
                               params.y.support_z_area * job.cache.support_z_area.y_minus;

    exp_print_time.z_plus  = params.z.part_volume * job.cache.part_volume + params.z.part_area * job.cache.part_area + params.z.support_volume * job.cache.support_volume.z_plus +
                               params.z.bounding_box_height * job.cache.bounding_box.z + params.z.bounding_box_area * job.cache.bounding_box.x * job.cache.bounding_box.y +
                               params.z.bounding_box_volume * job.cache.bounding_box.x * job.cache.bounding_box.y * job.cache.bounding_box.z +
                               params.z.support_z_area * job.cache.support_z_area.z_plus;
    exp_print_time.z_minus = params.z.part_volume * job.cache.part_volume + params.z.part_area * job.cache.part_area + params.z.support_volume * job.cache.support_volume.z_minus +
                               params.z.bounding_box_height * job.cache.bounding_box.z + params.z.bounding_box_area * job.cache.bounding_box.x * job.cache.bounding_box.y +
                               params.z.bounding_box_volume * job.cache.bounding_box.x * job.cache.bounding_box.y * job.cache.bounding_box.z +
                               params.z.support_z_area * job.cache.support_z_area.z_minus;

    job.cache.exp_print_time = Math.min(exp_print_time.x_plus, exp_print_time.x_minus, exp_print_time.y_plus, exp_print_time.y_minus, exp_print_time.z_plus, exp_print_time.z_minus)
    job.cache.quote = Math.round(job.cache.exp_print_time * 6.944)/100;

    self.postMessage(job.cache);
    logger.debug("Finished stage I analysis for '" + job.name + "'...");
    logger.debug("Finished full analysis for '" + job.name + "'...");

    var job_form = new FormData();

    job_form.append("settings", JSON.stringify(job.settings));

    $.ajax({
      type        : "POST",
      method      : "POST",
      url         : "/jobs/" + job.id,
      data        : job_form,
      cache       : false,
      contentType : false,
      processData : false,
      success: function (data) {
        logger.debug("Job cache pushed to server!\n");
      },
      error: function (e) {
        logger.warn("Job cache could not be pushed to server!\n" + JSON.stringify(e, null, 3));
      },
      async: true,
      timeout: 30*1000
    });
  } else {
    logger.debug("Invalid params...");
    params = undefined;
    waiting_for_params = 0;
    $.get("/jobs/analysis/params/" + job.settings.units + "/" + job.cache.bounding_box.x + "/" + job.cache.bounding_box.y + "/" + job.cache.bounding_box.z, function(data, status){
      params = data;
    });
  }
  if (waiting_for_params > 100) {
    logger.debug("rerequesting params...");
    params = undefined;
    waiting_for_params = 0;
    $.get("/jobs/analysis/params/" + job.settings.units + "/" + job.cache.bounding_box.x + "/" + job.cache.bounding_box.y + "/" + job.cache.bounding_box.z, function(data, status){
      params = data;
    });
  }
}

do_full_analysis = function() {
  prev_analysis_progress = 0;
  status.analysis_progress = 0;
  status.analysis_tag = "Analysis...";
  self.postMessage(status);
  logger.debug("Starting full analysis for '" + job.name + "'...");

  job.cache.bounding_box.x = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
  job.cache.bounding_box.y = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
  job.cache.bounding_box.z = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
  params = undefined;
  waiting_for_params = 0;
//  $.get("/jobs/" + job.id + "/analysis/fetch_params", function(data, status) {
//    if ( status == success ) {
//      params = data;
//    } else {
//      params = {}
//    }
//  });

  volume_iterator_start();
  support_iterator_start();
  logger.debug("Starting stage I analysis for '" + job.name + "'...");
  for(var i = 0; i < geometry.faces.length; i++) {
    status.analysis_progress = Math.floor(100 * (i+1) / geometry.faces.length);
    if ( status.analysis_progress - prev_analysis_progress > 5 || status.analysis_progress == 100 || status.analysis_progress < prev_analysis_progress ) {
      prev_analysis_progress = status.analysis_progress;
      logger.debug("Stage I analysis for '" + job.name + "': " + status.analysis_progress + "%...");
      self.postMessage(status);
    }
    volume_iterator(i);
    support_iterator(i);
  }
  volume_iterator_end();
  support_iterator_end();

  self.postMessage(job.cache);
//  finish_full_analysis();
}

create_mesh = function(vf_data) {
  vf_data.action = "geometry";
  self.postMessage(vf_data);

  geometry = null;
  geometry = new THREE.Geometry;
  geometry.vertices = vf_data.vertices;
  geometry.faces = vf_data.faces;
  geometry.computeBoundingBox();
  geometry.computeFaceNormals();
  geometry.center();

  do_full_analysis();
}

var parse_file = function(buffer) {
  prev_analysis_progress = 0;
  status.analysis_progress = 0;
  status.analysis_tag = "Parsing...";
  self.postMessage(status)
  logger.debug("Attempting to parse '" + job.name + "'...");
  if ( parsers[job.name.split('.').pop().toUpperCase()] ) {
    var vf_data = parsers[job.name.split('.').pop().toUpperCase()](buffer);
    delete buffer;
    create_mesh(vf_data);
    delete vf_data;
  } else {
    logger.debug("Failed to parse '" + job.name + "'...");
    status.analysis_progress = 100;
    status.analysis_tag      = "Analysis...";
    status.errors.code       = 503;
    postMessage(status);
    delete buffer;
  }
}

function _array_buffer_to_string(buffer) {
  var bufView = new Uint8Array(buffer);
  var length = bufView.length;
  var result = '';
  for (var i=0; i<length; i+=127) {
    var addition = 127;
    if (i + 127 > length) {
      addition = length - i;
    }
    result += String.fromCharCode.apply(null, bufView.subarray(i,i+addition));
  }
  return result;
}

var load_from_file = function(file) {
  try {
    logger.debug("Attempting to read file '" + file.name.toString() + "'...");
    reader = new FileReader();
    reader.onerror = function(e) {
      if ( e.target ) {
        e = e.target.error;
      }
      switch(e.code) {
        case e.NOT_FOUND_ERR:
          logger.alert("File '" + file.name.toString() + "' does not exist!\n" + JSON.stringify(e, null, 3));
          status.errors = {'fatal': "File does not exist!"};
          break;
        case e.target.error.ABORT_ERR:
          logger.warn("File '" + file.name.toString() + "' read aborted!\n" + JSON.stringify(e, null, 3));
          status.errors = {'fatal': "File read aborted!"};
          break;
        case e.NOT_READABLE_ERR:
        case e.ENCODING_ERR:
        case e.SECURITY_ERR:
        case 'EACCES':
          logger.alert("File '" + file.name.toString() + "' could not be read!\n" + JSON.stringify(e, null, 3));
          status.errors = {'fatal': "File read permission denied!"};
          break;
        default:
          logger.alert("File '" + file.name.toString() + "' could not be read!\n" + JSON.stringify(e, null, 3));
          status.errors = {'fatal': "File read failed!"};
      }
      status.errors.code = 404;
      self.postMessage(status);
    }

    reader.onload = function(e) {
      prev_analysis_progress = 0;
      logger.debug("File '" + file.name.toString() + "' read successfully :D");
      parse_file(e.target.result);
    }

    reader.onprogress = function(e) {
      status.errors.code              = 200;
      status.errors            = {};
      status.analysis_progress = Math.floor( e.loaded / e.total * 100 );
      status.analysis_tag      = "Reading...";

      if ( status.analysis_progress - prev_analysis_progress > 5 || status.analysis_progress == 100 || status.analysis_progress < prev_analysis_progress ) {
        prev_analysis_progress = status.analysis_progress;
        logger.debug("Reading '" + job.name + "': " + ( e.loaded / e.total * 100 ) + "%");
        self.postMessage(status);
      }

      if ( status.upload_progress == -1 ) {
        status.upload_progress = 0;
        logger.debug("Starting upload for '" + job.name + "'...");
        self.postMessage(status);

        var job_form = new FormData();

        job_form.append("name", job.name);
        job_form.append("cache", JSON.stringify(job.cache));
        job_form.append("settings", JSON.stringify(job.settings));
        job_form.append("errors", JSON.stringify(job.errors));

        $.ajax({
          type        : "POST",
          method      : "POST",
          url         : "/jobs/" + job.id,
          data        : job_form,
          cache       : false,
          contentType : false,
          processData : false,
          success: function (data) {
            var upload_form = new FormData();
            upload_form.append("file", file, file.name);
            upload_form.append("upload_file", true);

            $.ajax({
              type        : "POST",
              method      : "POST",
              url         : "/jobs/" + job.id + "/model",
              data        : upload_form,
              cache       : false,
              contentType : false,
              processData : false,
              xhr         : function () {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                  myXhr.upload.addEventListener('progress', function (event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total = event.total;
                    status.upload_progress = Math.ceil(position / total * 100);
                    if ( status.upload_progress - prev_upload_progress > 5 || status.upload_progress == 100 || status.upload_progress < prev_upload_progress ) {
                      prev_upload_progress = status.upload_progress;
                      logger.debug("File upload for '" + job.name + "': " + status.upload_progress + "%...");
                      postMessage(status);
                    }
                  }, false);
                }
                return myXhr;
              },
              success: function (data) {
              },
              error: function (e) {
                logger.alert("File could not be uploaded to server!\n" + JSON.stringify(e, null, 3));
                status.upload_progress = -1;
                status.errors = {'code': 500,'fatal': "File upload failed!"};
              },
              async: true,
              timeout: 30*60*1000
            });
          },
          error: function (e) {
            logger.alert("Job could not be pushed to server!\n" + JSON.stringify(e, null, 3));
            status.upload_progress = -1;
            status.errors = {'code': 500,'fatal': "Job creation failed!"};
          },
          async: true,
          timeout: 30*1000
        });
      }
    };
    reader.readAsArrayBuffer(file);
  } catch(err) {
    logger.error("Something went wrong while loading from file!\n" + err.stack);
  }
}

var load_from_data = function(data) {
  try {
    logger.debug("Attempting to load '" + job.name + "'...");
    logger.debug("RECEIVED " + (typeof data));
    job_file = data;
  } catch(err) {
    logger.error("Something went wrong while loading from file!\n" + err.stack);
  }
}
