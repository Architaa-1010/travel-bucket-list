const express = require('express')
const router = express.Router()
const pool = require('../db')
const auth = require('../middleware/auth')

// GET all destinations for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const destinations = await pool.query(
      'SELECT * FROM destinations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    )
    res.json(destinations.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST add a new destination
router.post('/', auth, async (req, res) => {
  const { name, country, latitude, longitude, status, notes } = req.body

  try {
    const newDestination = await pool.query(
      `INSERT INTO destinations (user_id, name, country, latitude, longitude, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, name, country, latitude, longitude, status || 'wishlist', notes]
    )
    res.status(201).json(newDestination.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH update a destination (status, notes, rating)
router.patch('/:id', auth, async (req, res) => {
  const { id } = req.params
  const { status, notes, rating } = req.body

  try {
    const updated = await pool.query(
      `UPDATE destinations
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           rating = COALESCE($3, rating)
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [status, notes, rating, id, req.user.id]
    )
    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found' })
    }
    res.json(updated.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE a destination
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params

  try {
    const deleted = await pool.query(
      'DELETE FROM destinations WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    )
    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found' })
    }
    res.json({ message: 'Destination deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router