const express = require('express')
require('../db/mongoose')
const Task = require('../models/task')
const auth = require('../midleware/auth')

const routers = new express.Router()


routers.post('/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

routers.get('/tasks',auth ,async (req,res) => {
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sortBy){
        const part = req.query.sortBy.split(":")
        sort[part[0]] = part[1] === 'desc' ? -1 : 1
    }
    try{
        //const tasks = await Task.find()
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch(e){
        res.status(500).send(e)
    }
    
})

routers.get('/tasks/:id',auth, async (req,res) => {
    const _id = req.params.id
    try{
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if(!task) {
            return res.status(404).send('Task Not Found!')
        }
        res.status(200).send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

routers.patch('/tasks/:id',auth ,async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed','description']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Updates'})
    }
    try{
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send('Task Not Found!')
        }
        
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

routers.delete('/tasks/:id',auth ,async (req, res) => {
    try{
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send('Task Not Found')
        }
        res.send(task)
    } catch(e){
        res.status(500).send(e)
    }
})

module.exports = routers