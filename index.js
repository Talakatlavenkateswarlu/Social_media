import express, { request } from 'express'
import hbs from 'hbs'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { readPosts, readUser, insertUser, insertPost, likeFun, shareFun, deleteFun} from './operations.js'
const app = express()
// const path = require('node:path')

app.set('view engine', 'hbs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cookieParser())

app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname,'login.html'))
    res.render("login")
    
})

app.post('/login', async (req, res) => {
    const output = await readUser(req.body.profile)
    const password = output[0].password
    if (password === req.body.password) 
       {
        const secret = "a56a1923b570596420b1107160f41f32496024b9f29714beebecfb5732fab6453ac14ded37db64225e277182f08e34ec5a09fa41950836cb2d05e983145207f3"
        const paylod = { "profile":output[0].profile, "name":output[0].name, "headline":output[0].headline}
        const token = jwt.sign(paylod,secret)
      
        
        res.cookie("token", token)
        res.redirect("/posts")
    }
    else {

        res.send("Incorrect userName or Password")
    }
    
})

app.get('/posts',verifyLogin, async(req, res)=> {
    const output = await readPosts()
    res.render("posts", {
        data:output,
        userInfo:req.payload
    })
})

app.post('/addposts',async (req,res)=>{
    await insertPost(req.body.profile, req.body.content)
    res.redirect("/posts")

})

function verifyLogin(req,res, next){
    const secret = "a56a1923b570596420b1107160f41f32496024b9f29714beebecfb5732fab6453ac14ded37db64225e277182f08e34ec5a09fa41950836cb2d05e983145207f3"
    const token = req.cookies.token
    jwt.verify(token, secret, (err, payload)=>{
        if(err) return res.sendStatus(403)
        req.payload = payload
    })
    next()
}

app.post('/adduser',async (req, res)=>{
    if(req.body.password === req.body.cnfpassword)
    {
        await insertUser(req.body.name, req.body.profile, req.body.password, req.body.headline)
        res.redirect('/')

    }
    else
    {
        res.send("password and Confirm password Did Not Match")

    }
    
})

app.get('/register',(req, res)=>{
    res.render("register")
})
app.post('/like',async (req,res)=>{
    await likeFun(req.body.content)
    res.redirect('/posts')

})
app.post('/share',async (req,res)=>{
    await shareFun(req.body.content)
    res.redirect('/posts')

})
app.post('/delete',async (req,res)=>{
    await deleteFun(req.body.content)
    res.redirect('/posts')

})
app.listen(3000, () => {
    console.log("Listening...")
})
