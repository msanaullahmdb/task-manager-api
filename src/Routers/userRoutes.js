const express = require('express')
require('../db/mongoose')
const Users = require('../models/user')
const auth = require('../midleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {taskappWelcome} = require('../emails/account')
const {sendCancelMail} = require('../emails/account')

const routers = new express.Router()

routers.post('/users', async (req, res) => {
    const users = new Users(req.body)

    try{
        await users.save()

        //sending mail 
        await taskappWelcome(users.email, users.name)

        const token = await users.generateToken()
        res.status(201).send({users,token})
    } catch(e){
        res.status(400).send(e)
    }
})

routers.post('/users/login', async (req, res) => {
    try{
        const users = await Users.findByCredentials(req.body.email,req.body.password)
        const token = await users.generateToken()
        res.send({ users, token })
    } catch(e){
        res.status(400).send(e)
    }
    
})


routers.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send('You successfully logout')

    } catch(e) {
        res.status(500).send()
    }
})

routers.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send('Succesfully logout from All devices')
    } catch(e){
        res.status(500).send()
    }
})


routers.get('/users/me', auth, async (req,res) => {
    // try{
    //     const users = await Users.find({})
    //     if(!users){
    //         return res.status(404).send('No Users Found!')
    //     }
    //     res.status(200).send(users)
    // } catch(e){
    //     res.status(500).send(e)
    // }
    res.send(req.user)

    
})


// routers.get('/users/:id', async (req,res) => {
//     try{
//         const user = await Users.findById(req.params.id)
//         if(!user) {
//             return res.status(404).send('User Not Found!')
//         }
//         res.status(200).send(user)
//     }catch(e){
//         res.status(500).send(e)
//     }
// })

routers.patch('/users/me', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name','age','email','password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidOperation){
       return res.status(400).send({error: "Invalid Updates"})
    } 
    try{
        //const user = await Users.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators:true})
        
        updates.forEach((update) =>  req.user[update] = req.body[update] )
        await req.user.save()
        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})


routers.delete('/users/me', auth, async (req, res) => {
    try{
        // const user = await Users.findByIdAndDelete(req.user._id)
        // if(!user){
        //     return res.status(404).send('User Not Found')
        // }
        await sendCancelMail(req.user.email, req.user.name)
        await req.user.remove()
        res.send('You successfully removed!')
    } catch(e){
        res.status(500).send(e)
    }
})

//////////////image upload,update,delete and read //////

const upload = multer({
    
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error ('Only jpeg,jpg and png'))
        }
        cb(undefined, true)
    }
})

routers.post('/users/me/avatar',auth ,upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

routers.delete('/users/me/avatar', auth, async (req, res) => {
    
        req.user.avatar = undefined
        await req.user.save()

        res.send()
    
})

routers.get('/users/:id/avatar', async (req, res) => {
    try {
    const users = await Users.findById(req.params.id)
    if(!users | !users.avatar) {
        throw new Error('Avatar not available')
    }
    
        res.set('Content-Type', 'image/png')
        res.send(users.avatar)
    } catch{
        res.status(400).send()
    }
})



////////  End of file operation ///////////


module.exports = routers