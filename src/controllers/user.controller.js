import pool from '../config/db.js';

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, status FROM users ORDER BY id DESC'
    );

    return res.json({
      total: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getUsersPagination = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = '',
      orderBy = 'id',
      orderDir = 'DESC'
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const validOrderBy = ['id', 'username', 'status'];
    const validOrderDir = ['ASC', 'DESC'];
    const validLimits = [5, 10, 15, 20];

    if (!validOrderBy.includes(orderBy)) {
      return res.status(400).json({
        message: 'orderBy inválido. Usa: id, username, status'
      });
    }

    if (!validOrderDir.includes(orderDir.toUpperCase())) {
      return res.status(400).json({
        message: 'orderDir inválido. Usa: ASC o DESC'
      });
    }

    if (!validLimits.includes(limit)) {
      return res.status(400).json({
        message: 'limit inválido. Usa: 5, 10, 15 o 20'
      });
    }

    const offset = (page - 1) * limit;
    const searchValue = `%${search}%`;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users
      WHERE username ILIKE $1
    `;

    const dataQuery = `
      SELECT id, username, status
      FROM users
      WHERE username ILIKE $1
      ORDER BY ${orderBy} ${orderDir.toUpperCase()}
      LIMIT $2 OFFSET $3
    `;

    const countResult = await pool.query(countQuery, [searchValue]);
    const total = parseInt(countResult.rows[0].total);

    const dataResult = await pool.query(dataQuery, [searchValue, limit, offset]);
    const data = dataResult.rows;

    const pages = Math.ceil(total / limit);

    return res.json({
      total,
      page,
      pages,
      data
    });
  } catch (error) {
    console.error('Error en paginación:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'username y password son obligatorios'
      });
    }

    const exists = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: 'El username ya existe'
      });
    }

    const result = await pool.query(
      `INSERT INTO users (username, password, status)
       VALUES ($1, $2, $3)
       RETURNING id, username, status`,
      [username, password, 'active']
    );

    return res.status(201).json({
      message: 'Usuario creado correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const findUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, username, status FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'username y password son obligatorios'
      });
    }

    const exists = await pool.query('SELECT id FROM users WHERE id = $1', [id]);

    if (exists.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const repeated = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id <> $2',
      [username, id]
    );

    if (repeated.rows.length > 0) {
      return res.status(400).json({
        message: 'El username ya está en uso por otro usuario'
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET username = $1, password = $2
       WHERE id = $3
       RETURNING id, username, status`,
      [username, password, id]
    );

    return res.json({
      message: 'Usuario actualizado correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const patchUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: 'status es obligatorio'
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        message: 'status debe ser active o inactive'
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET status = $1
       WHERE id = $2
       RETURNING id, username, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({
      message: 'Estado actualizado correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, username, status',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({
      message: 'Usuario eliminado correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export default {
  getUsers,
  getUsersPagination,
  createUser,
  findUser,
  updateUser,
  patchUserStatus,
  deleteUser
};