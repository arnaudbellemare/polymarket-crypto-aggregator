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
    /* Main theme colors - High contrast for readability */
    :root {
        --primary-color: #1f2937;
        --secondary-color: #3b82f6;
        --success-color: #059669;
        --danger-color: #dc2626;
        --warning-color: #d97706;
        --background-color: #ffffff;
        --card-background: #f9fafb;
        --text-primary: #111827;
        --text-secondary: #374151;
        --border-color: #e5e7eb;
    }
    
    /* Main container */
    .main .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
        max-width: 1200px;
    }
    
    /* Header styling */
    .main-header {
        text-align: center;
        padding: 3rem 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 15px;
        margin-bottom: 2rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    
    .main-header h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .main-header p {
        font-size: 1.2rem;
        opacity: 0.9;
        margin: 0;
    }
    
    /* Metric cards */
    .metric-card {
        background: var(--card-background);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        border-left: 4px solid var(--secondary-color);
        margin-bottom: 1rem;
        transition: transform 0.2s ease;
        border: 1px solid var(--border-color);
    }
    
    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 15px rgba(0,0,0,0.1);
    }
    
    .metric-card h3 {
        color: var(--text-primary) !important;
        font-size: 1.1rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    
    .metric-card p {
        color: var(--text-primary) !important;
        font-size: 1.2rem;
        font-weight: 700;
        margin: 0;
    }
    
    .metric-card small {
        color: var(--text-secondary) !important;
        font-size: 0.9rem;
    }
    
    /* Sentiment colors */
    .bullish {
        color: var(--success-color) !important;
        font-weight: 700;
    }
    
    .bearish {
        color: var(--danger-color) !important;
        font-weight: 700;
    }
    
    .neutral {
        color: var(--warning-color) !important;
        font-weight: 700;
    }
    
    /* Section headers */
    .section-header {
        color: var(--text-primary);
        font-size: 1.5rem;
        font-weight: 600;
        margin: 2rem 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--secondary-color);
    }
    
    /* Data tables */
    .dataframe {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    
    /* Sidebar styling */
    .css-1d391kg {
        background-color: var(--background-color);
    }
    
    /* Text color fixes - Comprehensive coverage */
    .stMarkdown, .stMarkdown p, .stMarkdown h1, .stMarkdown h2, .stMarkdown h3, .stMarkdown h4, .stMarkdown h5, .stMarkdown h6 {
        color: var(--text-primary) !important;
    }
    
    .stText, .stText p {
        color: var(--text-primary) !important;
    }
    
    /* Streamlit specific text elements */
    .stApp > div > div > div > div > div {
        color: var(--text-primary) !important;
    }
    
    /* Metric labels and values */
    .metric-container {
        color: var(--text-primary) !important;
    }
    
    .metric-container label {
        color: var(--text-secondary) !important;
    }
    
    .metric-container .metric-value {
        color: var(--text-primary) !important;
    }
    
    /* Dataframe styling */
    .dataframe th, .dataframe td {
        color: var(--text-primary) !important;
        background-color: var(--card-background) !important;
    }
    
    .dataframe th {
        background-color: var(--background-color) !important;
        font-weight: 600;
    }
    
    /* Expandable sections */
    .streamlit-expanderHeader {
        color: var(--text-primary) !important;
        background-color: var(--card-background) !important;
    }
    
    .streamlit-expanderContent {
        color: var(--text-primary) !important;
        background-color: var(--card-background) !important;
    }
    
    /* Sidebar text */
    .css-1d391kg, .css-1d391kg p, .css-1d391kg h1, .css-1d391kg h2, .css-1d391kg h3 {
        color: var(--text-primary) !important;
    }
    
    /* Input fields */
    .stTextInput > div > div > input {
        color: var(--text-primary) !important;
        background-color: var(--card-background) !important;
    }
    
    /* Checkbox and other inputs */
    .stCheckbox > label {
        color: var(--text-primary) !important;
    }
    
    /* Global text color override */
    body, .stApp, .main {
        color: var(--text-primary) !important;
    }
    
    /* Ensure all text elements are readable */
    p, span, div, h1, h2, h3, h4, h5, h6, label, td, th {
        color: var(--text-primary) !important;
    }
    
    /* Specific Streamlit element overrides */
    .element-container {
        color: var(--text-primary) !important;
    }
    
    .stAlert {
        color: var(--text-primary) !important;
    }
    
    .stInfo, .stSuccess, .stWarning, .stError {
        color: var(--text-primary) !important;
    }
    
    /* Plotly chart text */
    .js-plotly-plot {
        color: var(--text-primary) !important;
    }
    
    /* Button styling */
    .stButton > button {
        background: linear-gradient(90deg, var(--secondary-color), #1d4ed8);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-weight: 600;
        transition: all 0.2s ease;
    }
    
    .stButton > button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }
    
    /* Footer */
    .footer {
        text-align: center;
        color: var(--text-secondary);
        padding: 2rem 0;
        margin-top: 3rem;
        border-top: 1px solid #e5e7eb;
    }
    
    /* Status indicators */
    .status-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 8px;
    }
    
    .status-online {
        background-color: var(--success-color);
        box-shadow: 0 0 6px var(--success-color);
    }
    
    .status-offline {
        background-color: var(--danger-color);
        box-shadow: 0 0 6px var(--danger-color);
    }
