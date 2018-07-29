function analyze(source) {
    analyze_findHarvesterPositions(source)
    analyze_findContainerPosition(source)
    analyze_releaseUselessHarvesters(source)
    analyze_requestHarvesters(source)
    analyze_requestContainer(source)
    analyze_requestRoad(source)
}

function analyze_findHarvesterPositions(source) {
    var pos = source.pos;
    var terra = source.room.lookForAtArea(LOOK_TERRAIN,
                                          pos.y-1,
                                          pos.x-1,
                                          pos.y+1,
                                          pos.x+1,
                                          true)
    var spots = _(terra).filter(t => t.terrain != 'wall')
                        .map(t => new RoomPosition(t.x, t.y, source.room.name))
                        .value()
    console.log(JSON.stringify(spots))
}

function analyze_findContainerPosition(source) {

}

function analyze_releaseUselessHarvesters(source) {

}

function analyze_requestHarvesters(source) {

}

function analyze_requestContainer(source) {

}

function analyze_requestRoad(source) {

}

function operate(source) {

}

exports.analyze = analyze
exports.operate = operate
