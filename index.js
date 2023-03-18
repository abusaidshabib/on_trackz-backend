const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});


async function dbConnect() {
  try {
    await client.connect();
    console.log("Database Connected");
  } catch (error) {
    console.log(error.name, error.message);
    res.send({
      success: false,
      error: error.message,
    });
  }
}

dbConnect();

const STUDENTS = client.db("on-trackz").collection("students");

app.get("/students", async (req, res) => {
  try {
    const cursor = STUDENTS.find({});
    const students = await cursor.toArray();

    res.send({
      success: true,
      data: students,
    });
  } catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }
});

app.get("/students/:subject", async (req, res) => {
  try {
    const subject = req.params.subject;
    const query = { subject: subject }
    const cursor = STUDENTS.find(query);
    const students = await cursor.toArray();

    res.send({
      success: true,
      data: students,
    });
  } catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }
});



const ATTEND = client.db("on-trackz").collection("attend");
app.get("/attend/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const query = { mail: email }
    const attend = await ATTEND.findOne(query);

    res.send({
      success: true,
      data: attend,
    });
  } catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }
});

const NOTICE = client.db("on-trackz").collection("notice");
app.get("/notice", async (req, res) => {
  try {
    const cursor = NOTICE.find({});
    const notice = await cursor.toArray();

    res.send({
      success: true,
      data: notice,
    });
  } catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }
});




// _-------------------

const USERS = client.db("on-trackz").collection("users");


app.post("/report/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    if (data.report === "A") {
      const result = await USERS.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: {
            report: data.date
          }
        }
      )

      res.send({
        success: true,
        data: result,
      });
    }




    else if (data.report === "P") {
      const record = await USERS.findOne({ _id: new ObjectId(id) });
      const updatedRequest = record.report.filter(req => req !== data.date);
      const result = await USERS.updateOne({ _id: new ObjectId(id) }, { $set: { report: updatedRequest } });

      res.send({
        success: true,
        data: result,
      });
    }
  }

  catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }

})


app.get("/student/:id", async (req, res) => {
  try {

    const Id = req.params.id;

    const result = await USERS.find({ classroom: `${Id}` }).toArray();

    res.send({
      success: true,
      data: result,
    });
  }
  catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }
})

app.post("/user", async (req, res) => {
  try {

    const user = req.body;
    const query = {
      email: user.email
    }

    const oldUser = await USERS.find(query).toArray();
    if (oldUser.length) {
      const message = "you have already login"
      return res.send({ acknowledge: false, message })
    }
    const result = await USERS.insertOne(user);

    res.send({
      success: true,
      data: result,
    });
  }

  catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }

})



app.post("/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const roomId = req.body;

    const result = await USERS.updateOne(
      { email: email },
      {
        $push: {
          classroom: roomId.id
        }
      }
    )

    res.send({
      success: true,
      data: result,
    });
  }

  catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }

})

app.get("/user/:email", async (req, res) => {
  try {

    const email = req.params.email;
    const query = {
      email: email
    }

    const result = await USERS.findOne(query);

    res.send({
      success: true,
      data: result,
    });
  }
  catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }
})

app.get("/user", async (req, res) => {
  try {

    const result = await USERS.find().toArray();

    res.send({
      success: true,
      data: result,
    });
  }
  catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }
})


const CLASSROOM = client.db("on-trackz").collection("classroom");

app.get("/classroom/:email", async (req, res) => {
  try {

    const email = req.params.email;
    const query = {
      temail: email
    }
    const result = await CLASSROOM.find(query).toArray();

    res.send({
      success: true,
      data: result,
    });
  }
  catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }
})

app.get("/class/:id", async (req, res) => {
  try {

    const id = req.params.id;
    let query = {
      _id: new ObjectId(`${id}`)
    }
    const result = await CLASSROOM.findOne(query);

    res.send({
      success: true,
      data: result,
    });
  }
  catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }
})

app.post("/classroom", async (req, res) => {
  try {

    const classroom = req.body;
    const result = await CLASSROOM.insertOne(classroom);

    res.send({
      success: true,
      data: result,
    });
  }

  catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }

})

app.post("/classroom/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const email = req.body;
    const result = await CLASSROOM.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          request: email.email
        }
      }
    )

    res.send({
      success: true,
      data: result,
    });
  }
  catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }
});

app.delete("/classroom/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const email = req.body.req;


    const record = await CLASSROOM.findOne({ _id: new ObjectId(id) });

    const updatedRequest = record.request.filter(req => req !== email);

    const result = await CLASSROOM.updateOne({ _id: new ObjectId(id) }, { $set: { request: updatedRequest } });

    res.send({
      success: true,
      data: result,
    });
  }
  catch (error) {
    res.send({
      success: false,
      data: error.message,
    });
  }
})

app.get('/', async (req, res) => {
  res.send("ON_track running")
})

app.listen(port, () => {
  console.log(`ON_track running on port ${port}`)
})

