var constants = require('constants')

function MoveTo(creep, dst)
{
    if(creep.pos.getRangeTo(dst)<=1)
        return constants.TASK_DONE
    if(Memory.autoBuildRoad && Memory.autoBuildRoad == 1)
        creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD)
    return creep.moveTo(dst)
}

function MoveToId(creep, id)
{
    return MoveTo(creep, Game.getObjectById(id))
}

function MoveToSource(creep)        { return MoveToId(creep, creep.memory.sourceId); }
function MoveToStorage(creep)       { return MoveToId(creep, creep.memory.storageId); }
function MoveToController(creep)    { return MoveTo(creep, creep.room.controller); }
function MoveToSite(creep)
{
    if(creep.memory.siteId)
        return MoveToId(creep, creep.memory.siteId)
    return constants.TASK_DONE
}

function HarvestEnergy(creep)
{
    if(_.sum(creep.carry) >= creep.carryCapacity)
        return constants.TASK_DONE

    var source = Game.getObjectById(creep.memory.sourceId)
    return creep.harvest(source)
}

function StoreEnergy(creep)
{
    var storage = Game.getObjectById(creep.memory.storageId)
    if((storage.energyCapacity - storage.energy) < creep.carry.energy)
        return ERR_FULL
    return creep.transfer(storage, RESOURCE_ENERGY)
}

function UpgradeController(creep)
{
    var controller = creep.room.controller
    return creep.upgradeController(controller)
}

function Build(creep)
{
    if(creep.memory.siteId == undefined)
    {
        console.log('build:undef')
        return constants.TASK_DONE
    }

    var site = Game.getObjectById(creep.memory.siteId)
    var ret = creep.build(site)
    if(ret == ERR_INVALID_TARGET)
    {
        console.log('build:inval')
        delete creep.memory.siteId
        return constants.TASK_DONE
    }
    return ret
}

exports.MoveToSourceTask        = TaskFromDoFunc('MoveToSource',        MoveToSource)
exports.MoveToStorageTask       = TaskFromDoFunc('MoveToStorage',       MoveToStorage)
exports.MoveToControllerTask    = TaskFromDoFunc('MoveToController',    MoveToController)
exports.MoveToSiteTask          = TaskFromDoFunc('MoveToSite',          MoveToSite)

exports.HarvestEnergyTask       = TaskFromDoFunc('HarvestEnergy',       HarvestEnergy)
exports.StoreEnergyTask         = TaskFromDoFunc('StoreEnergy',         StoreEnergy)
exports.UpgradeControllerTask   = TaskFromDoFunc('UpgradeController',   UpgradeController)
exports.BuildTask               = TaskFromDoFunc('Build',               Build)
