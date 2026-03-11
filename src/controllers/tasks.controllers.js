import pool from '../config/db.js';

const getTasks = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, done, user_id FROM tasks ORDER BY id DESC'
    );

    return res.json({
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al listar tareas:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createTask = async (req, res) => {
  try {
    const { name, user_id } = req.body;

    if (!name || !user_id) {
      return res.status(400).json({
        message: 'name y user_id son obligatorios'
      });
    }

    const userExists = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [user_id]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    const result = await pool.query(
      `INSERT INTO tasks (name, done, user_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, done, user_id`,
      [name, false, user_id]
    );

    return res.status(201).json({
      message: 'Tarea creada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const findTask = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, name, done, user_id FROM tasks WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al buscar tarea:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: 'name es obligatorio'
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET name = $1
       WHERE id = $2
       RETURNING id, name, done, user_id`,
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.json({
      message: 'Tarea actualizada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const patchTaskDone = async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;

    if (typeof done !== 'boolean') {
      return res.status(400).json({
        message: 'done debe ser true o false'
      });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET done = $1
       WHERE id = $2
       RETURNING id, name, done, user_id`,
      [done, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.json({
      message: 'Estado de tarea actualizado correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar estado de tarea:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id, name, done, user_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    return res.json({
      message: 'Tarea eliminada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getUserTasks = async (req, res) => {
  try {
    const { id } = req.params;

    const userExists = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const result = await pool.query(
      'SELECT id, name, done, user_id FROM tasks WHERE user_id = $1 ORDER BY id DESC',
      [id]
    );

    return res.json({
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al listar tareas del usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export default {
  getTasks,
  createTask,
  findTask,
  updateTask,
  patchTaskDone,
  deleteTask,
  getUserTasks
};