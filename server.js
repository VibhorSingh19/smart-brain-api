const express=require('express');
const bodyParser=require('body-parser');
const bcrypt=require('bcrypt-nodejs');
const cors= require('cors');
const app=express();
const knex=require('knex');
const Clarifai=require('clarifai');
app.use(bodyParser.json());
app.use(cors());

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const db=knex({
  client: 'pg',
  connection: {
    //connectionString : process.env.DATABASE_URL,
    //ssl:true,
          connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
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

	res.send("connected..");
})
app.post('/signin',(req,res)=>{
     db.select('email','hash').from('login')
     .where('email','=',req.body.email)
     .then(data=>{
     const isValid=bcrypt.compareSync(req.body.password,data[0].hash);
     if(isValid)
     {
        return db.select('*').from('users')
        .where('email','=',req.body.email)
        .then(user=>{
            res.json(user[0])
        })
        .catch(err=>res.status(400).json("Unable to get user.."))
    }
    else{
        res.status(400).json("Wrong credentials..");
    }
        
     })
     .catch(err=>res.status(400).json("Wrong credentials.."))
})
app.post('/register',(req,res)=>{

    const {name,email,password}=req.body;
    if(!name || !email || !password)
    {
        res.status(400).json('Wrong inputs..');
    }
    else
    {
      const hash = bcrypt.hashSync(password);
    db.transaction(trx=>{

        trx.insert({
            hash:hash,
            email:email
        })
        .into('login')
        .returning('email')
        .then(loginEmail=>{
            return trx ('users')
            .returning('*')
            .insert({
                email:loginEmail[0],
                name:name,
                joined:new Date()
            })
            .then(user=>{
                res.json(user[0]);
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    .catch(err=>res.status(400).json('Unable to register...'))  
    }
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
    console.log(id);
	db('users').where('id', '=', id)
  .increment('entries',1)
  .returning('entries')
  .then(entries=>{
  	res.json(entries[0]);
  })
  .catch(err=>res.status(400).json('Unable to get entries'))
})

const app1 = new Clarifai.App({
 apiKey: '6744cbc8104940eba90468d428f3383f'
});

app.post('/imageurl',(req,res)=>{

   console.log(req.body.input);
    app1.models
    .predict(Clarifai.FACE_DETECT_MODEL,req.body.input)
    .then(data=>{
        res.json(data);
    })
    .catch(err=>res.status(400).json('Unable to fetch API.'))
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
app.listen(process.env.PORT||3000,()=>{
	console.log("Running in port ${process.env.PORT}");
})