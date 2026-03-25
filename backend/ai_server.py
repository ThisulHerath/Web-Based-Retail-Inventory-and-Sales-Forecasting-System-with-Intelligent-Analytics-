from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
from datetime import datetime, timedelta
import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = None
item_encoder = None
day_encoder = None
category_encoder = None

def get_product_price(product_name):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return 300.0
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    url = f"{SUPABASE_URL}/rest/v1/products?select=selling_price&product_name=eq.{product_name}"
    try:
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            data = res.json()
            if len(data) > 0 and 'selling_price' in data[0]:
                return float(data[0]['selling_price'])
    except Exception as e:
        print(f"Error fetching price for {product_name}:", e)
    return 300.0 # fallback

def get_all_product_prices():
    if not SUPABASE_URL or not SUPABASE_KEY:
        return {}
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    url = f"{SUPABASE_URL}/rest/v1/products?select=product_name,selling_price"
    prices = {}
    try:
        res = requests.get(url, headers=headers)
        if res.status_code == 200:
            for item in res.json():
                if item.get('product_name') and item.get('selling_price') is not None:
                    prices[item['product_name']] = float(item['selling_price'])
    except Exception as e:
        print("Error fetching all prices:", e)
    return prices


app = Flask(__name__)
CORS(app) # Allows the React app to securely talk to this AI

print("--- 7 Super City AI Server Starting ---")
try:
    model_path = os.path.join(BASE_DIR, 'super_city_rf_ai_bundle.pkl')
    with open(model_path, 'rb') as f:
        bundle = pickle.load(f)
        
    model = bundle['model']
    item_encoder = bundle['item_encoder']
    day_encoder = bundle['day_encoder']
    category_encoder = bundle['category_encoder']
    print("Brain loaded successfully! Ready for web requests.")
except Exception as e:
    print(f"Error: Could not load model bundle: {e}")

# Load historical CSV dataset
try:
    historical_data_path = os.path.join(BASE_DIR, 'NEW 7_Super_City_Full_Year_2025.csv')
    df_historical = pd.read_csv(historical_data_path)
    df_historical['Date'] = pd.to_datetime(df_historical['Date'])
    df_historical['Month_Year'] = df_historical['Date'].dt.to_period('M').astype(str)
    print("Historical dataset loaded successfully.")
except Exception as e:
    print("Warning: Could not load historical dataset.", e)
    df_historical = None


def ensure_model_loaded():
    return model is not None and item_encoder is not None and day_encoder is not None

