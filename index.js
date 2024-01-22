const express = require('express');
const cors = require('cors');
const {connectToMongoDB} = require('./db');
const {ObjectId} = require("mongodb");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

async function main() {
  try {
    const db = await connectToMongoDB();
    console.log('Connected to MongoDB');

    app.get('/', (req, res) => {
      res.send('Route Test');
    });

    app.get('/routines', async (req, res) => {
        try {
          const routines = await db.collection('routines').find({}).toArray();
          const tags = await db.collection('tags').find({}).toArray();
          const tagMap = {};
      
          for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            tagMap[tag._id] = tag.name;
          }
      
          for (let j = 0; j < routines.length; j++) {
            const routine = routines[j];
            if (Array.isArray(routine.tags)) {
              for (let k = 0; k < routine.tags.length; k++) {
                const tagId = routine.tags[k];
                if (tagMap[tagId]) {
                  routine.tags[k] = tagMap[tagId];
                }
              }
            }
          }
      
          res.json(routines);
        } catch (error) {
          res.status(500).json({message: 'Error fetching routines', error: error.message});
        }
      });
  
    app.get('/routines/:id', async (req, res) => {
        try {
        const id = new ObjectId(req.params.id);
        const routine = await db.collection('routines').findOne({_id: id});
        if (routine) {
            res.json(routine);
        } else {
            res.status(404).json({message: 'Routine not found'});
        }
        } catch (error) {
        res.status(500).json({message: 'Error fetching routine', error: error.message});
        }
    });

    app.post('/routines', async (req, res) => {
      try {
        const {name, workout_duration, difficulty, category, tags, routine} = req.body;
    
        if (!name || !workout_duration || !difficulty || !category || !tags || !routine) {
          return res.status(400).json({message: 'Missing required fields'});
        }
    
        const newRoutine = {name, workout_duration, difficulty, category, tags, routine};
        const result = await db.collection('routines').insertOne(newRoutine);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({message: 'Error adding new routine', error: error.message});
      }
    });

    app.put('/routines/:id', async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        const { name, workout_duration, difficulty, category, tags, routine } = req.body;
    
        if (!name || !Array.isArray(routine) || routine.length === 0) {
          return res.status(400).json({ message: 'Name and routine required, and routine should be a non-empty array.' });
        }
    
        const updateData = {name, workout_duration, difficulty, category, tags, routine};
        const result = await db.collection('routines').updateOne(
          {_id: id},
          {$set: updateData}
        );
    
        if (result.modifiedCount === 0) {
          return res.status(404).json({message: 'No routine found with this ID, or no new data provided'});
        }
    
        res.json({ message: 'Routine updated successfully' });
      } catch (error) {
        res.status(500).json({message: 'Error updating routine', error: error.message});
      }
    });
    
    app.delete('/routines/:id', async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        const routine = await db.collection('routines').findOne({_id: id});
        if (routine) {
          const result = await db.collection("routines").deleteOne({
            _id: id
          });
          res.json({message: 'Routine deleted successfully'});
        } else {
            res.status(404).json({message: 'Routine not found'});
        }
      } catch (error) {
        res.status(500).json({message: 'Error deleting routine', error: error.message});
      }
    });
  
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
}

main();