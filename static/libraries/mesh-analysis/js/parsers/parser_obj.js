/**
 * @author Kamal Galrani / https://github.com/KamalGalrani
 */

// This file parses '.obj' files and returns a JSON containing vertices and faces
//
// Usage:
//    window.parsers['obj'](buffer)
//       buffer - ArrayBuffer of the file to parse

var parser = function (buffer) {
  var obj_string = _array_buffer_to_string(buffer);
  var object = new THREE.Object3D();
  var geometry, material, mesh;
  var vertices = [];
  var normals = [];
  var uvs = [];

  // v float float float
  var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
  // vn float float float
  var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
  // vt float float
  var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
  // f vertex vertex vertex ...
  var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;
  // f vertex/uv vertex/uv vertex/uv ...
  var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;
  // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
  var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;
  // f vertex//normal vertex//normal vertex//normal ...
  var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/

  function vector( x, y, z ) {
    return new THREE.Vector3( parseFloat( x ), parseFloat( y ), parseFloat( z ) );
  }
  function uv( u, v ) {
    return new THREE.Vector2( parseFloat( u ), parseFloat( v ) );
  }
  function face3( a, b, c, normals ) {
    return new THREE.Face3( a, b, c, normals );
  }
  function parseVertexIndex( index ) {
    index = parseInt( index );
    return index >= 0 ? index - 1 : index + vertices.length;
  }
  function parseNormalIndex( index ) {
    index = parseInt( index );
    return index >= 0 ? index - 1 : index + normals.length;
  }
  function parseUVIndex( index ) {
    index = parseInt( index );
    return index >= 0 ? index - 1 : index + uvs.length;
  }
  function add_face( a, b, c, normals_inds ) {
    geometry.faces.push( face3(
                                vertices[ parseVertexIndex( a ) ] - 1,
                                vertices[ parseVertexIndex( b ) ] - 1,
                                vertices[ parseVertexIndex( c ) ] - 1
                              ) );
  }
  function add_uvs( a, b, c ) {
    geometry.faceVertexUvs[ 0 ].push( [
                                        uvs[ parseUVIndex( a ) ].clone(),
                                        uvs[ parseUVIndex( b ) ].clone(),
                                        uvs[ parseUVIndex( c ) ].clone()
                                      ] );
  }
  function handle_face_line(faces, uvs, normals_inds) {
    if ( faces[ 3 ] === undefined ) {
      add_face( faces[ 0 ], faces[ 1 ], faces[ 2 ], normals_inds );
      if ( uvs !== undefined && uvs.length > 0 ) {
        add_uvs( uvs[ 0 ], uvs[ 1 ], uvs[ 2 ] );
      }
    } else {
      if ( normals_inds !== undefined && normals_inds.length > 0 ) {
        add_face( faces[ 0 ], faces[ 1 ], faces[ 3 ], [ normals_inds[ 0 ], normals_inds[ 1 ], normals_inds[ 3 ] ] );
        add_face( faces[ 1 ], faces[ 2 ], faces[ 3 ], [ normals_inds[ 1 ], normals_inds[ 2 ], normals_inds[ 3 ] ] );
      } else {
        add_face( faces[ 0 ], faces[ 1 ], faces[ 3 ] );
        add_face( faces[ 1 ], faces[ 2 ], faces[ 3 ] );
      }
      if ( uvs !== undefined && uvs.length > 0 ) {
        add_uvs( uvs[ 0 ], uvs[ 1 ], uvs[ 3 ] );
        add_uvs( uvs[ 1 ], uvs[ 2 ], uvs[ 3 ] );
      }
    }
  }

  // create mesh if no objects in text
  if ( /^o /gm.test( obj_string ) === false ) {
    geometry = new THREE.Geometry();
  }

  var lines = obj_string.split( '\n' );
  delete obj_string;

  prev_analysis_progress = 0;
  logger.debug("Detected OBJ while trying to parse '" + job.name + "'...");

  for ( var i = 0; i < lines.length; i ++ ) {
    status.analysis_progress = Math.floor((i + 1)/lines.length);
    if ( status.analysis_progress - prev_analysis_progress > 5 || status.analysis_progress == 100 || status.analysis_progress < prev_analysis_progress ) {
      prev_analysis_progress = status.analysis_progress;
      self.postMessage(status);
      logger.debug("Parsing '" + job.name + "': " + status.analysis_progress + "%");
    }

    var line = lines[ i ];
    line = line.trim();
    var result;
    if ( line.length === 0 || line.charAt( 0 ) === '#' ) {
      continue;
    } else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {
      // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
      vertices.push( geometry.vertices.push( vector( result[ 1 ], result[ 2 ], result[ 3 ] ) ) );
    } else if ( ( result = normal_pattern.exec( line ) ) !== null ) {
      // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
      normals.push( vector( result[ 1 ], result[ 2 ], result[ 3 ] ) );
    } else if ( ( result = uv_pattern.exec( line ) ) !== null ) {
      // ["vt 0.1 0.2", "0.1", "0.2"]
      uvs.push( uv( result[ 1 ], result[ 2 ] ) );
    } else if ( ( result = face_pattern1.exec( line ) ) !== null ) {
      // ["f 1 2 3", "1", "2", "3", undefined]
      handle_face_line( [ result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ] ] );
    } else if ( ( result = face_pattern2.exec( line ) ) !== null ) {
      // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
      handle_face_line(
                        [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
                        [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //uv
                      );
    } else if ( ( result = face_pattern3.exec( line ) ) !== null ) {
      // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
      handle_face_line(
                        [ result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ] ], //faces
                        [ result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ] ], //uv
                        [ result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ] ] //normal
                      );
    } else if ( ( result = face_pattern4.exec( line ) ) !== null ) {
      // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
      handle_face_line(
                        [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
                        [ ], //uv
                        [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //normal
                      );
    } else if ( /^o /.test( line ) ) {
      geometry = new THREE.Geometry();
    }
  }
  var children = object.children;
  for ( var i = 0, l = children.length; i < l; i ++ ) {
    var geometry = children[ i ].geometry;
  }

  return ({vertices:geometry.vertices, faces:geometry.faces, colors:false});
}

if ( typeof parsers != 'object' ) {
  parsers = {}
}
parsers['OBJ'] = parser;