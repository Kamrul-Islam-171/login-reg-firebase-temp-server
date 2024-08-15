/*

=========================================================

npm install express dotenv mongodb cors jsonwebtoken

=========================================================

*/

const express = require('express')
const cors = require('cors');
const app = express()

const port = process.env.PORT || 5000;
require('dotenv').config()
var jwt = require('jsonwebtoken');




app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,

}))



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.insvee7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyToken = (req, res, next) => {
  // console.log('inside = ', req.headers.authorization);
  if (!req.headers.authorization) {


    return res.status(401).send({ message: 'Forbidden-Access' })
  }
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {

      return res.status(401).send({ message: 'Forbidden-Access' });
    }
    req.decoded = decoded;

    next();
  });

}



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const userCollection = client.db('Log-reg-temp').collection('users');
    


    app.post('/jwt', async (req, res) => {
      const user = req.body;
    
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '8h' });
      res.send({ token })
    })

    // const verifyHR = async (req, res, next) => {
    //   const email = req.decoded.email;
    //   const query = { email: email };
    //   const user = await userCollection.findOne(query);
    //   const isHr = user?.role === 'HR';
    //   if (!isHr) {
    //     return res.status(403).send({ message: 'forbidden-access' })
    //   }
    //   next();
    // }



    app.put('/user', async (req, res) => {
      const user = req.body;
      console.log(user);
      const query = { email: user?.email };
      const findUser = await userCollection.findOne(query);
      if (findUser) {
        const option = {
            $set : {
                ...user
            }
        }
        await userCollection.updateOne(query, option);
        return;
      }
      // console.log(user)
      const result = await userCollection.insertOne(user);
      res.send(result);
    })


    app.put('/username-image-update', async (req, res) => {
      const user = req.body;
      // console.log(user)
      const query = { email: user?.email };
      const doc = {
        $set: {
          ...user
        }
      }
      const result = await userCollection.updateOne(query, doc);
      res.send(result);
    })

    


    

    //get-user-info
    app.get('/get-user-info/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result)
    })

    




    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Login-reg-temp!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})