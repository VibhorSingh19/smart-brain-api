const express=require('express');
const bodyParser=require('body-parser');
const bcrypt=require('bcrypt-nodejs');
const cors= require('cors');
const app=express();
const knex=require('knex');


app.use(bodyParser.json());
app.use(cors());

const db=knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'Vibh0r',
    database : 'smartbrain'
  }
});
//db.select('*').from('users').then(data=>{
//	console.log(data);
//});
const database={
	user: [
     {
     	id:'123',
     	name:'Vibhor',
     	email:'vibhor@gmail.com',
     	password:'vibhor',
     	entries:0,
     	joined:new Date()
     },
     {
     	id:'124',
     	name:'Shubh',
     	email:'Shubh@gmail.com',
     	password:'pass',
     	entries:0,
     	joined:new Date()
     }
	]
}
app.get('/',(req,res)=>{

	res.send(database.user);
})
app.post('/signin',(req,res)=>{
     if(req.body.email===database.user[0].email&&req.body.password===database.user[0].password)
     {
     	res.json("success");
     }
     else
     {
        res.status(400).json("unable to connect");
	}
})
app.post('/register',(req,res)=>{

	const {name,email,pass}=req.body;
	
    bcrypt.hash(pass, null, null, function(err, hash) {
     console.log(hash);
    });
	db('users')
    .returning('*')
	.insert ({
    email:email,
    name:name,
    joined:new Date()

	}).then(user=>{
		res.json(user[0]);
	})
	.catch(err=>res.status(400).json('Unable to register...'))
})
app.get('/profile/:id',(req,res)=>
{
	const {id}=req.params;
	db.select('*').from('users').where({id:id}).then(user=>{
		if(user.length)
		{
			res.json(user[0]);
		}	
		else
		{
			res.status(400).json('User not found');
		}
		
	})
})
app.put('/image',(req,res)=>{
	const {id}=req.body;
	db('users').where('id', '=', id)
  .increment('entries',1)
  .returning('entries')
  .then(entries=>{
  	res.json(entries[0]);
  })
  .catch(err=>res.status(400).json('Unable to get entries'))
})

/*
// Load hash from your password DB.
bcrypt.compare("bacon", hash, function(err, res) {
    // res == true
});
bcrypt.compare("veggies", hash, function(err, res) {
    // res = false
});
*/
app.listen(3000,()=>{
	console.log("Running in port 3000....");
})