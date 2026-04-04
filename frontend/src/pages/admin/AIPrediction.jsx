import { useState, useEffect } from 'react';
import { BrainCircuit, TrendingUp, Calendar, Tag, Activity, AlertCircle, ShoppingBag } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] border border-gray-100">
                <p className="font-bold text-gray-800 mb-1">{payload[0].name}</p>
                <p className="text-sm text-gray-600">
                    Predicted Sales: <span className="font-bold text-[#155c27]">{payload[0].value} units</span>
                </p>
            </div>
        );
    }
    return null;
};

const AIPrediction = () => {
    const [products, setProducts] = useState([]);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [predicting, setPredicting] = useState(false);
    const [monthlySales, setMonthlySales] = useState([]);
    const [pieData, setPieData] = useState([]);
    
    // COLORS for Pie Chart
    const COLORS = ['#155c27', '#2e8b57', '#3cb371', '#20b2aa', '#32cd32', '#9acd32', '#f5d800'];
    
    const [formData, setFormData] = useState({
        item_name: '',
        day_of_week: 'Monday',
        discount: 0,
        is_holiday: false
    });
    const [predictionResult, setPredictionResult] = useState(null);

    const AI_URL = 'http://localhost:5001';
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch Products
                const prodRes = await fetch(`${AI_URL}/get-products`);
                const prodData = await prodRes.json();
                if (prodData.status === 'success') {
                    setProducts(prodData.products);
                    if (prodData.products.length > 0) {
                        setFormData(prev => ({ ...prev, item_name: prodData.products[0] }));
                    }
                } else {
                    throw new Error(prodData.message || 'Failed to fetch products');
                }

                // Fetch Insights
                const insightRes = await fetch(`${AI_URL}/dashboard-insights`);
                const insightData = await insightRes.json();
                if (insightData.status === 'success') {
                    setForecast(insightData.forecast);
                } else {
                    throw new Error(insightData.message || 'Failed to fetch forecast');
                }

                // Fetch Monthly Sales
                try {
                    const analyticsRes = await fetch(`${AI_URL}/historical-monthly-sales`);
                    const analyticsData = await analyticsRes.json();
                    if (analyticsData.status === 'success' && analyticsData.monthlyRevenue) {
                        setMonthlySales(analyticsData.monthlyRevenue);
                    } else {
                        throw new Error(analyticsData.message || 'Failed to fetch historical sales');
                    }
                } catch (analyticsErr) {
                    console.error("Error fetching analytics:", analyticsErr);
                }

                // Fetch Upcoming Month Predictions Data
                try {
                    const pieRes = await fetch(`${AI_URL}/upcoming-month-predictions`);
                    const pieDataRes = await pieRes.json();
                    if (pieDataRes.status === 'success' && pieDataRes.predictions) {
                        setPieData(pieDataRes.predictions);
                    } else {
                        throw new Error(pieDataRes.message || 'Failed to fetch pie data');
                    }
                } catch (pieErr) {
                    console.error("Error fetching pie data:", pieErr);
                }
            } catch (err) {
                console.error("Error fetching AI data:", err);
                setError("Unable to connect to the AI Server. Please ensure it is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setPredicting(true);
        setPredictionResult(null);
        setError(null);

        try {
            const res = await fetch(`${AI_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    item_name: formData.item_name,
                    day_of_week: formData.day_of_week,
                    discount: Number(formData.discount),
                    is_holiday: formData.is_holiday ? 1 : 0
                })
            });
            const data = await res.json();
            
            if (data.status === 'success') {
                setPredictionResult(data.predicted_sales);
            } else {
                throw new Error(data.message || 'Prediction failed');
            }
        } catch (err) {
            console.error("Prediction Error:", err);
            setError("Failed to get prediction from AI Server.");
        } finally {
            setPredicting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Loading AI Models & Forecast Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary-100 p-3 rounded-xl">
                    <BrainCircuit className="w-8 h-8 text-primary-700" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AI Demand Prediction</h1>
                    <p className="text-sm text-gray-500">Machine learning forecasts and scenario planning</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Dashboard Insights (Left 2 columns) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            Next 7 Days Top Forecast
                        </h2>
                    </div>
                    
                    {forecast.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                            <p className="text-gray-500">No forecast data available.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {forecast.map((item, idx) => (
                                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-semibold text-gray-800 line-clamp-2 pr-4" title={item.item_name}>
                                            {item.item_name}
                                        </h3>
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                                            {item.total_sales} est. unit{item.total_sales !== 1 && 's'}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {/* Show only the first 3 days for brevity, or summarize */}
                                        <div className="text-xs text-gray-500 font-medium tracking-wide uppercase mb-2">Daily Breakdown</div>
                                        {item.predictions.slice(0, 4).map((pred, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-1 last:border-0 last:pb-0">
                                                <span className="text-gray-600">{pred.day_name}</span>
                                                <span className="font-medium text-gray-900">{pred.predicted_sales}</span>
                                            </div>
                                        ))}
                                        {item.predictions.length > 4 && (
                                            <div className="text-xs text-center text-gray-400 italic pt-1">
                                                + {item.predictions.length - 4} more days
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Charts Section */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Monthly Sales Graph Section */}
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    Historical Monthly Sales
                                </h2>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 min-h-[350px] flex flex-col">
                                {monthlySales.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8 my-auto">No historical data available.</p>
                                ) : (
                                    <div className="flex-1 w-full min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis 
                                                    dataKey="month" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                                                    dy={10} 
                                                    tickFormatter={(val) => {
                                                        const [y, m] = val.split('-');
                                                        const date = new Date(parseInt(y), parseInt(m) - 1);
                                                        return date.toLocaleString('default', { month: 'short', year: '2-digit' });
                                                    }}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 12, fill: '#6b7280' }} 
                                                    tickFormatter={(val) => `Rs.${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: '#f8fafc' }}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
                                                    labelFormatter={(label) => {
                                                        const [y, m] = label.split('-');
                                                        const date = new Date(parseInt(y), parseInt(m) - 1);
                                                        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
                                                    }}
                                                />
                                                <Bar dataKey="revenue" name="Revenue" fill="#155c27" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upcoming Month Pie Chart Section */}
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                    Next 30 Days Forecast
                                </h2>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex-1 min-h-[350px] flex flex-col">
                                {pieData.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8 my-auto">No upcoming forecast data available.</p>
                                ) : (
                                    <div className="flex-1 w-full min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomPieTooltip />} />
                                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Custom Prediction Form (Right 1 column) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-fit">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
                        <Activity className="w-5 h-5 text-primary-600" />
                        Custom Prediction
                    </h2>

                    <form onSubmit={handlePredict} className="space-y-4 flex-1">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                Select Product
                            </label>
                            <select
                                name="item_name"
                                value={formData.item_name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            >
                                <option value="" disabled>Choose a product</option>
                                {products.map((prod, idx) => (
                                    <option key={idx} value={prod}>{prod}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Day of Week
                            </label>
                            <select
                                name="day_of_week"
                                value={formData.day_of_week}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            >
                                {daysOfWeek.map((day) => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Discount Applied (%) <span className="text-gray-400 font-normal text-xs">(Retail Standard)</span>
                            </label>
                            <select
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            >
                                <option value="0">0% (No Discount)</option>
                                <option value="5">5% (Minor Promo)</option>
                                <option value="10">10% (Standard Sale)</option>
                                <option value="15">15% (Special Offer)</option>
                                <option value="20">20% (Deep Discount)</option>
                                <option value="25">25% (Quarter Markdown)</option>
                                <option value="30">30% (End of Season)</option>
                                <option value="40">40% (Clearance)</option>
                                <option value="50">50% (Liquidation Limit)</option>
                            </select>
                        </div>

                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                name="is_holiday"
                                id="is_holiday"
                                checked={formData.is_holiday}
                                onChange={handleChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="is_holiday" className="ml-2 block text-sm text-gray-700 cursor-pointer user-select-none">
                                Is it a Holiday Season?
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={predicting || products.length === 0}
                            className="w-full mt-6 bg-[#155c27] hover:bg-[#0d3d1a] disabled:bg-gray-400 disabled:cursor-not-allowed text-[#f5d800] py-2.5 rounded-lg font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {predicting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#f5d800] border-t-transparent"></div>
                                    Calculating...
                                </>
                            ) : (
                                <>
                                    <BrainCircuit className="w-5 h-5" />
                                    Run Prediction
                                </>
                            )}
                        </button>
                    </form>

                    {predictionResult !== null && (
                        <div className="mt-6 p-4 rounded-xl border-2 border-primary-200 bg-primary-50 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center">
                            <p className="text-sm text-gray-600 font-medium mb-1">Expected Demand</p>
                            <div className="text-4xl font-black text-primary-700 py-2">
                                {predictionResult}
                            </div>
                            <p className="text-xs text-gray-500">units predicted to sell</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AIPrediction;
