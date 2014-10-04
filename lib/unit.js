
var DATA = {

  115: ['', 'Tree'],
  130: ['0100510', 'Tree - Ash'],
  131: ['0100511', 'Tree - Beech'],
  136: ['', 'Tree - Oak'],
  139: ['', 'Tree - Oak'],
  138: ['', 'Tree - Oak'],
  137: ['', 'Tree - Oak'],
  135: ['', 'Tree - Palm'],
  197: ['', 'Tree - Palm'],
  194: ['', 'Tree - Palm'],
  193: ['', 'Tree - Palm'],
  192: ['', 'Tree - Palm'],
  149: ['', 'Tree - Pine'],
  153: ['', 'Tree - Pine'],
  150: ['', 'Tree - Pine'],
  151: ['', 'Tree - Pine'],
  152: ['', 'Tree - Pine 1'],
  146: ['', 'Tree - Pine 2'],
  145: ['', 'Tree - Pine 3'],
  144: ['', 'Tree - Pine 4'],
  141: ['0100469', 'Tree - Spruce'],
  140: ['0100623', 'Tree Stump'],
  148: ['0100623', 'Tree Stump'],
  134: ['0100623', 'Tree Stump'],

   83: ['0100657', 'Villager'     ],
  109: ['0100280', 'Town Center'  ]

};

var WARN = {};

function Unit (type) {

  this.type = type;

  if (DATA.hasOwnProperty(type)) {
    this.name = DATA[type][1];
  } else {
    this.name = '<unknown>';
    if (WARN[type] === undefined) {
      WARN[type] = 1;
      console.log('UNKNOWN TYPE: ' + type);
    }
  }


}

Unit.fromRaw = function (view) {

  var x = view.getFloat32();
  var y = view.getFloat32();

  view.getFloat32(); // unknown

  var id = view.getUint32();
  var type = view.getUint16();

  view.getUint8(); // unknown

  var rotation = view.getFloat32();

  var unit = new Unit(type);

  unit.x = x;
  unit.y = y;
  unit.id = id;
  unit.rotation = rotation;

  // NOT IN 1.0c
  // unit.animFrame = view.getUint16();
  // unit.garrisonedIn = view.getUint32();

  return unit;
};

module.exports = Unit;
