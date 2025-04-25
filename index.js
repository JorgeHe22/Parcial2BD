const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

app.listen(PORT, () => {
    console.log('Servidor corriendo en el puerto', PORT);
});

//Obtener productos de un pedido especifico en un restaurante
app.get('/api/restaurante/:idRest/pedido/:idPedido/productos', async (req, res) => {
    const { idRest, idPedido } = req.params;
    try {
        const result = await pool.query(`
            SELECT p.*
            FROM detalle_pedido dp
            JOIN producto p ON dp.id_prod = p.id_prod
            JOIN pedido pe ON dp.id_pedido = pe.id_pedido
            WHERE pe.id_rest = $1 AND pe.id_pedido = $2;
        `, [idRest, idPedido]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos del pedido' });
    }
});
//Productos mas vendidos por restaurante 
app.get('/api/restaurante/:idRest/productos-mas-vendidos/:cantidad', async (req, res) => {
    const { idRest, cantidad } = req.params;
    try {
        const result = await pool.query(`
            SELECT pr.nombre, SUM(dp.cantidad) AS total_vendido
            FROM detalle_pedido dp
            JOIN producto pr ON dp.id_prod = pr.id_prod
            JOIN pedido pe ON dp.id_pedido = pe.id_pedido
            WHERE pe.id_rest = $1
            GROUP BY pr.nombre
            HAVING SUM(dp.cantidad) > $2;
        `, [idRest, cantidad]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos más vendidos' });
    }
});
//Total de ventas por restaurante
app.get('/api/restaurantes/ventas', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.id_rest, r.nombre, SUM(pe.total) AS total_ventas
            FROM restaurante r
            JOIN pedido pe ON r.id_rest = pe.id_rest
            GROUP BY r.id_rest, r.nombre;
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el total de ventas' });
    }
});
//Pedidos por fecha y restaurante
app.get('/api/restaurante/:idRest/pedidos/:fecha', async (req, res) => {
    const { idRest, fecha } = req.params;
    try {
        const result = await pool.query(`
            SELECT *
            FROM pedido
            WHERE id_rest = $1 AND fecha = $2;
        `, [idRest, fecha]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener pedidos por fecha' });
    }
});
//Empleados por rol en un restarante 
app.get('/api/restaurante/:idRest/empleados/:rol', async (req, res) => {
    const { idRest, rol } = req.params;
    try {
        const result = await pool.query(`
            SELECT *
            FROM empleado
            WHERE id_rest = $1 AND rol = $2;
        `, [idRest, rol]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener empleados por rol' });
    }
});


//Crear un restaurante
app.post('/api/restaurante', async (req, res) => {
    const { nombre, ciudad, direccion, fecha_apertura } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO restaurante (nombre, ciudad, direccion, fecha_apertura) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, ciudad, direccion, fecha_apertura]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear restaurante:', error); 
        res.status(500).json({ error: error.message });      
    }
});
//Obtener todos los restaurantes
app.get('/api/restaurantes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM restaurante');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener restaurantes' });
    }
});
//Actualizar restaurante
app.put('/api/restaurante/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, ciudad, direccion, fecha_apertura } = req.body;
    try {
        const result = await pool.query(
            'UPDATE restaurante SET nombre=$1, ciudad=$2, direccion=$3, fecha_apertura=$4 WHERE id_rest=$5 RETURNING *',
            [nombre, ciudad, direccion, fecha_apertura, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar restaurante' });
    }
});
//Eliminar Restaurante
app.delete('/api/restaurante/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM restaurante WHERE id_rest = $1', [id]);
        res.json({ message: 'Restaurante eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar restaurante' });
    }
});
//Crear Producto
app.post('/api/producto', async (req, res) => {
    const { nombre, precio } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO producto (nombre, precio) VALUES ($1, $2) RETURNING *',
            [nombre, precio]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: error.message });
    }
});
//Obtener todos los Productos
app.get('/api/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM producto');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: error.message });
    }
});
//Actualizar Producto
app.put('/api/producto/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio } = req.body;
    try {
        const result = await pool.query(
            'UPDATE producto SET nombre=$1, precio=$2 WHERE id_prod=$3 RETURNING *',
            [nombre, precio, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: error.message });
    }
});
//Eliminar Producto
app.delete('/api/producto/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM producto WHERE id_prod = $1', [id]);
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: error.message });
    }
});
//Obtener todos los empleados
app.get('/api/empleado', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM empleado');
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      res.status(500).json({ error: error.message });
    }
  });
//Crear Empleado
app.post('/api/empleado', async (req, res) => {
    const { nombre, rol, id_rest } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO empleado (nombre, rol, id_rest) VALUES ($1, $2, $3) RETURNING *',
        [nombre, rol, id_rest]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear empleado:', error);
      res.status(500).json({ error: error.message });
    }
  });
//Actualizar Emplado 
app.put('/api/empleado/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, rol, id_rest } = req.body;
    try {
      const result = await pool.query(
        'UPDATE empleado SET nombre=$1, rol=$2, id_rest=$3 WHERE id_empleado=$4 RETURNING *',
        [nombre, rol, id_rest, id]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      res.status(500).json({ error: error.message });
    }
  });
//Eliminar empleado
app.delete('/api/empleado/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM empleado WHERE id_empleado = $1', [id]);
      res.json({ message: 'Empleado eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      res.status(500).json({ error: error.message });
    }
  });
//Obtener todos los pedidos
app.get('/api/pedido', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM pedido');
      res.json(result.rows);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      res.status(500).json({ error: error.message });
    }
  });
//Crear un nuevo pedido
app.post('/api/pedido', async (req, res) => {
    const { fecha, id_rest, total } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO pedido (fecha, id_rest, total) VALUES ($1, $2, $3) RETURNING *',
        [fecha, id_rest, total]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al crear pedido:', error);
      res.status(500).json({ error: error.message });
    }
  });
//Actualizar Pedido
app.put('/api/pedido/:id', async (req, res) => {
    const { id } = req.params;
    const { fecha, id_rest, total } = req.body;
    try {
      const result = await pool.query(
        'UPDATE pedido SET fecha=$1, id_rest=$2, total=$3 WHERE id_pedido=$4 RETURNING *',
        [fecha, id_rest, total, id]
      );
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      res.status(500).json({ error: error.message });
    }
  });
//Eliminar pedido
app.delete('/api/pedido/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('DELETE FROM pedido WHERE id_pedido = $1', [id]);
      res.json({ message: 'Pedido eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar pedido:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  

