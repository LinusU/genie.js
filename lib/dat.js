
var pako = require('pako');
var jDataView = require('jdataview');
var loadBinaryFile = require('./load-binary-file');

/// Basic units like rubble and flares.
var UT_EyeCandy = 10;

/// With Speed but mostly flags. Purpose of speed is unknown
var UT_Flag = 20;

/// Only one unit has this type. AOK, DOPL (id 243) same properties as UT_Flag
var UT_25 = 25;

/// Dead and fish units. It seems to be unused in SWGB as units just explode
/// and do not leave carcasses.
var UT_Dead_Fish = 30;

/// Only birds in aoe and ror are of this type.
var UT_Bird = 40;

/// Projectiles
var UT_Projectile = 60;

/// Units that can be created or trained like Army, Villagers and Ships.
var UT_Creatable = 70;

/// Buildings
var UT_Building = 80;

/// Trees in aoe and ror are of this type
var UT_AoeTrees = 90;

function DAT (raw) {
  var i, j;

  var rawView = jDataView(raw, undefined, undefined, true);
  var inflated = pako.inflateRaw(rawView.getBytes(rawView.byteLength));
  var view = jDataView(inflated, undefined, undefined, true);

  var version = view.getString(8);

  /* TERRAIN RESTRICTIONS */

  var numTerrainRestrictions = view.getUint16();
  var numTerrainsUsed = view.getUint16();

  var terrainRestrictionPointers = new Array(numTerrainRestrictions);

  for (i=0; i<numTerrainRestrictions; i++) {
    terrainRestrictionPointers[i] = view.getInt32();
  }

  var terrainRestriction = new Array(numTerrainRestrictions);

  for (i=0; i<numTerrainRestrictions; i++) {

    terrainRestriction[i] = new Array(numTerrainsUsed);

    for (j=0; j<numTerrainsUsed; j++) {
      terrainRestriction[i][j] = view.getFloat32();
    }

  }

  /* PLAYER COLOR */

  var playerColor = new Array(view.getUint16());

  for (i=0; i<playerColor.length; i++) {
    playerColor[i] = {};
    playerColor[i].name = view.getString(30).replace(/\0+$/, '');
    playerColor[i].id = view.getInt32();
    playerColor[i].color = view.getInt16();
  }

  /* SOUND */

  var sounds = new Array(view.getUint16());

  for (i=0; i<sounds.length; i++) {

    sounds[i] = {};
    sounds[i].id = view.getInt32();
    sounds[i].items = new Array(view.getUint16());

    view.getInt32(); // unknown

    for (j=0; j<sounds[i].items.length; j++) {
      sounds[i].items[j] = {};
      sounds[i].items[j].filename = view.getString(13).replace(/\0+$/, '');
      sounds[i].items[j].resourceId = view.getInt32();
      sounds[i].items[j].probability = view.getInt16();
    }

  }

  /* GRAPHIC */

  var graphics = new Array(view.getUint16());
  var graphicPointers = new Array(graphics.length);

  for (i=0; i<graphicPointers.length; i++) {
    graphicPointers[i] = view.getInt32();
  }

  for (i=0; i<graphics.length; i++) {

    if (graphicPointers[i] === 0) {
      graphics[i] = null;
      continue ;
    }

    graphics[i] = {};
    graphics[i].title = view.getString(21).replace(/\0+$/, '');
    graphics[i].name = view.getString(13).replace(/\0+$/, '');
    graphics[i].SLP = view.getInt32();

    view.getInt8(); // unknown
    view.getInt8(); // unknown

    graphics[i].layer = view.getInt8();
    graphics[i].playerColor = view.getInt8();
    graphics[i].rainbow = view.getInt8();
    graphics[i].replay = view.getInt8();

    graphics[i].coordinates = new Array(4);
    graphics[i].coordinates[0] = view.getInt16();
    graphics[i].coordinates[1] = view.getInt16();
    graphics[i].coordinates[2] = view.getInt16();
    graphics[i].coordinates[3] = view.getInt16();

    graphics[i].deltas = new Array(view.getUint16());

    graphics[i].soundId = view.getInt16();
    graphics[i].attackSoundUsed = view.getInt8();
    graphics[i].frameCount = view.getUint16();
    graphics[i].angleCount = view.getUint16();

    graphics[i].newSpeed = view.getFloat32();
    graphics[i].frameRate = view.getFloat32();
    graphics[i].replayDelay = view.getFloat32();
    graphics[i].sequenceType = view.getInt8();
    graphics[i].id = view.getInt16();
    graphics[i].mirroringMode = view.getInt8();

    for (j=0; j<graphics[i].deltas.length; j++) {
      graphics[i].deltas[j] = {};
      graphics[i].deltas[j].graphicID = view.getInt16();
      view.getInt16(); // unknown
      view.getInt16(); // unknown
      view.getInt16(); // unknown
      graphics[i].deltas[j].directionX = view.getInt16();
      graphics[i].deltas[j].directionY = view.getInt16();
      view.getInt16(); // unknown
      view.getInt16(); // unknown
    }

    if (graphics[i].attackSoundUsed) {
      graphics[i].attackSounds = new Array(graphics[i].angleCount);
      for (j=0; j<graphics[i].attackSounds.length; j++) {
        graphics[i].attackSounds[j] = {};
        graphics[i].attackSounds[j].soundDelay1 = view.getInt16();
        graphics[i].attackSounds[j].soundId1 = view.getInt16();
        graphics[i].attackSounds[j].soundDelay2 = view.getInt16();
        graphics[i].attackSounds[j].soundId2 = view.getInt16();
        graphics[i].attackSounds[j].soundDelay3 = view.getInt16();
        graphics[i].attackSounds[j].soundId3 = view.getInt16();
      }
    }

  }

  /* GRAPHICS RENDERING */

  var graphicsRendering = new Array(69);

  for (i=0; i<graphicsRendering.length; i++) {
    graphicsRendering[i] = view.getInt16();
  }

  /* TERRAINS */

  var terrains = new Array(32);

  for (i=0; i<terrains.length; i++) {

    terrains[i] = {};

    view.getInt16(); // unknown

    terrains[i].enabled = view.getInt16();
    terrains[i].title = view.getString(13).replace(/\0+$/, '');
    terrains[i].name = view.getString(13).replace(/\0+$/, '');
    terrains[i].SLP = view.getInt32();

    view.getFloat32(); // unknown

    terrains[i].soundId = view.getInt32();

    terrains[i].colors = new Array(3);
    terrains[i].colors[0] = view.getUint8();
    terrains[i].colors[1] = view.getUint8();
    terrains[i].colors[2] = view.getUint8();

    view.skip(5 + 4 + 18); // unknown

    terrains[i].frameCount = view.getInt16();
    terrains[i].angleCount = view.getInt16();
    terrains[i].terrainId = view.getInt16();

    terrains[i].elevationGraphics = new Array(54);

    for (j=0; j<terrains[i].elevationGraphics.length; j++) {
      terrains[i].elevationGraphics[j] = view.getInt16();
    }

    terrains[i].terrainReplacementId = view.getInt16();
    terrains[i].terrainDimensions = view.getInt16();

    view.getInt16(); // FIXME: NO IDEA WHAT THIS IS
    terrains[i].terrainBorderIds = new Array(32);

    for (j=0; j<terrains[i].terrainBorderIds.length; j++) {
      terrains[i].terrainBorderIds[j] = view.getInt16();
    }

    terrains[i].terrainUnits = new Array(30);

    for (j=0; j<terrains[i].terrainUnits.length; j++) {
      terrains[i].terrainUnits[j] = {};
      terrains[i].terrainUnits[j].id = view.getInt16();
    }

    for (j=0; j<terrains[i].terrainUnits.length; j++) {
      terrains[i].terrainUnits[j].density = view.getInt16();
    }

    for (j=0; j<terrains[i].terrainUnits.length; j++) {
      terrains[i].terrainUnits[j].priority = view.getInt8();
    }

    terrains[i].terrainUnits.length = view.getInt16();

  }

  /* TERRAIN BORDERS */

  var terrainBorders = new Array(16);

  for (i=0; i<terrainBorders.length; i++) {

    terrainBorders[i] = {};

    view.getInt16(); // unknown

    terrainBorders[i].enabled = view.getInt16();
    terrainBorders[i].title = view.getString(13).replace(/\0+$/, '');
    terrainBorders[i].name = view.getString(13).replace(/\0+$/, '');
    terrainBorders[i].SLP = view.getInt32();

    view.getFloat32(); // unknown

    terrainBorders[i].soundId = view.getInt32();

    terrainBorders[i].colors = new Array(3);
    terrainBorders[i].colors[0] = view.getUint8();
    terrainBorders[i].colors[1] = view.getUint8();
    terrainBorders[i].colors[2] = view.getUint8();

    view.skip(5 + 4); // unknown

    terrainBorders[i].frames = new Array(230);

    for (j=0; j<terrainBorders[i].frames.length; j++) {
      terrainBorders[i].frames[j] = {};
      terrainBorders[i].frames[j].frameId = view.getInt16();
      terrainBorders[i].frames[j].flag1 = view.getInt16();
      terrainBorders[i].frames[j].flag2 = view.getInt16();
    }

    terrainBorders[i].frameCount = view.getInt16();
    terrainBorders[i].angleCount = view.getInt16();
    terrainBorders[i].terrainId = view.getInt16();

  }

  /* ZERO PADDING */

  view.skip(3 * 2);

  /* NUMBER OF TERRAINS USED 2 */

  var numTerrainsUsed2 = view.getUint16();

  /* RENDERING */

  var rendering = new Array(21);

  for (i=0; i<rendering.length; i++) {
    rendering[i] = view.getInt16();
  }

  /* FEW POINTERS AND SMALL NUMBERS */

  view.skip(5 * 4);

  /* RANDOM MAPS */

  var randomMapCount = view.getUint32();
  var randomMapPointer = view.getInt32();

  var randomMaps = new Array(randomMapCount);

  for (i=0; i<randomMapCount; i++) {
    randomMaps[i] = {};
    randomMaps[i].header = {};

    randomMaps[i].header.scriptNumber = view.getInt32();
    randomMaps[i].header.borderSouthWest = view.getInt32();
    randomMaps[i].header.borderNorthWest = view.getInt32();
    randomMaps[i].header.borderNorthEast = view.getInt32();
    randomMaps[i].header.borderSouthEast = view.getInt32();
    randomMaps[i].header.borderUsage = view.getInt32();
    randomMaps[i].header.waterShape = view.getInt32();
    randomMaps[i].header.nonBaseTerrain = view.getInt32();
    randomMaps[i].header.baseZoneCoverage = view.getInt32();
    randomMaps[i].header.unknown9 = view.getInt32();
    randomMaps[i].header.baseZoneCount = view.getUint32();
    randomMaps[i].header.baseZonePointer = view.getInt32();
    randomMaps[i].header.mapTerrainCount = view.getUint32();
    randomMaps[i].header.mapTerrainPointer = view.getInt32();
    randomMaps[i].header.mapUnitCount = view.getUint32();
    randomMaps[i].header.mapUnitPointer = view.getInt32();

    view.skip(2 * 4); // unknown

  }

  for (i=0; i<randomMapCount; i++) {
    randomMaps[i].map = {};

    randomMaps[i].map.borderSouthWest = view.getInt32();
    randomMaps[i].map.borderNorthWest = view.getInt32();
    randomMaps[i].map.borderNorthEast = view.getInt32();
    randomMaps[i].map.borderSouthEast = view.getInt32();
    randomMaps[i].map.borderUsage = view.getInt32();
    randomMaps[i].map.waterShape = view.getInt32();
    randomMaps[i].map.nonBaseTerrain = view.getInt32();
    randomMaps[i].map.baseZoneCoverage = view.getInt32();
    randomMaps[i].map.unknown9 = view.getInt32();

    var baseZoneCount = view.getUint32();
    var baseZonePointer = view.getInt32();

    randomMaps[i].map.baseZones = new Array(baseZoneCount);

    for (j=0; j<baseZoneCount; j++) {

      randomMaps[i].map.baseZones[j] = {};

      view.getInt32(); // unknown

      randomMaps[i].map.baseZones[j].baseTerrain = view.getInt32();
      randomMaps[i].map.baseZones[j].spacingBetweenPlayers = view.getInt32();

      view.getInt32(); // unknown
      view.getBytes(4); // unknown
      view.getInt32(); // unknown
      view.getInt32(); // unknown
      view.getBytes(4); // unknown

      randomMaps[i].map.baseZones[j].startAreaRadius = view.getInt32();

      view.getInt32(); // unknown
      view.getInt32(); // unknown
    }

    var mapTerrainCount = view.getUint32();
    var mapTerrainPointer = view.getInt32();

    randomMaps[i].map.mapTerrains = new Array(mapTerrainCount);

    for (j=0; j<mapTerrainCount; j++) {
      randomMaps[i].map.mapTerrains[j] = {};
      randomMaps[i].map.mapTerrains[j].proportion = view.getInt32();
      randomMaps[i].map.mapTerrains[j].terrain = view.getInt32();
      randomMaps[i].map.mapTerrains[j].numberOfClumps = view.getInt32();
      randomMaps[i].map.mapTerrains[j].spacingToOtherTerrains = view.getInt32();
      randomMaps[i].map.mapTerrains[j].placementZone = view.getInt32();
      randomMaps[i].map.mapTerrains[j].unknown6 = view.getInt32();
    }

    var mapUnitCount = view.getUint32();
    var mapUnitPointer = view.getInt32();

    randomMaps[i].map.mapUnits = new Array(mapUnitCount);

    for (j=0; j<mapUnitCount; j++) {
      randomMaps[i].map.mapUnits[j] = {};
      randomMaps[i].map.mapUnits[j].unit = view.getInt32();
      randomMaps[i].map.mapUnits[j].hostTerrain = view.getInt32();
      randomMaps[i].map.mapUnits[j].unknown3 = view.getBytes(4);
      randomMaps[i].map.mapUnits[j].objectsPerPlayer = view.getInt32();
      randomMaps[i].map.mapUnits[j].unknown5 = view.getInt32();
      randomMaps[i].map.mapUnits[j].groupsPerPlayer = view.getInt32();
      randomMaps[i].map.mapUnits[j].unknown7 = view.getInt32();
      randomMaps[i].map.mapUnits[j].ownAtStart = view.getInt32();
      randomMaps[i].map.mapUnits[j].setPlaceForAllPlayers = view.getInt32();
      randomMaps[i].map.mapUnits[j].minDistanceToPlayers = view.getInt32();
      randomMaps[i].map.mapUnits[j].maxDistanceToPlayers = view.getInt32();
    }

    view.skip(2 * 4); // unknown

  }

  /* TECHNOLOGIES */

  var technologies = new Array(view.getUint32());

  for (i=0; i<technologies.length; i++) {
    technologies[i] = {};
    technologies[i].name = view.getString(31).replace(/\0+$/, '');
    technologies[i].effects = new Array(view.getUint16());
    for (j=0; j<technologies[i].effects.length; j++) {
      technologies[i].effects[j] = {};
      technologies[i].effects[j].type = view.getInt8();
      technologies[i].effects[j].a = view.getInt16();
      technologies[i].effects[j].b = view.getInt16();
      technologies[i].effects[j].c = view.getInt16();
      technologies[i].effects[j].d = view.getFloat32();
    }
  }

  /* CIVILIZATIONS */

  var civilizations = new Array(view.getUint16());

  for (i=0; i<civilizations.length; i++) {
    civilizations[i] = {};

    civilizations[i].enabled = view.getInt8();
    civilizations[i].name = view.getString(20).replace(/\0+$/, '');
    civilizations[i].resources = new Array(view.getUint16());
    civilizations[i].techTreeId = view.getInt16();

    for (j=0; j<civilizations[i].resources.length; j++) {
      civilizations[i].resources[j] = view.getFloat32();
    }

    civilizations[i].graphicSet = view.getInt8();

    var unitCount = view.getUint16();
    var unitPointers = new Array(unitCount);
    civilizations[i].units = new Array(unitCount);

    for (j=0; j<unitCount; j++) {
      unitPointers[j] = view.getInt32();
    }

    for (j=0; j<unitCount; j++) {

      if (unitPointers[j] === 0) {
        civilizations[i].units[j] = null;
        continue ;
      }

      civilizations[i].units[j] = {};

      civilizations[i].units[j].type = view.getInt8();

      var nameLength = view.getInt16();

      civilizations[i].units[j].id1 = view.getUint16();
      civilizations[i].units[j].languageDLLName = view.getUint16();
      civilizations[i].units[j].languageDLLCreation = view.getUint16();
      civilizations[i].units[j].class = view.getInt16();
      civilizations[i].units[j].standingGraphic = view.getInt16();

      civilizations[i].units[j].dyingGraphic = new Array(2);
      civilizations[i].units[j].dyingGraphic[0] = view.getInt16();
      civilizations[i].units[j].dyingGraphic[1] = view.getInt16();

      civilizations[i].units[j].deathMode = view.getInt8();
      civilizations[i].units[j].hitPoints = view.getInt16();
      civilizations[i].units[j].lineOfSight = view.getFloat32();
      civilizations[i].units[j].garrisonCapacity = view.getInt8();

      civilizations[i].units[j].sizeRadius = new Array(2);
      civilizations[i].units[j].sizeRadius[0] = view.getFloat32();
      civilizations[i].units[j].sizeRadius[1] = view.getFloat32();

      civilizations[i].units[j].hpBarHeight1 = view.getFloat32();
      civilizations[i].units[j].trainSound = view.getInt16();

      civilizations[i].units[j].deadUnitID = view.getInt16();
      civilizations[i].units[j].placementMode = view.getInt8();
      civilizations[i].units[j].airMode = view.getInt8();
      civilizations[i].units[j].iconID = view.getInt16();
      civilizations[i].units[j].hideInEditor = view.getInt8();
      civilizations[i].units[j].unknown1 = view.getInt16();
      civilizations[i].units[j].enabled = view.getInt8();

      civilizations[i].units[j].placementBypassTerrain = new Array(2);
      civilizations[i].units[j].placementBypassTerrain[0] = view.getInt16();
      civilizations[i].units[j].placementBypassTerrain[1] = view.getInt16();

      civilizations[i].units[j].placementTerrain = new Array(2);
      civilizations[i].units[j].placementTerrain[0] = view.getInt16();
      civilizations[i].units[j].placementTerrain[1] = view.getInt16();

      civilizations[i].units[j].editorRadius = new Array(2);
      civilizations[i].units[j].editorRadius[0] = view.getFloat32();
      civilizations[i].units[j].editorRadius[1] = view.getFloat32();

      civilizations[i].units[j].buildingMode = view.getInt8();
      civilizations[i].units[j].visibleInFog = view.getInt8();
      civilizations[i].units[j].terrainRestriction = view.getInt16();
      civilizations[i].units[j].flyMode = view.getInt8();
      civilizations[i].units[j].resourceCapacity = view.getInt16();
      civilizations[i].units[j].resourceDecay = view.getFloat32();

      //TODO: AoE/ROR: [0]:blast_type?
      civilizations[i].units[j].blastType = view.getInt8();

      civilizations[i].units[j].unknown2 = view.getInt8();
      civilizations[i].units[j].interactionMode = view.getInt8();
      civilizations[i].units[j].minimapMode = view.getInt8();
      civilizations[i].units[j].commandAttribute = view.getInt16();

      view.getBytes(4 * 1); // unknown

      civilizations[i].units[j].languageDLLHelp = view.getInt32();
      civilizations[i].units[j].languageDLLHotKeyText = view.getInt32();
      civilizations[i].units[j].hotKey = view.getInt32();
      civilizations[i].units[j].unselectable = view.getInt8();
      civilizations[i].units[j].unknown6 = view.getInt8();

      civilizations[i].units[j].selectionMask = view.getInt8();
      civilizations[i].units[j].selectionShape = view.getInt8();
      civilizations[i].units[j].selectionEffect = view.getInt8();
      civilizations[i].units[j].editorSelectionColour = view.getInt8();

      civilizations[i].units[j].selectionRadius = new Array(2);
      civilizations[i].units[j].selectionRadius[0] = view.getFloat32();
      civilizations[i].units[j].selectionRadius[1] = view.getFloat32();

      civilizations[i].units[j].hpBarHeight2 = view.getFloat32();

      civilizations[i].units[j].resourceStorages = new Array(3);

      civilizations[i].units[j].resourceStorages[0] = new Array(3);
      civilizations[i].units[j].resourceStorages[0][0] = view.getInt16();
      civilizations[i].units[j].resourceStorages[0][1] = view.getFloat32();
      civilizations[i].units[j].resourceStorages[0][2] = view.getInt8();

      civilizations[i].units[j].resourceStorages[1] = new Array(3);
      civilizations[i].units[j].resourceStorages[1][0] = view.getInt16();
      civilizations[i].units[j].resourceStorages[1][1] = view.getFloat32();
      civilizations[i].units[j].resourceStorages[1][2] = view.getInt8();

      civilizations[i].units[j].resourceStorages[2] = new Array(3);
      civilizations[i].units[j].resourceStorages[2][0] = view.getInt16();
      civilizations[i].units[j].resourceStorages[2][1] = view.getFloat32();
      civilizations[i].units[j].resourceStorages[2][2] = view.getInt8();

      civilizations[i].units[j].damageGraphics = new Array(view.getUint8());

      for (k=0; k<civilizations[i].units[j].damageGraphics.length; k++) {
        civilizations[i].units[j].damageGraphics[k] = {};
        civilizations[i].units[j].damageGraphics[k].graphicID = view.getInt16();
        civilizations[i].units[j].damageGraphics[k].damagePercent = view.getInt8();
        civilizations[i].units[j].damageGraphics[k].unknown1 = view.getInt8();
        civilizations[i].units[j].damageGraphics[k].unknown2 = view.getInt8();
      }

      civilizations[i].units[j].selectionSound = view.getInt16();
      civilizations[i].units[j].dyingSound = view.getInt16();
      civilizations[i].units[j].attackMode = view.getInt16();

      civilizations[i].units[j].name = view.getString(nameLength).replace(/\0+$/, '');

      civilizations[i].units[j].id2 = view.getInt16();

      if (civilizations[i].units[j].type === UT_AoeTrees) {
        continue ;
      }

      if (civilizations[i].units[j].type < UT_Flag) {
        continue ;
      }

      civilizations[i].units[j].speed = view.getFloat32();

      /* START FIXME */

      if (civilizations[i].units[j].type >= UT_Dead_Fish) {
        view.getBytes(17);
      }

      if (civilizations[i].units[j].type >= UT_Bird) {
        view.getBytes(20);
        view.getBytes(59 * view.getUint16());
      }

      if (civilizations[i].units[j].type >= UT_Projectile) {
        view.getBytes(1);
        view.getBytes(view.getUint16() * 4);
        view.getBytes(view.getUint16() * 4);
        view.getBytes(52);
      }

      if (civilizations[i].units[j].type == UT_Projectile) {
        view.getBytes(9);
      }

      if (civilizations[i].units[j].type >= UT_Creatable) {
        view.getBytes(25);
      }

      if (civilizations[i].units[j].type >= UT_Building) {
        view.getBytes(16);
      }

      /* END FIXME */

    }

  }

  /* RESEARCH */

  var research = new Array(view.getUint16());

  for (i=0; i<research.length; i++) {
    research[i] = {};

    research[i].requiredTechs = new Array(4);
    research[i].requiredTechs[0] = view.getInt16();
    research[i].requiredTechs[1] = view.getInt16();
    research[i].requiredTechs[2] = view.getInt16();
    research[i].requiredTechs[3] = view.getInt16();

    research[i].resourceCosts = new Array(3);

    research[i].resourceCosts[0] = new Array(3);
    research[i].resourceCosts[0][0] = view.getInt16();
    research[i].resourceCosts[0][1] = view.getInt16();
    research[i].resourceCosts[0][2] = view.getInt8();

    research[i].resourceCosts[1] = new Array(3);
    research[i].resourceCosts[1][0] = view.getInt16();
    research[i].resourceCosts[1][1] = view.getInt16();
    research[i].resourceCosts[1][2] = view.getInt8();

    research[i].resourceCosts[2] = new Array(3);
    research[i].resourceCosts[2][0] = view.getInt16();
    research[i].resourceCosts[2][1] = view.getInt16();
    research[i].resourceCosts[2][2] = view.getInt8();

    research[i].RequiredTechCount = view.getInt16();
    research[i].researchLocation = view.getInt16();
    research[i].languageDLLName = view.getUint16();
    research[i].languageDLLDescription = view.getUint16();
    research[i].researchTime = view.getInt16();
    research[i].techageID = view.getInt16();
    research[i].type = view.getInt16();
    research[i].iconID = view.getInt16();
    research[i].buttonID = view.getInt8();
    research[i].languageDLLHelp = view.getInt32();
    research[i].languageDLLName2 = view.getInt32();
    research[i].unknown1 = view.getInt32();

    var nameLength = view.getUint16();
    research[i].name = view.getString(nameLength).replace(/\0+$/, '');

  }

  this.sounds = sounds;
  this.graphics = graphics;
  this.terrains = terrains;
  this.civilizations = civilizations;
  this.research = research;

}

DAT.load = function (path, cb) {
  loadBinaryFile(path, function (err, buffer) {
    if (err) { return cb(err); }

    cb(null, new DAT(buffer));
  })
};

module.exports = DAT;
