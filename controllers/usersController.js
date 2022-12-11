const pool = require('../db/config.js');

class usersController {
  async deleteUser(req, res) {
    try {
      const [rows, filds] = await pool.query(
        'SELECT id FROM user WHERE role = "admin"'
      );
      if (rows[0].id === req.params.id)
        return res.status(404).json('You cant delete last admin');

      await pool.query('DELETE FROM user WHERE id = ?', [req.params.id]);
      return res.status(200).json('User was deleted');
    } catch (error) {
      console.log(error);
    }
  }

  async updateUser(req, res) {
    try {
      const { role } = req.body;
      console.log(role, req.params.id);
      await pool.query(`UPDATE user SET role = ? WHERE id = ?`, [
        role,
        req.params.id,
      ]);
      return res.status(200).json('User was updated');
    } catch (error) {
      console.log(error);
    }
  }

  async getAllUsers(req, res) {
    try {
      const [rows, filds] = await pool.query(
        `SELECT id, username, email, role FROM user;`
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new usersController();
