import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BarChart3,
  PieChart as PieChartIcon,
  Trash2,
  RefreshCw,
  Layers,
  Flame,
  AlertOctagon,
} from 'lucide-react';
import { Order, Product } from '../../types';
import { ordersService } from '../../services/ordersService';
import { productsService } from '../../services/productsService';
import { categoriesService } from '../../services/categoriesService';
import { offersService } from '../../services/offersService';
import { inventoryService } from '../../services/inventoryService';
import { useToast } from '../common/Toast';

interface AdminDashboardTabProps {
  orders: Order[];
  products: Product[];
  onNavigateTab: (tab: string) => void;
}

const GOLD_COLORS = ['#ECC86A', '#D4AF37', '#B8860B', '#F3E08C', '#AA771C', '#855E13'];
const PIE_COLORS = ['#D4AF37', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B'];

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  orders,
  products,
  onNavigateTab,
}) => {
  const { showToast } = useToast();
  const [salesTimeframe, setSalesTimeframe] = useState<'7' | '14' | '30'>('7');
  const [isPurging, setIsPurging] = useState<string | null>(null);

  // Metrics calculations from real Firestore data
  const metrics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    let salesToday = 0;
    let salesWeek = 0;
    let salesMonth = 0;
    let salesTotal = 0;

    let pendingOrders = 0;
    let confirmedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    orders.forEach((o) => {
      const orderTime = new Date(o.createdAt || o.date).getTime();
      const statusLower = (o.status || '').toLowerCase();
      const isNotCancelled = statusLower !== 'cancelado';

      if (isNotCancelled) {
        salesTotal += o.total;
        if (orderTime >= startOfToday) salesToday += o.total;
        if (orderTime >= sevenDaysAgo) salesWeek += o.total;
        if (orderTime >= thirtyDaysAgo) salesMonth += o.total;
      }

      if (statusLower === 'pendiente') pendingOrders++;
      else if (
        statusLower === 'confirmado' ||
        statusLower === 'preparando' ||
        statusLower === 'listo' ||
        statusLower === 'enviado'
      )
        confirmedOrders++;
      else if (statusLower === 'entregado') deliveredOrders++;
      else if (statusLower === 'cancelado') cancelledOrders++;
    });

    // Inventory metrics
    let totalStockUnits = 0;
    let lowStockProducts = 0;
    let soldOutProducts = 0;

    products.forEach((p) => {
      const totalUnits = Object.values(p.stockPerSize || {}).reduce((acc, q) => acc + q, 0);
      totalStockUnits += totalUnits;
      if (totalUnits === 0) {
        soldOutProducts++;
      } else if (totalUnits <= 5) {
        lowStockProducts++;
      }
    });

    return {
      salesToday,
      salesWeek,
      salesMonth,
      salesTotal,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      cancelledOrders,
      totalOrders: orders.length,
      totalProducts: products.length,
      lowStockProducts,
      soldOutProducts,
      totalStockUnits,
      avgTicket: orders.length > 0 ? salesTotal / orders.length : 0,
    };
  }, [orders, products]);

  // Recharts Data 1: Real Sales over time
  const salesChartData = useMemo(() => {
    const daysCount = parseInt(salesTimeframe, 10);
    const result: { date: string; displayDate: string; total: number; pedidos: number }[] = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('es-PA', { weekday: 'short', day: 'numeric', month: 'short' });
      result.push({
        date: isoDate,
        displayDate: dayName,
        total: 0,
        pedidos: 0,
      });
    }

    orders.forEach((o) => {
      if ((o.status || '').toLowerCase() === 'cancelado') return;
      const orderDate = o.date || (o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : '');
      const target = result.find((r) => r.date === orderDate);
      if (target) {
        target.total += o.total;
        target.pedidos += 1;
      }
    });

    return result;
  }, [orders, salesTimeframe]);

  // Recharts Data 2: Real Top Selling Products from actual orders
  const topProductsData = useMemo(() => {
    const productStats: Record<string, { name: string; units: number; revenue: number; image?: string }> = {};

    orders.forEach((o) => {
      if ((o.status || '').toLowerCase() === 'cancelado') return;
      (o.items || []).forEach((item) => {
        const key = item.productId || item.name;
        if (!productStats[key]) {
          productStats[key] = {
            name: item.name.length > 20 ? item.name.substring(0, 18) + '...' : item.name,
            units: 0,
            revenue: 0,
            image: item.image,
          };
        }
        productStats[key].units += item.quantity || 1;
        productStats[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    return Object.values(productStats).sort((a, b) => b.units - a.units).slice(0, 6);
  }, [orders]);

  // Recharts Data 3: Real Sales by Category
  const categorySalesData = useMemo(() => {
    const catMap: Record<string, number> = {};

    orders.forEach((o) => {
      if ((o.status || '').toLowerCase() === 'cancelado') return;
      (o.items || []).forEach((item) => {
        const prod = products.find((p) => p.id === item.productId || p.name === item.name);
        const cat = prod?.category || 'Otros / Clubes';
        catMap[cat] = (catMap[cat] || 0) + (item.price || 0) * (item.quantity || 1);
      });
    });

    return Object.entries(catMap).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));
  }, [orders, products]);

  // Deletion Purge Actions
  const handleDeleteAllOrders = async () => {
    if (orders.length === 0) {
      showToast('No hay ventas o pedidos registrados para eliminar', 'info');
      return;
    }
    if (!window.confirm(`¿ATENCIÓN: Deseas eliminar permanentemente TODAS las ${orders.length} ventas y pedidos de Cloud Firestore?`)) return;
    if (!window.confirm('Por favor confirma por segunda vez: esta acción borrará todo el historial de ventas y pedidos.')) return;

    setIsPurging('orders');
    try {
      await ordersService.deleteAll();
      showToast('Todas las ventas y pedidos han sido eliminados de Firestore', 'info');
    } catch (err: any) {
      showToast(`Error al eliminar pedidos: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsPurging(null);
    }
  };

  const handleDeleteAllProducts = async () => {
    if (products.length === 0) {
      showToast('No hay productos en el catálogo para eliminar', 'info');
      return;
    }
    if (!window.confirm(`¿ATENCIÓN: Deseas eliminar permanentemente los ${products.length} productos de Cloud Firestore?`)) return;
    if (!window.confirm('Confirma por segunda vez: el catálogo quedará completamente vacío en la tienda pública.')) return;

    setIsPurging('products');
    try {
      await productsService.deleteAll();
      showToast('Todos los productos han sido eliminados de Firestore', 'info');
    } catch (err: any) {
      showToast(`Error al eliminar productos: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsPurging(null);
    }
  };

  const handleDeleteAllCategories = async () => {
    if (!window.confirm('¿ATENCIÓN: Deseas eliminar permanentemente todas las categorías de Cloud Firestore?')) return;
    if (!window.confirm('Confirma por segunda vez la eliminación de todas las categorías.')) return;

    setIsPurging('categories');
    try {
      await categoriesService.deleteAll();
      showToast('Todas las categorías han sido eliminadas de Firestore', 'info');
    } catch (err: any) {
      showToast(`Error al eliminar categorías: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsPurging(null);
    }
  };

  const handleDeleteAllOffers = async () => {
    if (!window.confirm('¿ATENCIÓN: Deseas eliminar permanentemente todas las ofertas y promociones de Cloud Firestore?')) return;
    if (!window.confirm('Confirma por segunda vez la eliminación de todas las ofertas.')) return;

    setIsPurging('offers');
    try {
      await offersService.deleteAll();
      showToast('Todas las ofertas han sido eliminadas de Firestore', 'info');
    } catch (err: any) {
      showToast(`Error al eliminar ofertas: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsPurging(null);
    }
  };

  const handleClearAllInventory = async () => {
    if (products.length === 0) {
      showToast('No hay inventario para vaciar', 'info');
      return;
    }
    if (!window.confirm('¿ATENCIÓN: Deseas vaciar a 0 unidades el stock de TODOS los productos en Cloud Firestore?')) return;
    if (!window.confirm('Confirma por segunda vez: todos los artículos pasarán a estado "Agotado".')) return;

    setIsPurging('inventory');
    try {
      await inventoryService.clearAllStock();
      showToast('Todo el stock ha sido vaciado a 0 unidades en Firestore', 'info');
    } catch (err: any) {
      showToast(`Error al vaciar inventario: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsPurging(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome & KPI Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121217] p-6 rounded-3xl border border-neutral-800">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#ECC86A]">
            PANEL DE CONTROL GENERAL
          </span>
          <h1 className="font-['Cinzel'] text-2xl sm:text-3xl font-black text-white mt-1">
            ALEX.STOREPTY
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Métricas de ventas, pedidos e inventario sincronizadas en tiempo real con Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('pedidos')}
            className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 border border-neutral-800 transition-colors flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            <span>Gestionar Pedidos</span>
          </button>
          <button
            onClick={() => onNavigateTab('productos')}
            className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg"
          >
            <Package className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Sales */}
        <div className="bg-[#121217] p-5 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Ventas Totales
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-black text-white font-mono">
                ${metrics.salesTotal.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Hoy: <strong className="text-white font-mono">${metrics.salesToday.toFixed(2)}</strong></span>
            <span>7 días: <strong className="text-white font-mono">${metrics.salesWeek.toFixed(2)}</strong></span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="bg-[#121217] p-5 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Pedidos Registrados
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-black text-white font-mono">
                {metrics.totalOrders}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
            <span className="text-amber-400 font-bold">{metrics.pendingOrders} pendientes</span>
            <span className="text-emerald-400 font-bold">{metrics.deliveredOrders} entregados</span>
          </div>
        </div>

        {/* KPI 3: Products in Catalog */}
        <div className="bg-[#121217] p-5 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Catálogo Activo
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-black text-white font-mono">
                {metrics.totalProducts}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Stock total: <strong className="text-white font-mono">{metrics.totalStockUnits} u.</strong></span>
            {metrics.soldOutProducts > 0 && (
              <span className="text-red-400 font-bold">{metrics.soldOutProducts} agotados</span>
            )}
          </div>
        </div>

        {/* KPI 4: Average Ticket */}
        <div className="bg-[#121217] p-5 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Ticket Promedio
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl lg:text-3xl font-black text-white font-mono">
                ${metrics.avgTicket.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Conversión WhatsApp</span>
            <span className="text-[#ECC86A] font-bold">Activo</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Ventas en Tiempo Real (2 Cols) */}
        <div className="lg:col-span-2 bg-[#121217] p-6 rounded-3xl border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Cinzel'] font-bold text-white text-base">
                    Ventas Totales en Tiempo Real
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Ingresos generados según pedidos registrados en Firestore
                  </p>
                </div>
              </div>

              {/* Timeframe Selector */}
              <div className="flex items-center gap-1 bg-[#181824] p-1 rounded-xl border border-neutral-800 text-xs">
                <button
                  onClick={() => setSalesTimeframe('7')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    salesTimeframe === '7' ? 'bg-[#D4AF37] text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  7 días
                </button>
                <button
                  onClick={() => setSalesTimeframe('14')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    salesTimeframe === '14' ? 'bg-[#D4AF37] text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  14 días
                </button>
                <button
                  onClick={() => setSalesTimeframe('30')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    salesTimeframe === '30' ? 'bg-[#D4AF37] text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  30 días
                </button>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-72 w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262633" vertical={false} />
                  <XAxis dataKey="displayDate" stroke="#73738c" fontSize={11} tickLine={false} />
                  <YAxis stroke="#73738c" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121217',
                      borderColor: '#38384d',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Ventas']}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#D4AF37"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#goldGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Suma del período seleccionado:</span>
            <span className="font-mono font-bold text-white text-sm">
              ${salesChartData.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Secondary Chart: Productos más Vendidos (1 Col) */}
        <div className="bg-[#121217] p-6 rounded-3xl border border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#ECC86A]" />
                <h3 className="font-['Cinzel'] font-bold text-white text-base">
                  Productos Más Vendidos
                </h3>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">Top Unidades</span>
            </div>

            {topProductsData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-4 text-neutral-500">
                <Package className="w-8 h-8 mb-2 opacity-30 text-[#D4AF37]" />
                <p className="text-xs font-semibold text-neutral-400">Sin ventas registradas</p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Cuando se confirmen compras en la tienda, aquí se graficarán los artículos líderes.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topProductsData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#262633" horizontal={false} />
                    <XAxis type="number" stroke="#73738c" fontSize={11} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#a3a3bd" fontSize={10} width={90} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#121217',
                        borderColor: '#38384d',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                      formatter={(val: any) => [`${val} unidades`, 'Vendidas']}
                    />
                    <Bar dataKey="units" fill="#D4AF37" radius={[0, 6, 6, 0]}>
                      {topProductsData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={GOLD_COLORS[index % GOLD_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-neutral-800/80">
            <button
              onClick={() => onNavigateTab('ventas')}
              className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-neutral-300 hover:text-[#ECC86A] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Ver Panel de Ventas en Vivo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Purga y Eliminación en Tiempo Real de Firestore */}
      <div className="bg-[#121217] p-6 rounded-3xl border border-red-950/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Cinzel'] font-bold text-white text-base flex items-center gap-2">
                <span>Herramientas Administrativas de Eliminación y Vaciado</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Permite eliminar permanentemente colecciones de Cloud Firestore con confirmación de seguridad obligatoria.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {/* Purge 1: Ventas y Pedidos */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-neutral-300 font-bold text-xs">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Ventas y Pedidos</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {orders.length} pedidos registrados actualmente.
              </p>
            </div>
            <button
              onClick={handleDeleteAllOrders}
              disabled={isPurging === 'orders' || orders.length === 0}
              className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-400 hover:text-red-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPurging === 'orders' ? 'Eliminando...' : 'Eliminar Ventas'}</span>
            </button>
          </div>

          {/* Purge 2: Productos */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-neutral-300 font-bold text-xs">
                <Package className="w-4 h-4 text-purple-400" />
                <span>Catálogo Productos</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                {products.length} productos en la base de datos.
              </p>
            </div>
            <button
              onClick={handleDeleteAllProducts}
              disabled={isPurging === 'products' || products.length === 0}
              className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-400 hover:text-red-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPurging === 'products' ? 'Eliminando...' : 'Eliminar Productos'}</span>
            </button>
          </div>

          {/* Purge 3: Categorías */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-neutral-300 font-bold text-xs">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Categorías</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Elimina las categorías creadas en Firestore.
              </p>
            </div>
            <button
              onClick={handleDeleteAllCategories}
              disabled={isPurging === 'categories'}
              className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-400 hover:text-red-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPurging === 'categories' ? 'Eliminando...' : 'Eliminar Categorías'}</span>
            </button>
          </div>

          {/* Purge 4: Ofertas */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-neutral-300 font-bold text-xs">
                <Flame className="w-4 h-4 text-red-400" />
                <span>Ofertas</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Elimina las promociones y descuentos activos.
              </p>
            </div>
            <button
              onClick={handleDeleteAllOffers}
              disabled={isPurging === 'offers'}
              className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-400 hover:text-red-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isPurging === 'offers' ? 'Eliminando...' : 'Eliminar Ofertas'}</span>
            </button>
          </div>

          {/* Purge 5: Inventario */}
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-neutral-300 font-bold text-xs">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Vaciar Inventario</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Pone a 0 el stock de todas las tallas.
              </p>
            </div>
            <button
              onClick={handleClearAllInventory}
              disabled={isPurging === 'inventory' || products.length === 0}
              className="w-full py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-400 hover:text-red-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isPurging === 'inventory' ? 'Vaciando...' : 'Vaciar Stock a 0'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
