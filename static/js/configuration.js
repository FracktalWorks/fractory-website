var configuration = {
  'MESH_COLOR'          : 0xD3D3D3,
  'MESH_UNIT_SCALING'   : {'mm': 1, 'cm': 10, 'in': 25.4},
  'COSINE_SUPPORT_ANGLE': 0.7,
  'MIN_WALL_THICKNESS'  : 100,

  MAX_FILE_SIZE         : 100,
  FILE_TYPE_TO_DEFAULT_JOB_TYPE : {
    'STL'               : 'FDM',
    'OBJ'               : 'FDM',
    'STP'               : 'CNC',
    'STEP'              : 'CNC'
  },
  JOB_TYPES             : ['FDM','CNC','SLS'],
  FDM                   : {
    MATERIALS           : ['PLA','ABS'],
    DEFAULT_FINISH      : 'NORMAL',
    FINISH              : ['COARSE', 'NORMAL', 'FINE'],
    DEFAULT_DENSITY     : '0.1',
    DENSITY             : ['0.1','0.3','0.5']
  },
  CNC                   : {
    MATERIALS           : ['ALUMINIUM','COPPER'],
    DEFAULT_FINISH      : 'NORMAL',
    FINISH              : ['NORMAL'],
    DENSITY             : []
  },
  JOB_TEMPLATE          : {
    id                  : undefined,
    name                : undefined,
    thumbnail           : "/media/2d-product.jpg",
    settings            : {
      type              : undefined,
      material          : undefined,
      finish            : undefined,
      density           : undefined,
      quantity          : 1,
      units             : 'mm'
    },
    'errors'            : {
    },
    'cache'             : {
      'quote'           : {
      }
    },
    'status'            : 200,
    'analysis_progress' : 0,
    'analysis_tag'      : "Reading (1/4)...",
    'upload_progress'   : 0
  }
}

