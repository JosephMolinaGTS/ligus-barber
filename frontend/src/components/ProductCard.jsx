import { FiShoppingBag, FiTag } from 'react-icons/fi';

// ============================================================
// ProductCard — Tarjeta de producto para catálogo público
// Muestra imagen (o placeholder), nombre, precio, categoría
// ============================================================
export default function ProductCard({ product }) {
  const categoryLabels = {
    pomadas: 'Pomadas',
    ceras: 'Ceras',
    shampoo: 'Shampoo',
    aceites: 'Aceites',
    'after-shave': 'After Shave',
    peines: 'Peines',
    kits: 'Kits',
    otros: 'Otros',
  };

  return (
    <div className="bg-barber-charcoal rounded-xl border border-barber-dark overflow-hidden hover:border-barber-blue/50 transition-colors group">
      {/* Imagen o placeholder */}
      <div className="h-48 bg-barber-dark flex items-center justify-center relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FiShoppingBag className="text-barber-gray/30" size={48} />
        )}

        {/* Badge de promocionado */}
        {product.isPromoted && (
          <div className="absolute top-2 right-2 bg-barber-blue text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <FiTag size={12} />
            Promocionado
          </div>
        )}
      </div>

      {/* Información */}
      <div className="p-4">
        <h3 className="text-barber-white font-semibold text-lg">{product.name}</h3>
        <p className="text-barber-gray text-sm mt-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-barber-blue font-bold text-xl">
            ${product.price}
          </span>
          <span className="text-barber-gray text-xs bg-barber-dark px-2 py-1 rounded">
            {categoryLabels[product.category] || product.category}
          </span>
        </div>

        {/* Sucursal */}
        {product.branch && (
          <p className="text-barber-gray text-xs mt-2">
            📍 {product.branch.name}
          </p>
        )}

        {/* Stock */}
        <p
          className={`text-xs mt-1 ${
            product.stock > 0 ? 'text-green-500' : 'text-barber-red'
          }`}
        >
          {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
        </p>
      </div>
    </div>
  );
}
