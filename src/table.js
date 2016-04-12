var imp_constants = require('constants')

var TASK_DONE = imp_constants.TASK_DONE

var tableRepo = new Array()

function Table(name, defaultTask)
{
    this.AddStateTransition = function(task, status, newTask)
    {
        if(this.transitionTable[task.id] == undefined)
            this.transitionTable[task.id] = new Array()
        this.transitionTable[task.id][status] = newTask
    }

    this.addMoveTransition = function(task, moveTask)
    {
        this.AddStateTransition(task, ERR_NOT_IN_RANGE, moveTask)
        this.AddStateTransition(moveTask, TASK_DONE, task)
        
        this.AddStateTransition(moveTask, OK, moveTask)
        this.AddStateTransition(moveTask, ERR_TIRED, moveTask)
        this.AddStateTransition(moveTask, ERR_NO_PATH, moveTask)
    }

    this.Lookup = function(task, status)
    {
        if(this.transitionTable[task.id] == undefined)
        {
            console.log("Task [" + task.name + "] is not registered in table [" + this.name + "]. Use table.AddStateTransition(task, status, newTask) to register.")
            return undefined
        }
        if(this.transitionTable[task.id][status] == undefined)
        {
            if(Memory.debug)
                console.log("Task [" + task.name + "] does not have transition from [" + status + "] status in table [" + this.name + "].")
            return undefined
        }
        return this.transitionTable[task.id][status]
    }

    this.id = tableRepo.length
    this.name = name
    this.transitionTable = new Array()
    this.transitionTable[-1] = defaultTask
    this.AddStateTransition(defaultTask, ERR_BUSY, defaultTask)

    tableRepo.push(this)
}

exports.Table = Table
exports.GetTableById = function(id) { return tableRepo[id]; }
