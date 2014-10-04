
var DATA = {
   0: ['1500101', 'Grass',       '#697632'],
   1: ['1500201', 'Water',       '#41639d'],
   2: ['2000001', 'Shore',       '#f7b442'],
   4: ['1500201', 'Shallows',    '#789cc5'],
   6: ['1500001', 'Desert',      '#cba24d'],
  10: ['1500101', 'Forest',      '#314b20'],
  13: ['1500001', 'Palm Desert', '#b38b37'],
  19: ['1500101', 'Pine Forest', '#314b20'],
  20: ['1500101', 'Jungle',      '#314b20'],
  22: ['1500301', 'Deep Water',  '#0f3179']
};

function Terrain (id) {

  this.id = id;
  this.elev = 0;

  this.assetId = DATA[id][0];
  this.name = DATA[id][1];
  this.color = DATA[id][2];

}

module.exports = Terrain;
