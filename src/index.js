require('./db/mongoose')
const express = require('express')
const UserRouters = require('./Routers/userRoutes')
const TaskRouter = require('./Routers/taskRoutes')
const auth = require('./midleware/auth')

const app = express()

const port = process.env.PORT
////////////////////////////// Start Midleware //////////////////////////////////////

// //Simple example 

// app.use((req,res,next)=>{
//     console.log('midleware')
//     next() //start to response
// })


//Strict prevent to access GET route mothods

// app.use((req,res,next)=> {
//     if(req.method === 'GET'){
//         console.log('You Don\'t have a permission to access')
//     } else {
//         next()
//     }
// })


// // 503 Site is under maintenance

// app.use((req,res,next)=>{
//     res.status(503).send('Website is under maintenance')
// })


//External file midleware 
    // midleware -> auth.js

    

///////////////////////// End Midleware ///////////////////////////////////////


/////////////////////// FILE UPLOADING /////////////////////////////////


const multer = require('multer')

const upload = multer({
    dest: 'images',
    // validating image
    limits: {
        fileSize: 1000000
    },
    fileFilter (req, file, cb) {
        if(!file.originalname.match(/\.(pdf|doc|docx)$/)){
            return cb(new Error ('Only pdf,docx and doc file acceptable')) 
        }
        cb(undefined,true)
    }
})

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message})
})

//////////////////// END OF UPLOADING ////////////////////////////


app.use(express.json())

app.use(UserRouters)
app.use(TaskRouter)

app.listen(port, () => {
    console.log('Server up on port ' + port)
})

// const Task = require('./models/task')
// const User = require('./models/user')
// const main = async () => {
//     // const task = await Task.findById('5f38edb93f9278105030c76f')
//     // await task.populate('owner').execPopulate()
//     // console.log(task.owner)

//     const user = await User.findById('5f2fd05cf116b305b0b94f32')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }
// main()