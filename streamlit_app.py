import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import time

# Page config
st.set_page_config(
    page_title="CPMI - Crypto Prediction Market Index",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 2rem 0;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: white;
        padding: 1rem;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        border-left: 4px solid #667eea;
    }
    .bullish {
        color: #00C851;
    }
    .bearish {
        color: #ff4444;
    }
    .neutral {
        color: #ffbb33;
    }
</style>
""", unsafe_allow_html=True)

# API Configuration
API_BASE_URL = st.sidebar.text_input(
    "API URL", 
    value="http://35.203.43.14:3000",
    help="Enter your VM IP address where the API is running"
)

@st.cache_data(ttl=30)  # Cache for 30 seconds
def fetch_cpmi_data():
    """Fetch CPMI data from API"""
    try:
        response = requests.get(f"{API_BASE_URL}/api/cpmi/current", timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            st.error(f"API Error: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        st.error(f"Connection Error: {str(e)}")
        return None

@st.cache_data(ttl=60)  # Cache for 1 minute
def fetch_history_data():
    """Fetch historical data from API"""
    try:
        response = requests.get(f"{API_BASE_URL}/api/cpmi/history", timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except requests.exceptions.RequestException:
        return None

def get_sentiment_color(value):
    """Get color based on sentiment"""
    if value > 100:
        return "bullish"
    elif value < 100:
        return "bearish"
    else:
        return "neutral"

def get_sentiment_emoji(value):
    """Get emoji based on sentiment"""
    if value > 100:
        return "📈"
    elif value < 100:
        return "📉"
    else:
        return "➡️"

# Main App
def main():
    # Header
    st.markdown("""
    <div class="main-header">
        <h1>📈 Crypto Prediction Market Index (CPMI)</h1>
        <p>Real-time sentiment analysis from Polymarket crypto prediction markets</p>
    </div>
    """, unsafe_allow_html=True)

    # Fetch data
    cpmi_data = fetch_cpmi_data()
    history_data = fetch_history_data()

    if cpmi_data and cpmi_data.get('success'):
        data = cpmi_data['data']
        current_index = data['index']['value']
        interpretation = data['index']['interpretation']
        last_update = data['index']['lastUpdate']
        
        # Main metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric(
                label="CPMI Index",
                value=f"{current_index:.2f}",
                delta=f"{current_index - 100:+.2f}",
                delta_color="normal"
            )
        
        with col2:
            sentiment_class = get_sentiment_color(current_index)
            st.markdown(f"""
            <div class="metric-card">
                <h3>Sentiment</h3>
                <p class="{sentiment_class}">
                    {get_sentiment_emoji(current_index)} {interpretation}
                </p>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.metric(
                label="Last Update",
                value=datetime.fromisoformat(last_update.replace('Z', '+00:00')).strftime('%H:%M:%S')
            )
        
        with col4:
            if st.button("🔄 Refresh Data"):
                st.cache_data.clear()
                st.rerun()

        # Category breakdown
        st.subheader("📊 Category Breakdown")
        
        categories = data['categories']
        category_df = pd.DataFrame([
            {
                'Category': key.replace('-', ' ').title(),
                'Index': value['index'],
                'Weight': f"{value['weight']*100:.1f}%",
                'Interpretation': value['interpretation'],
                'Deviation': value['deviation']
            }
            for key, value in categories.items()
            if value['index'] is not None
        ])
        
        # Category chart
        col1, col2 = st.columns([2, 1])
        
        with col1:
            fig = px.bar(
                category_df, 
                x='Category', 
                y='Index',
                color='Index',
                color_continuous_scale=['#ff4444', '#ffbb33', '#00C851'],
                title="Category Indices"
            )
            fig.add_hline(y=100, line_dash="dash", line_color="gray", 
                         annotation_text="Neutral (100)")
            fig.update_layout(height=400)
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            st.dataframe(category_df, use_container_width=True)

        # Historical data
        if history_data and history_data.get('success'):
            st.subheader("📈 Historical Trend")
            
            history = history_data['data']['history']
            if history:
                hist_df = pd.DataFrame(history)
                hist_df['timestamp'] = pd.to_datetime(hist_df['timestamp'])
                hist_df['sentiment'] = hist_df['index'].apply(get_sentiment_color)
                
                # Line chart
                fig = go.Figure()
                fig.add_trace(go.Scatter(
                    x=hist_df['timestamp'],
                    y=hist_df['index'],
                    mode='lines+markers',
                    name='CPMI',
                    line=dict(color='#667eea', width=3),
                    marker=dict(size=8)
                ))
                fig.add_hline(y=100, line_dash="dash", line_color="gray", 
                             annotation_text="Neutral (100)")
                fig.update_layout(
                    title="CPMI Historical Trend",
                    xaxis_title="Time",
                    yaxis_title="CPMI Index",
                    height=400
                )
                st.plotly_chart(fig, use_container_width=True)
                
                # Statistics
                stats = history_data['data']['statistics']
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    st.metric("Min", f"{stats['min']:.2f}")
                with col2:
                    st.metric("Max", f"{stats['max']:.2f}")
                with col3:
                    st.metric("Average", f"{stats['average']:.2f}")
                with col4:
                    st.metric("Volatility", f"{stats['volatility']:.2f}")

        # Auto-refresh
        if st.sidebar.checkbox("Auto-refresh (30s)", value=True):
            time.sleep(30)
            st.rerun()

    else:
        st.error("❌ Unable to fetch CPMI data. Please check:")
        st.markdown("""
        1. **API URL** is correct in the sidebar
        2. **VM is running** and accessible
        3. **API server** is running on the VM
        4. **Firewall** allows connections on port 3001
        """)
        
        st.info("💡 **API should be running on your VM with:** `PORT=3001 node src/api-server.js`")

    # Footer
    st.markdown("---")
    st.markdown("""
    <div style='text-align: center; color: #666;'>
        <p>CPMI - Crypto Prediction Market Index | Real-time Polymarket Data</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
