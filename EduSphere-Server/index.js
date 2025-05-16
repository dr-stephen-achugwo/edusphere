const express = require("express");
var jwt = require("jsonwebtoken");
const app = express();
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bjzga.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const usersCollection = client.db("EduSphereDB").collection("users");
    const allClassesCollection = client
      .db("EduSphereDB")
      .collection("allClasses");
    const paymentCollection = client.db("EduSphereDB").collection("payment");
    const submissionCollection = client
      .db("EduSphereDB")
      .collection("submission");
    const assignmentCollection = client
      .db("EduSphereDB")
      .collection("assignment");
    const feedbackCollection = client.db("EduSphereDB").collection("feedback");
    const teachOnRequestCollection = client
      .db("EduSphereDB")
      .collection("teachOnRequest");

    // JWT Related API
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "12h",
      });
      res.send({ token });
    });

    // middleware
    const varifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "Unauthorized access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "Unauthorized access" });
        }
        req.decoded = decoded;
        next();
      });
    };

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      next();
    };

    //Payment Intent
    app.post("/create-payment-intent", varifyToken, async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    //Payment Info Post & Enrollment Count
    app.post("/payment", varifyToken, async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentCollection.insertOne(payment);
      // enroll class count update
      const id = payment.id;
      const query = { _id: new ObjectId(id) };
      const enrolClass = await allClassesCollection.findOne(query);
      let newCount = 0;
      if (enrolClass.enrollCount) {
        newCount = enrolClass.enrollCount + 1;
      } else {
        newCount = 1;
      }
      // update class info
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          enrollCount: newCount,
        },
      };
      const updateResult = await allClassesCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(paymentResult);
    });

    //User post
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user Already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //User get by email (useAdmin)
    app.get("/users/admin/:email", varifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "unAuthorized Access" });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    //User get
    app.get("/users", varifyToken, verifyAdmin, async (req, res) => {
      const user = req.body;
      const result = await usersCollection.find(user).toArray();
      res.send(result);
    });

    // User Rool Update by Admin
    app.patch(
      "/users/admin/:id",
      varifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
      }
    );

    // User Delete by Admin
    app.delete("/users/:id", varifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    //User get for Home Page
    app.get("/users/public", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.find(user).toArray();
      res.send(result);
    });

    //Teacher get by email (useTeacher)
    app.get("/users/teacher/:email", varifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "unAuthorized Access" });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let teacher = false;
      if (user) {
        teacher = user?.role === "teacher";
      }
      res.send({ teacher });
    });

    // get All Classes (Admin)
    app.get("/allclasses/admin", varifyToken, verifyAdmin, async (req, res) => {
      const classeses = req.body;
      const result = await allClassesCollection.find(classeses).toArray();
      res.send(result);
    });

    // Post My Class (Teacher )
    app.post("/allclasses", varifyToken, async (req, res) => {
      const allclasse = req.body;
      const result = await allClassesCollection.insertOne(allclasse);
      res.send(result);
    });

    // My Class (Teacher )
    app.get("/allclasses", varifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await allClassesCollection.find(query).toArray();
      res.send(result);
    });

    // get All Classes (Student)
    app.get("/publicclasses", async (req, res) => {
      try {
        const query = { status: "accepted" };
        const result = await allClassesCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to fetch classes" });
      }
    });

    // get Highlight Class (Student)
    app.get("/publicclasses/highlight", async (req, res) => {
      try {
        // Fetch data where status is 'accepted' and sort by enrollCount in descending order
        const query = { status: "accepted" };
        const result = await allClassesCollection
          .find(query)
          .sort({ enrollCount: -1 })
          .limit(6)
          .toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to fetch classes" });
      }
    });

    // My Enroll Class (Student)
    app.get("/myenrollclasses", varifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await paymentCollection.find(query).toArray();
      res.send(result);
    });

    // get Class Details (Student)
    app.get("/publicclasses/:id", varifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allClassesCollection.findOne(query);
      res.send(result);
    });

    // Class Status Update (Admin)
    app.patch(
      "/allclasses/accept/:id",
      varifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: { status: "accepted" } };
        const result = await allClassesCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
    );

    // Class Status Update (Admin)
    app.patch(
      "/allclasses/reject/:id",
      varifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = { $set: { status: "rejected" } };
        const result = await allClassesCollection.updateOne(filter, updateDoc);
        res.send(result);
      }
    );

    // My Enroll Class Details (Student)
    app.get("/myclass/:id", varifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allClassesCollection.findOne(query);
      res.send(result);
    });

    // Update Class (Teacher)
    app.patch("/allclasses/:id", varifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedClass = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: updatedClass,
      };

      try {
        const result = await allClassesCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (error) {
        console.error("Error updating class:", error);
        res.status(500).send({ message: "Failed to update class." });
      }
    });

    // Delete Class (Teacher)
    app.delete("/allclasses/:id", varifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allClassesCollection.deleteOne(query);
      res.send(result);
    });

    // Accept Teacher Request (Admin)
    app.patch(
      "/teachonrequest/acceptteacher/:id",
      varifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: "teacher",
          },
        };

        // Update role in teachOnRequestCollection
        const result = await teachOnRequestCollection.updateOne(
          filter,
          updatedDoc
        );

        // Fetch the requester's email
        const teachRequest = await teachOnRequestCollection.findOne(filter);

        if (teachRequest?.email) {
          // Update or create the user's role in usersCollection
          const userFilter = { email: teachRequest.email };
          const userUpdate = {
            $set: {
              role: "teacher",
            },
          };
          await usersCollection.updateOne(userFilter, userUpdate, {
            upsert: true,
          });
        }

        res.send(result);
      }
    );

    // Reject Teacher Request (Admin)
    app.patch(
      "/teachonrequest/rejectteacher/:id",
      varifyToken,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };

        // Check if the current role is not already "rejected"
        const teachRequest = await teachOnRequestCollection.findOne(filter);

        if (teachRequest?.role !== "rejected") {
          const updatedDoc = {
            $set: {
              role: "rejected",
            },
          };
          const result = await teachOnRequestCollection.updateOne(
            filter,
            updatedDoc
          );

          // Optionally, you can update the role in the `usersCollection` as well
          if (teachRequest?.email) {
            const userFilter = { email: teachRequest.email };
            const userUpdate = {
              $set: {
                role: "rejected",
              },
            };
            await usersCollection.updateOne(userFilter, userUpdate, {
              upsert: true,
            });
          }

          res.send(result);
        } else {
          res.send({ message: "Role is already 'rejected'" });
        }
      }
    );

    // Post Teacher Request (Teacher)
    app.post("/teachonrequest", varifyToken, async (req, res) => {
      const teachonrequest = req.body;
      const result = await teachOnRequestCollection.insertOne(teachonrequest);
      res.send(result);
    });

    // get Teacher Request (Admin)
    app.get("/teachonrequest", varifyToken, async (req, res) => {
      const teachOnRequest = req.body;
      const result = await teachOnRequestCollection
        .find(teachOnRequest)
        .toArray();
      res.send(result);
    });

    // Update Teacher Request (Student)
    app.patch("/teachonrequest/:id", varifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "pending",
        },
      };
      const result = await teachOnRequestCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });

    // Assignment Post & Assignment Count
    app.post("/assignments", varifyToken, async (req, res) => {
      const assignment = req.body;
      const assignmentResult = await assignmentCollection.insertOne(assignment);
      // assignment count update
      const id = assignment.id;
      const query = { _id: new ObjectId(id) };
      const assignmentClass = await allClassesCollection.findOne(query);
      let newCount = 0;
      if (assignmentClass.assignmentCount) {
        newCount = assignmentClass.assignmentCount + 1;
      } else {
        newCount = 1;
      }
      // update class info
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          assignmentCount: newCount,
        },
      };
      const updateResult = await allClassesCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(assignmentResult);
    });

    // API to fetch Assignment data by ID
    app.get("/assignments/:id", varifyToken, async (req, res) => {
      const id = req.params.id; // Get "id" from request
      try {
        const query = { id: id };
        const result = await assignmentCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching data", error });
      }
    });

    // Assignment Submission post
    app.post("/assignmentsubmission", varifyToken, async (req, res) => {
      const submissionData = req.body;
      const submissionResult = await submissionCollection.insertOne(
        submissionData
      );
      // assignment count update
      const id = submissionData.id;
      const query = { _id: new ObjectId(id) };
      const submissionAssignment = await allClassesCollection.findOne(query);
      let newCount = 0;
      if (submissionAssignment.submissionCount) {
        newCount = submissionAssignment.submissionCount + 1;
      } else {
        newCount = 1;
      }
      // update class info
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          submissionCount: newCount,
        },
      };
      const updateResult = await allClassesCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(submissionResult);
    });

    // FeedBack post
    app.post("/feedback", varifyToken, async (req, res) => {
      const feedbackData = req.body;
      const result = await feedbackCollection.insertOne(feedbackData);
      res.send(result);
    });

    // FeedBack get
    app.get("/feedback", async (req, res) => {
      const feedbackData = req.body;

      const result = await feedbackCollection.find(feedbackData).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// routes
app.get("/", (req, res) => {
  res.send("EduSphere-Server is Running....");
});

app.listen(port, () => {
  console.log(`EduSphere-Server is running on port ${port}`);
});