@app.route('/get-products', methods=['GET'])
def get_products():
    if not ensure_model_loaded():
        return jsonify({"status": "error", "message": "AI model is not loaded on server."})
    try:
        products = list(item_encoder.classes_)
        return jsonify({
            "status": "success",
            "products": products
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/dashboard-insights', methods=['GET'])
def get_dashboard_insights():
    if not ensure_model_loaded():
        return jsonify({"status": "error", "message": "AI model is not loaded on server."})
    try:
        all_items = list(item_encoder.classes_)
        all_prices = get_all_product_prices()
        
        days = []
        today = datetime.now()
        for i in range(7):
            d = today + timedelta(days=i)
            day_name = d.strftime('%A')
            try:
                enc_day = day_encoder.transform([day_name])[0]
                days.append({"date": d.strftime('%Y-%m-%d'), "day_name": day_name, "encoded_day": enc_day})
            except Exception:
                pass
            
        all_results = []
        for item in all_items:
            try:
                encoded_item = item_encoder.transform([item])[0]
            except Exception:
                continue
                
            item_predictions = []
            
            # Fetch the actual live price for this item exactly once from the dictionary
            live_price = all_prices.get(item, 300.0)
            
            total_sales = 0
            for day in days:
                input_data = pd.DataFrame([{
                    'Item_Name': encoded_item,
                    'Day_of_Week': day['encoded_day'],
                    'Unit_Price_LKR': live_price,
                    'Discount_Applied': 0.0, 
                    'Is_Holiday_Season': 0
                }])
                pred = model.predict(input_data)
                predicted_sales = int(pred[0])
                total_sales += predicted_sales
                
                item_predictions.append({
                    "date": day['date'],
                    "day_name": day['day_name'],
                    "predicted_sales": predicted_sales
                })
                
            if item_predictions:
                all_results.append({
                    "item_name": item,
                    "predictions": item_predictions,
                    "total_sales": total_sales
                })
            
        # Sort by total predicted sales descending and take the top 5
        all_results.sort(key=lambda x: x['total_sales'], reverse=True)
        top_results = all_results[:5]
            
        return jsonify({
            "status": "success",
            "forecast": top_results
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/historical-monthly-sales', methods=['GET'])
def get_historical_monthly_sales():
    if df_historical is None:
        return jsonify({"status": "error", "message": "Historical dataset not loaded."})
    try:
        monthly_revenue = df_historical.groupby('Month_Year')['Total_Revenue_LKR'].sum().reset_index()
        monthly_revenue.columns = ['month', 'revenue']
        monthly_revenue = monthly_revenue.sort_values(by='month')
        
        return jsonify({
            "status": "success",
            "monthlyRevenue": monthly_revenue.to_dict(orient='records')
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/upcoming-month-predictions', methods=['GET'])
def get_upcoming_month_predictions():
    if not ensure_model_loaded():
        return jsonify({"status": "error", "message": "AI model is not loaded on server."})
    try:
        all_items = list(item_encoder.classes_)
        all_prices = get_all_product_prices()
        
        days = []
        today = datetime.now()
        for i in range(30):
            d = today + timedelta(days=i)
            day_name = d.strftime('%A')
            try:
                enc_day = day_encoder.transform([day_name])[0]
                days.append({"date": d.strftime('%Y-%m-%d'), "day_name": day_name, "encoded_day": enc_day})
            except Exception:
                pass
                
        # Batch preparation array
        batch_data = []
        item_indices = []
        
        for item in all_items:
            try:
                enc_item = item_encoder.transform([item])[0]
            except Exception:
                continue
            
            live_price = all_prices.get(item, 300.0)
            
            for day in days:
                batch_data.append({
                    'Item_Name': enc_item,
                    'Day_of_Week': day['encoded_day'],
                    'Unit_Price_LKR': live_price,
                    'Discount_Applied': 0.0,
                    'Is_Holiday_Season': 0
                })
                item_indices.append(item)
                
        if not batch_data:
             return jsonify({"status": "error", "message": "No prediction data could be formed."})
             
        df_batch = pd.DataFrame(batch_data)
        predictions = model.predict(df_batch)
        
        # Aggregate
        totals = {}
        for item, pred in zip(item_indices, predictions):
            totals[item] = totals.get(item, 0) + max(0, int(pred))
            
        # Format for pie chart
        sorted_totals = sorted(totals.items(), key=lambda x: x[1], reverse=True)
        
        results = [{"name": item, "value": val} for item, val in sorted_totals[:6]]
        
        if len(sorted_totals) > 6:
            others_val = sum(val for _, val in sorted_totals[6:])
            results.append({"name": "Others", "value": others_val})
            
        return jsonify({
            "status": "success",
            "predictions": results
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

@app.route('/predict', methods=['POST'])
def predict_demand():
    if not ensure_model_loaded():
        return jsonify({"status": "error", "message": "AI model is not loaded on server."})
    try:
        # 1. Receive data from the React frontend
        data = request.json
        
        # 2. Translate text (like "Monday") into AI numbers
        encoded_item = item_encoder.transform([data['item_name']])[0]
        encoded_day = day_encoder.transform([data['day_of_week']])[0]
        
        # Securely fetch the live price from our Supabase Database instead of relying on frontend
        live_price = get_product_price(data['item_name'])
        
        # 3. Format the data into a Pandas DataFrame
        input_data = pd.DataFrame([{
            'Item_Name': encoded_item,
            'Day_of_Week': encoded_day,
            'Unit_Price_LKR': live_price,
            'Discount_Applied': float(data['discount']) / 100.0, 
            'Is_Holiday_Season': int(data['is_holiday'])
        }])
        
        # 4. Make the prediction!
        prediction = model.predict(input_data)
        predicted_qty = int(prediction[0])
        
        # 5. Send the answer back to the React UI
        return jsonify({
            "status": "success",
            "item": data['item_name'],
            "predicted_sales": predicted_qty
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})

if __name__ == '__main__':
    print("Server is awake on http://localhost:5001")
    app.run(port=5001, debug=False)