/**
 * @author Kamal Galrani / https://github.com/KamalGalrani
 */

// This file parses '.stl' files and returns a JSON containing vertices and faces
//
// Usage:
//    window.parsers['stl'](buffer)
//       buffer - ArrayBuffer of the file to parse

var parser = function (buffer) {
  var vertices = [];
  var faces = [];
  var vert_hash = {};
  var vertexIndex;
  var f1,f2,f3;
  var face_indices = [];

  var fdata = new DataView(buffer, 0);

  //check if we're binary or ascii - comparing the actual file size to the "what is written in the file" file size
  var pos = 80;
  var tcount = fdata.getUint32(pos,true);
  var predictedSize = 80 /* header */ + 4 /* count */ + 50 * tcount;

  prev_analysis_progress = 0;

  //parse ascii stl
  if (!(buffer.byteLength == predictedSize)) {
    logger.debug("Detected ASCII STL while trying to parse '" + job.name + "'...");

    var stl_string = _array_buffer_to_string(buffer);
    delete buffer;

    stl_string = stl_string.replace(/\r/, "\n");
    stl_string = stl_string.replace(/^solid[^\n]*/, "");
    stl_string = stl_string.replace(/\n/g, " ");
    stl_string = stl_string.replace(/facet normal /g,"");
    stl_string = stl_string.replace(/outer loop/g,"");
    stl_string = stl_string.replace(/vertex /g,"");
    stl_string = stl_string.replace(/endloop/g,"");
    stl_string = stl_string.replace(/endfacet/g,"");
    stl_string = stl_string.replace(/endsolid[^\n]*/, "");
    stl_string = stl_string.replace(/facet/g,"");
    stl_string = stl_string.replace(/\s+/g, " ");
    stl_string = stl_string.replace(/^\s+/, "");

    var points = stl_string.split(" ");
    delete stl_string
    tcount = points.length/12-1;
    pos = 0;

    for (var i=0; i<tcount; i++) {
      status.analysis_progress = Math.floor(100 * (i+1) / tcount);
      if ( status.analysis_progress - prev_analysis_progress > 5 || status.analysis_progress == 100 || status.analysis_progress < prev_analysis_progress ) {
        prev_analysis_progress = status.analysis_progress;
        self.postMessage(status);
        logger.debug("Parsing '" + job.name + "': " + status.analysis_progress + "%");
      }
      face_indices = [];
      for (var x=0; x<3; x++) {
        f1 = parseFloat(points[pos+x*3+3]);
        f2 = parseFloat(points[pos+x*3+4]);
        f3 = parseFloat(points[pos+x*3+5]);
        vertexIndex = vert_hash[ [f1,f2,f3] ];
        if (vertexIndex == null) {
          vertexIndex = vertices.length;
          vertices.push(new THREE.Vector3(f1,f2,f3));
          vert_hash[ [f1,f2,f3] ] = vertexIndex;
        }
        face_indices.push(vertexIndex);
      }
      faces.push(new THREE.Face3(face_indices[0],face_indices[1],face_indices[2]));
      pos += 12;
    }
    prev_analysis_progress = 0;
    logger.debug("Finished parsing '" + job.name + "' :D");
    return {vertices:vertices, faces:faces, colors:false};
  } //parse ascii stl

  //else parse binary stl
  logger.debug("Detected binary STL while trying to parse '" + job.name + "'...");
  pos += 4;
  while (tcount--) {
    status.analysis_progress = Math.floor((2 * (pos - 34 ) / ( ( (pos - 84) / 50 ) + tcount )));
    if ( status.analysis_progress - prev_analysis_progress > 5 || status.analysis_progress == 100 || status.analysis_progress < prev_analysis_progress ) {
      prev_analysis_progress = status.analysis_progress;
      self.postMessage(status);
      logger.debug("Parsing '" + job.name + "': " + status.analysis_progress + "%");
    }
    face_indices = [];
    pos += 12;
    f1 = fdata.getFloat32(pos,true);
    f2 = fdata.getFloat32(pos+4,true);
    f3 = fdata.getFloat32(pos+8,true);
    vertexIndex = vert_hash[ [f1,f2,f3] ];
    if (vertexIndex == null) {
      vertexIndex = vertices.length;
      vertices.push(new THREE.Vector3(f1,f2,f3));
      vert_hash[ [f1,f2,f3] ] = vertexIndex;
    }
    face_indices.push(vertexIndex);
    pos += 12;
    f1 = fdata.getFloat32(pos,true);
    f2 = fdata.getFloat32(pos+4,true);
    f3 = fdata.getFloat32(pos+8,true);
    vertexIndex = vert_hash[ [f1,f2,f3] ];
    if (vertexIndex == null) {
      vertexIndex = vertices.length;
      vertices.push(new THREE.Vector3(f1,f2,f3));
      vert_hash[ [f1,f2,f3] ] = vertexIndex;
    }
    face_indices.push(vertexIndex);
    pos += 12;
    f1 = fdata.getFloat32(pos,true);
    f2 = fdata.getFloat32(pos+4,true);
    f3 = fdata.getFloat32(pos+8,true);
    vertexIndex = vert_hash[ [f1,f2,f3] ];
    if (vertexIndex == null) {
      vertexIndex = vertices.length;
      vertices.push(new THREE.Vector3(f1,f2,f3));
      vert_hash[ [f1,f2,f3] ] = vertexIndex;
    }
    face_indices.push(vertexIndex);

    faces.push(new THREE.Face3(face_indices[0],face_indices[1],face_indices[2]));
    pos += 14;
  }
  delete buffer;
  prev_analysis_progress = 0;
  logger.debug("Finished parsing '" + job.name + "' :D");
  return {vertices:vertices, faces:faces, colors:false};
}

if ( typeof parsers != 'object' ) {
  parsers = {};
}
parsers['STL'] = parser;
