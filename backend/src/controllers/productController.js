const Product = require('../models/Product');

// ============================================================
// GET /api/products
// Listar productos (con paginación, búsqueda y filtros).
// ============================================================
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      branch = '',
      category = '',
      isPromoted,
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (branch) {
      query.branch = branch;
    }
    if (category) {
      query.category = category;
    }
    if (isPromoted !== undefined) {
      query.isPromoted = isPromoted === 'true';
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('branch', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/products/:id
// Obtener un producto por ID.
// ============================================================
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'branch',
      'name address'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// POST /api/products
// Crear un producto nuevo (owner/admin).
// ============================================================
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Producto creado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUT /api/products/:id
// Actualizar un producto (owner/admin).
// ============================================================
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'Producto actualizado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE /api/products/:id
// Desactivar un producto (solo owner).
// ============================================================
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Producto eliminado correctamente',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET /api/public/products
// Listar productos públicos (sin auth, solo activos).
// ============================================================
exports.getPublicProducts = async (req, res, next) => {
  try {
    const { branch = '', category = '', search = '' } = req.query;
    const query = { isActive: true };

    if (branch) query.branch = branch;
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query)
      .populate('branch', 'name')
      .sort({ isPromoted: -1, name: 1 });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
