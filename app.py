import streamlit as st
import torch
from torchvision import transforms
from PIL import Image
import os
import sys
import streamlit.components.v1 as components # Import the components module

# Add the 'src' directory to the Python path to import modules
sys.path.insert(0, './src')

from model import ForestFirePredictor # Your model
from data_preprocessing import data_transforms # Your data transformations

# --- Configuration ---
MODEL_PATH = os.path.join('models', 'forest_fire_model.pth')
CLASS_NAMES = ["No Fire", "Fire"]
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Load Model ---
@st.cache_resource # Cache the model loading for performance
def load_model():
    model = ForestFirePredictor()
    if os.path.exists(MODEL_PATH):
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
        model.to(DEVICE)
        model.eval() # Set to evaluation mode
        st.success("Model loaded successfully!")
    else:
        st.error(f"Error: Model file not found at {MODEL_PATH}. Please train the model first.")
        st.stop()
    return model

model = load_model()

# --- Prediction Function ---
def predict(image):
    # Apply the same transformations used during training
    input_tensor = data_transforms(image).unsqueeze(0) # Add batch dimension
    input_tensor = input_tensor.to(DEVICE)

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        predicted_class_idx = torch.argmax(probabilities, dim=1).item()
        confidence = probabilities[0][predicted_class_idx].item()

    return CLASS_NAMES[predicted_class_idx], confidence

# --- Streamlit App Layout ---
st.set_page_config(
    page_title="Forest Fire Prediction",
    page_icon="🔥",
    layout="wide" # Changed to wide layout
)

st.markdown("""
<style>
.main { 
    background-color: #f0f2f6; /* Light grey background */
    color: #333; /* Darker text */
}
.stButton>button { /* Style for buttons */
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 8px;
    border: none;
}
.stButton>button:hover { /* Hover effect for buttons */
    background-color: #45a049;
}
.stImage { /* Style for uploaded images */
    border-radius: 10px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
}
.prediction-fire { /* Style for fire prediction */
    color: #d9534f; /* Red */
    font-size: 24px;
    font-weight: bold;
}
.prediction-no-fire { /* Style for no fire prediction */
    color: #5cb85c; /* Green */
    font-size: 24px;
    font-weight: bold;
}
h1 { color: #2c3e50; } /* Dark blue-grey for main title */
h2 { color: #34495e; } /* Slightly lighter for subtitles */
</style>
""", unsafe_allow_html=True)

# --- Embed 3D Animation ---
with open("3d_animation.html", "r") as f:
    html_code = f.read()
components.html(html_code, height=300) # Adjust height as needed

st.title("🔥 Forest Fire Sentinel")
st.markdown("### _Harnessing Satellite Imagery for Early Detection_")

st.write("""
Welcome to the Forest Fire Sentinel! This application leverages advanced AI to analyze satellite images and predict the presence of forest fires. 
Our model, trained on a comprehensive dataset, provides rapid and accurate insights to aid in early detection and prevention efforts.
""")

st.markdown("""
--- 
""")

# Main content area with columns for better layout
col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("Upload a Satellite Image")
    uploaded_file = st.file_uploader("", type=["jpg", "jpeg", "png"])

with col2:
    st.subheader("Prediction Results")
    if uploaded_file is not None:
        image = Image.open(uploaded_file).convert('RGB')
        st.image(image, caption="Image for Analysis", use_column_width=True)
        st.write("")
        st.info("Analyzing image...")

        # Make prediction
        label, confidence = predict(image)

        # Display results with enhanced styling
        if label == "Fire":
            st.markdown(f'<p class="prediction-fire">Prediction: 🔥 {label} Detected!</p>', unsafe_allow_html=True)
        else:
            st.markdown(f'<p class="prediction-no-fire">Prediction: 🌳 {label}</p>', unsafe_allow_html=True)
        
        st.markdown(f"_Confidence: **{confidence:.2f}**_ ")
    else:
        st.warning("Please upload an image to get a prediction.")

st.markdown("""
--- 
### How it Works:
1.  **Upload:** Select a satellite image in JPG, JPEG, or PNG format.
2.  **Analyze:** Our deep learning model processes the image.
3.  **Predict:** The model outputs a prediction: 'Fire Detected' or 'No Fire Detected'.
""")

st.markdown("""
--- 
_Disclaimer: This application is for demonstration purposes only. Always refer to official and real-time emergency services for fire alerts and safety information._
""")

