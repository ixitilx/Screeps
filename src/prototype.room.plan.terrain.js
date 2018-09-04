'use strict';

const {assert} = require('utils.prototype');

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

class Plan {
    static encode(objectType) {
        const ret = planEncodeMap[objectType];
        if (ret)
            return ret;
        throw new Error(`Unknown object type: ${objectType}`);
    };

    static decode(planChar) {
        const ret = planDecodeMap[planChar];
        if (ret)
            return ret;
        throw new Error(`Unknown plan character: ${planChar}`);
    };
};

function mapIndex(x, y) {
    assert(x>=0 && y>=0, `Invalid coordinates: ${x}, ${y}`);
    return 50*y + x;
};

function unmapIndex(idx) {
    assert(0 <= idx && idx < 50*50, `Index is outside of the room: ${idx}`);
    return {x: (idx % 50), y: Math.floor(idx/50)};
};

function mapLookup(roomMap, x, y) {
    return roomMap[mapIndex(x, y)];
};

function scanRow(room, rowIdx) {
    return room.lookForAtArea(LOOK_TERRAIN, rowIdx, 0, rowIdx, 49, true)
                    .map(rec => Plan.encode(rec.terrain))
                    .join('');
};

function buildTerrainMap(room) {
    return Array.from({length: 50}, (v, i) => scanRow(room, i));
};

function isInRoom(p) {
    return (0 <= p.x && p.x < 50) && (0 <= p.y && p.y < 50);
};

function posAround(p, pos) {
    const out = [];
    [-1, 0, 1].forEach(dy =>
        [-1, 0, 1].forEach(function(dx) {
            const p = {x: p.x + dx, y: p.y + dy};
            if (isInRoom(p) && !pos[p.y][p.x]) {
                out.push(p);
                pos[p.y][p.x] = true;
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
        // queue = _.uniq(queue, false, p => mapIndex(p.x, p.y));
        queue = _.filter(queue, p => terrainMap[p.y][p.x] !== '#');
        queue = _.filter(queue, p => out[p.y][p.x] === null);
    };

    return {distanceMap: out, maxScore: score-1};
};

function hexColorFromWeight(weight) {
    const color = Math.floor(Math.min(255, Math.max(256 * weight, 0)));
    const hexcolor = _.padLeft(color.toString(16), 2, '0');
    return hexcolor;
};

function colorFromWeight(weight) {
    if (0 <= weight && weight <= 1) {
        const invWeight = 1 - weight;
        const red = hexColorFromWeight(weight);
        const green = hexColorFromWeight(invWeight);
        const color = `#${red}${green}00`;
        return color;
    }
    return null;
};

function normalizeValue(value, idx, maxScore) {
    const {x, y} = unmapIndex(idx);
    const color = colorFromWeight(value / maxScore);
    return {x: x, y: y, c: color};
};

function buildColorMap(distanceMap, maxScore) {
    return _(distanceMap).map((v, i) => normalizeValue(v, i, maxScore))
                         .filter(obj => obj.color !== null)
                         .value();
};

const tm_ = {};
const dm_ = {};
const cm_ = {};

function drawSomething(room) {
    console.log('-'.repeat(80));

    let cpu = Game.cpu.getUsed();
    const terrainMap = room.name in tm_ ?
                       tm_[room.name] :
                       tm_[room.name] = buildTerrainMap(room);

    // const terrainMap = buildTerrainMap(room);
    console.log('terrainMap', Game.cpu.getUsed()-cpu);
    cpu = Game.cpu.getUsed();

    const sourcePos = _.map(room.find(FIND_SOURCES), 'pos');
    // const {distanceMap, maxScore} = room.name in dm_ ?
    //                    dm_[room.name] :
    //                    dm_[room.name] = buildDistanceMap(sourcePos, terrainMap);
    const {distanceMap, maxScore} = buildDistanceMap(sourcePos, terrainMap);
    console.log('distanceMap', Game.cpu.getUsed()-cpu);
    cpu = Game.cpu.getUsed();

    const colorMap = room.name in cm_ ?
                     cm_[room.name] :
                     cm_[room.name] = buildColorMap(distanceMap, maxScore);
    console.log('colorMap', Game.cpu.getUsed()-cpu);
    cpu = Game.cpu.getUsed();

    _.each(colorMap, c => room.visual.circle(c.x, c.y, {fill: c.c}));
    console.log('drawCircle', Game.cpu.getUsed()-cpu);
};

module.exports = drawSomething;