</style>
""", unsafe_allow_html=True)

# API Configuration
st.sidebar.markdown("### 🔗 API Configuration")
API_BASE_URL = st.sidebar.text_input(
    "API URL", 
    value="http://35.203.43.14:3000",
    help="Enter your VM IP address where the API is running"
)

# Connection status
@st.cache_data(ttl=10)
def check_api_status():
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

api_status = check_api_status()
if api_status:
    st.sidebar.markdown("""
    <div style="display: flex; align-items: center; margin: 1rem 0;">
        <span class="status-indicator status-online"></span>
        <span style="color: var(--success-color); font-weight: 600;">API Connected</span>
    </div>
    """, unsafe_allow_html=True)
else:
    st.sidebar.markdown("""
    <div style="display: flex; align-items: center; margin: 1rem 0;">
        <span class="status-indicator status-offline"></span>
        <span style="color: var(--danger-color); font-weight: 600;">API Disconnected</span>
    </div>
    """, unsafe_allow_html=True)

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
                <h3>Market Sentiment</h3>
                <p class="{sentiment_class}">
                    {get_sentiment_emoji(current_index)} {interpretation}
                </p>
                <small style="color: var(--text-secondary);">Based on prediction market data</small>
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.metric(
                label="Last Update",
                value=datetime.fromisoformat(last_update.replace('Z', '+00:00')).strftime('%H:%M:%S'),
                help="Data refreshes every 5 minutes"
            )
        
        with col4:
            if st.button("🔄 Refresh Data"):
                st.cache_data.clear()
                st.rerun()

        # Category breakdown
        st.markdown('<h2 class="section-header">📊 Category Breakdown</h2>', unsafe_allow_html=True)
        
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
            st.plotly_chart(fig, width='stretch')
        
        with col2:
            st.dataframe(category_df, width='stretch')

        # Market Details Section
        st.markdown('<h2 class="section-header">🔍 Market Analysis</h2>', unsafe_allow_html=True)
        
        # Create expandable sections for each category
        categories = data['categories']
        
        for category_key, category_data in categories.items():
            if category_data and category_data['index'] is not None:
                category_name = category_key.replace('-', ' ').title()
                weight_percent = category_data['weight'] * 100
                index_value = category_data['index']
                interpretation = category_data['interpretation']
                deviation = category_data['deviation']
                
                with st.expander(f"📊 {category_name} ({weight_percent:.1f}% weight) - {index_value:.1f} ({interpretation})", expanded=False):
                    col1, col2 = st.columns([2, 1])
                    
                    with col1:
                        st.markdown(f"""
                        **Category Details:**
                        - **Weight:** {weight_percent:.1f}% of total index
                        - **Current Index:** {index_value:.2f}
                        - **Interpretation:** {interpretation}
                        - **Deviation from Neutral:** {deviation:+.2f}
                        """)
                        
                        # Show market type explanation
                        if category_key == 'bitcoin-markets':
                            st.markdown("""
                            **Markets Included:**
                            - Bitcoin price predictions
                            - Bitcoin adoption forecasts
                            - Bitcoin regulatory outcomes
                            - Bitcoin ETF and institutional adoption
                            """)
                        elif category_key == 'ethereum-ecosystem':
                            st.markdown("""
                            **Markets Included:**
                            - Ethereum price predictions
                            - DeFi protocol success rates
                            - Layer 2 scaling solutions
                            - Ethereum upgrade outcomes
                            """)
                        elif category_key == 'regulatory-outcomes':
                            st.markdown("""
                            **Markets Included:**
                            - Crypto regulation predictions
                            - SEC approval outcomes
                            - CBDC development timelines
                            - Government crypto policies
                            """)
                        elif category_key == 'major-altcoins':
                            st.markdown("""
                            **Markets Included:**
                            - Solana, Cardano, Polkadot predictions
                            - Layer 1 blockchain performance
                            - Altcoin adoption forecasts
                            - Cross-chain interoperability
                            """)
                        elif category_key == 'infrastructure':
                            st.markdown("""
                            **Markets Included:**
                            - Crypto infrastructure development
                            - Mining and staking outcomes
                            - Exchange and custody solutions
                            - Developer tool adoption
                            """)
                    
                    with col2:
                        # Create a mini chart for this category
                        fig = go.Figure(go.Indicator(
                            mode = "gauge+number+delta",
                            value = index_value,
                            domain = {'x': [0, 1], 'y': [0, 1]},
                            title = {'text': f"{category_name}<br><span style='font-size:14px'>Index Value</span>"},
                            delta = {'reference': 100},
                            gauge = {
                                'axis': {'range': [None, 150]},
                                'bar': {'color': "darkblue"},
                                'steps': [
                                    {'range': [0, 50], 'color': "lightgray"},
                                    {'range': [50, 100], 'color': "yellow"},
                                    {'range': [100, 150], 'color': "lightgreen"}
                                ],
                                'threshold': {
                                    'line': {'color': "red", 'width': 4},
                                    'thickness': 0.75,
                                    'value': 100
                                }
                            }
                        ))
                        fig.update_layout(height=300, margin=dict(l=20, r=20, t=40, b=20))
                        st.plotly_chart(fig,width='stretch')

        # Methodology Section
        st.markdown('<h2 class="section-header">📚 CPMI Methodology</h2>', unsafe_allow_html=True)
        
        with st.expander("🔬 How the CPMI Index is Calculated", expanded=False):
            col1, col2 = st.columns([1, 1])
            
            with col1:
                st.markdown("""
                **📊 Formula:**
                ```
                CPMI = 100 + (Bullish Probability - 50)
                ```
                
                **🎯 Interpretation:**
                - **100** = Market neutral (50/50 bull/bear)
                - **Above 100** = Bullish crypto sentiment
                - **Below 100** = Bearish crypto sentiment
                
                **⚖️ Category Weights:**
                - Bitcoin Markets: 40%
                - Ethereum Ecosystem: 30%
                - Regulatory Outcomes: 20%
                - Major Altcoins: 8%
                - Infrastructure: 2%
                """)
            
            with col2:
                st.markdown("""
                **🔍 Data Sources:**
                - **Polymarket** prediction markets
                - **CCXT** real-time crypto prices
                - **Kraken** exchange data
                
                **⏱️ Update Frequency:**
                - Every 5 minutes
                - 1-hour smoothing period
                - Real-time market data
                
                **📈 Market Types:**
                - Binary: "Will X happen?"
                - Directional: "X Up or Down"
                - Price Prediction: "Will X reach $Y?"
                """)
            
            st.markdown("""
            **🎯 Quality Assurance:**
            - Volume-weighted market selection
            - Time-sensitive probability extraction
            - Market cap and volatility adjustments
            - Cross-validation with multiple data sources
            """)

        # Historical data
        if history_data and history_data.get('success'):
            st.markdown('<h2 class="section-header">📈 Historical Trend</h2>', unsafe_allow_html=True)
            
            history = history_data['data']['history']
            stats = history_data['data']['statistics']
            
            if history and len(history) > 1:
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
                    height=400,
                    showlegend=False
                )
                st.plotly_chart(fig,width='stretch')
                
                # Statistics
                if stats:
                    col1, col2, col3, col4 = st.columns(4)
                    
                    with col1:
                        st.metric("Min", f"{stats['min']:.2f}")
                    with col2:
                        st.metric("Max", f"{stats['max']:.2f}")
                    with col3:
                        st.metric("Average", f"{stats['average']:.2f}")
                    with col4:
                        st.metric("Volatility", f"{stats['volatility']:.2f}")
            else:
                st.info("📊 **Historical data is being collected...** The CPMI updates every 5 minutes. Historical trends will appear once more data points are available.")
                
                # Show current statistics even with limited data
                if stats:
                    col1, col2, col3, col4 = st.columns(4)
                    
                    with col1:
                        st.metric("Data Points", f"{stats.get('dataPoints', 1)}")
                    with col2:
                        st.metric("Current Value", f"{current_index:.2f}")
                    with col3:
                        st.metric("Status", "Collecting")
                    with col4:
                        st.metric("Next Update", "5 min")

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
    st.markdown("""
    <div class="footer">
        <p><strong>CPMI - Crypto Prediction Market Index</strong></p>
        <p>Real-time sentiment analysis from Polymarket crypto prediction markets</p>
        <p>Built with advanced machine learning and market data aggregation</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
