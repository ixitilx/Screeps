'use strict';

const {assert, createArray} = require('utils.prototype');

const planEncodeMap = {
    'wall' : '#',
    'plain': ' ',
    'swamp': '*',
    STRUCTURE_SPAWN: 'O',
    STRUCTURE_EXTENSION: 'o',
    STRUCTURE_STORAGE: 'S',
    STRUCTURE_LINK: 'i',
    STRUCTURE_TOWER: 'T',
    STRUCTURE_OBSERVER: '?',
    STRUCTURE_POWER_SPAWN: '!',
    STRUCTURE_EXTRACTOR: 'E',
    STRUCTURE_LAB: 'L',
    STRUCTURE_TERMINAL: '$',
    STRUCTURE_CONTAINER: 'c',
    STRUCTURE_NUKER: 'N',

    STRUCTURE_CONTROLLER: '@',
    // STRUCTURE_PORTAL: "portal",
    // STRUCTURE_POWER_BANK: "powerBank",
    // STRUCTURE_KEEPER_LAIR: "keeperLair",

    STRUCTURE_ROAD: '~',
    STRUCTURE_WALL: '=',
    // STRUCTURE_RAMPART: "rampart",
};

const planDecodeMap = _.invert(planEncodeMap);

function isInRoom(p) {
    return (0 <= p.x && p.x < 50) && (0 <= p.y && p.y < 50);
};

function posAround(p, pos) {
    const out = [];
    [-1, 0, 1].forEach(dy =>
        [-1, 0, 1].forEach(function(dx) {
            const pt = {x: p.x + dx, y: p.y + dy};
            if (isInRoom(pt) && pos[pt.y][pt.x]===false) {
                out.push(pt);
                pos[pt.y][pt.x] = true;
            }
        }));
    return out;
};

function buildDistanceMap(positions, terrainMap) {
    if (!_.isArray(positions) && positions.x && positions.y)
        positions = [positions];

    const out = Array.from({length: 50}, v => Array.from({length: 50}, vv => null));
    const pos = Array.from({length: 50}, v => Array.from({length: 50}, vv => false));
    
    let queue = positions.map(p => _.pick(p, ['x', 'y']));
    queue.forEach(p => pos[p.y][p.x] = true);

    let score;
    for (score = 0; queue.length > 0; score++) {
        queue.filter(p => terrainMap[p.y][p.x] !== '#')
             .forEach(p => out[p.y][p.x] = score);

        queue = _(queue).map(p => posAround(p, pos)).flatten().value();
        queue = _.filter(queue, p => terrainMap[p.y][p.x] !== '#');
        queue = _.filter(queue, p => out[p.y][p.x] === null);
    };

    return {distanceMap: out, maxScore: score-1};
};

function hexColorFromWeight(weight) {
    return _.padLeft(Math.floor(255*weight).toString(16), 2, '0');
    // const color = Math.floor(Math.min(255, Math.max(256 * weight, 0)));
    // const hexcolor = _.padLeft(color.toString(16), 2, '0');
    // return hexcolor;
};

function colorFromWeight(weight) {
    if (weight !== null && 0 <= weight && weight <= 1) {
        const invWeight = 1 - weight;
        const red = hexColorFromWeight(weight);
        const green = hexColorFromWeight(invWeight);
        const color = `#${red}${green}00`;
        return color;
    }
    return null;
};

function normalizeRow(row, maxScore) {
    return row.map(value => value === null ? null : value/maxScore);
};

function buildColorMap(distanceMap, maxScore) {
    assert(maxScore>0, `maxScore(${maxScore}) must be a positive integer`);
    const normMap = distanceMap.map(row => normalizeRow(row, maxScore));
    const colorMap = normMap.map(row => row.map(colorFromWeight));
    return colorMap;
};

function drawRow(room, y, row) {
    // const drawLog = function(value, x) {
    //     console.log(`Drawing ${x}, ${y}, ${value}`);
    //     visual.circle(x, y, value)
    // };
    row.forEach((value, x) => room.visual.circle(x, y, {fill:value}));
    // row.forEach(drawLog);
};

function drawSomething(room) {
    console.log('-'.repeat(80));

    const sourcePos = _.map(room.find(FIND_SOURCES), 'pos');
    let cpu = Game.cpu.getUsed();
    let cpy;

    const terrainMap = room.scanTerrain();
    cpy = Game.cpu.getUsed();
    console.log('terrainMap', cpy-cpu);
    cpu = cpy;

    const {distanceMap, maxScore} = buildDistanceMap(sourcePos, terrainMap);
    cpy = Game.cpu.getUsed();
    console.log('distanceMap', cpy-cpu, maxScore);
    cpu = cpy;

    const colorMap = buildColorMap(distanceMap, maxScore);
    cpy = Game.cpu.getUsed();
    console.log('colorMap', cpy-cpu);
    cpu = cpy;

    colorMap.forEach((row, y) => drawRow(room, y, row));
    cpy = Game.cpu.getUsed();
    console.log('drawCircle', cpy-cpu);
};

module.exports = drawSomething;
