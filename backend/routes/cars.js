const express = require('express');
const router = express.Router();
const pool = require('../database');

// add new car 
router.post('/cars', async (req, res) => {
  try {
    const {
      car_name,
      mpg,
      cylinders,
      displacement,
      horsepower,
      weight,
      acceleration,
      model_year,
      origin
    } = req.body;

    // validate required fields
    if (!car_name || !mpg || !cylinders || !displacement || !horsepower || 
        !weight || !acceleration || !model_year || !origin) {
      return res.status(400).send('All fields are required');
    }

    const query = `
      INSERT INTO cars (
        car_name, mpg, cylinders, displacement, 
        horsepower, weight, acceleration, model_year, origin
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      car_name,
      parseFloat(mpg),
      parseInt(cylinders),
      parseFloat(displacement),
      parseInt(horsepower),
      parseInt(weight),
      parseFloat(acceleration),
      parseInt(model_year),
      parseInt(origin)
    ];

    const result = await pool.query(query, values);
    
    console.log('Car added successfully:', result.rows[0]);
    res.redirect('/index.html'); // redirect back to home after success
    
  } catch (err) {
    console.error('Error adding car:', err.message);
    res.status(500).send('Server error: Could not add car to database');
  }
});

// get all cars
router.get('/cars', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cars:', err.message);
    res.status(500).json({ error: 'Could not fetch cars' });
  }
});

// get single car by ID
router.get('/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching car:', err.message);
    res.status(500).json({ error: 'Could not fetch car' });
  }
});

// modify existing car
router.put('/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      car_name,
      mpg,
      cylinders,
      displacement,
      horsepower,
      weight,
      acceleration,
      model_year,
      origin
    } = req.body;

    const query = `
      UPDATE cars 
      SET car_name = $1, mpg = $2, cylinders = $3, displacement = $4,
          horsepower = $5, weight = $6, acceleration = $7, 
          model_year = $8, origin = $9
      WHERE id = $10
      RETURNING *
    `;

    const values = [
      car_name,
      parseFloat(mpg),
      parseInt(cylinders),
      parseFloat(displacement),
      parseInt(horsepower),
      parseInt(weight),
      parseFloat(acceleration),
      parseInt(model_year),
      parseInt(origin),
      parseInt(id)
    ];

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).send('Car not found');
    }
    
    console.log('Car updated successfully:', result.rows[0]);
    res.redirect('/index.html');
    
  } catch (err) {
    console.error('Error updating car:', err.message);
    res.status(500).send('Server error: Could not update car');
  }
});

// remove a car
router.delete('/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM cars WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).send('Car not found');
    }
    
    console.log('Car deleted successfully:', result.rows[0]);
    res.redirect('/index.html');
    
  } catch (err) {
    console.error('Error deleting car:', err.message);
    res.status(500).send('Server error: Could not delete car');
  }
});

// handle form POST for updates/Partial updates (only update fields provided)
router.post('/cars/update', async (req, res) => {
  console.log('Update request received');
  console.log('Request body:', req.body);
  
  try {
    const { id } = req.body;
    
    // validate ID is present
    if (!id) {
      console.log('No ID provided');
      return res.status(400).send('ID is required for update');
    }
    
    // vheck if the car exists first
    const checkResult = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      console.log(`Car with ID ${id} not found`);
      return res.status(404).send(`Car with ID ${id} not found`);
    }
    
    // build dynamic update query based on what fields were provided
    const updates = [];
    const values = [];
    let valueCounter = 1;
    
    // only add fields that were provided in the request
    if (req.body.car_name !== undefined) {
      updates.push(`car_name = $${valueCounter++}`);
      values.push(req.body.car_name);
    }
    if (req.body.mpg !== undefined) {
      updates.push(`mpg = $${valueCounter++}`);
      values.push(parseFloat(req.body.mpg));
    }
    if (req.body.cylinders !== undefined) {
      updates.push(`cylinders = $${valueCounter++}`);
      values.push(parseInt(req.body.cylinders));
    }
    if (req.body.displacement !== undefined) {
      updates.push(`displacement = $${valueCounter++}`);
      values.push(parseFloat(req.body.displacement));
    }
    if (req.body.horsepower !== undefined) {
      updates.push(`horsepower = $${valueCounter++}`);
      values.push(parseInt(req.body.horsepower));
    }
    if (req.body.weight !== undefined) {
      updates.push(`weight = $${valueCounter++}`);
      values.push(parseInt(req.body.weight));
    }
    if (req.body.acceleration !== undefined) {
      updates.push(`acceleration = $${valueCounter++}`);
      values.push(parseFloat(req.body.acceleration));
    }
    if (req.body.model_year !== undefined) {
      updates.push(`model_year = $${valueCounter++}`);
      values.push(parseInt(req.body.model_year));
    }
    if (req.body.origin !== undefined) {
      updates.push(`origin = $${valueCounter++}`);
      values.push(parseInt(req.body.origin));
    }
    
    // if no fields to update, return error
    if (updates.length === 0) {
      return res.status(400).send('No fields to update');
    }
    
    // add the ID as the last parameter
    values.push(parseInt(id));
    
    // build and execute the query
    const query = `
      UPDATE cars 
      SET ${updates.join(', ')}
      WHERE id = $${valueCounter}
      RETURNING *
    `;
    
    console.log('Update query:', query);
    console.log('Values:', values);
    
    const result = await pool.query(query, values);
    
    console.log('Car updated successfully:', result.rows[0]);
    res.redirect('/index.html?update=success');
    
  } catch (err) {
    console.error('Error updating car:', err.message);
    res.status(500).send(`Update failed: ${err.message}`);
  }
});

// add to cars.js
router.post('/cars/delete', async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('DELETE FROM cars WHERE id = $1', [id]);
    res.redirect('/index.html');
  } catch (err) {
    console.error('Error deleting car:', err.message);
    res.status(500).send('Delete failed');
  }
});


module.exports = router;