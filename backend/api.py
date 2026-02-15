import torch
from torchvision import transforms
from PIL import Image
import os
import sys
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import io

sys.path.insert(0, './src')

from model import ForestFirePredictor
from data_preprocessing import data_transforms

from contextlib import asynccontextmanager

model = None
MODEL_PATH = os.path.join('models', 'forest_fire_model.pth')

@asynccontextmanager
async def lifespan(app: FastAPI):
    auth.init_db()
    load_model_logic()
    yield

app = FastAPI(title="Forest Fire Sentinel API", description="API for detecting forest fires from satellite images.", lifespan=lifespan)

CLASS_NAMES = ["No Fire", "Fire"]
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
CONFIDENCE_THRESHOLD = 0.70

def log_debug(message):
    with open('backend_log.txt', 'a') as f:
        f.write(f"{message}\n")

log_debug("API Script initialized")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel, EmailStr
from src import auth

class UserAuth(BaseModel):
    username: str
    password: str

class UserRegister(BaseModel):
    username: str
    password: str
    fullname: str
    email: EmailStr
    phone: str

def load_model_logic():
    global model
    
    # Check possible locations for the model
    possible_paths = [
        os.path.join('models', 'forest_fire_model.pth'),
        os.path.join('..', 'models', 'forest_fire_model.pth'),
        r"l:\Forest1\models\forest_fire_model.pth"
    ]
    
    found_path = None
    for path in possible_paths:
        if os.path.exists(path):
            found_path = path
            break
            
    if not found_path:
        print(f"Error: Model file not found in any of the expected locations: {possible_paths}")
        return

    print(f"Loading model from {found_path}...")
    try:
        model_instance = ForestFirePredictor()
        
        # Load state dict
        checkpoint = torch.load(found_path, map_location=DEVICE)
        model_instance.load_state_dict(checkpoint)
        
        model_instance.to(DEVICE)
        model_instance.eval()
        model = model_instance
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Failed to load model: {e}")

@app.post("/register")
def register(user: UserRegister):
    log_debug(f"Registering user: {user.username}")
    if auth.add_user(user.username, user.password, user.fullname, user.email, user.phone):
        log_debug("Registration successful")
        return {"message": "User created successfully"}
    else:
        log_debug("Registration failed: Username exists")
        raise HTTPException(status_code=400, detail="Username already exists")

@app.post("/login")
def login(user: UserAuth):
    log_debug(f"Login attempt: {user.username}")
    user_data = auth.login_user(user.username, user.password)
    if user_data:
        log_debug("Login successful")
        # user_data[0] tuple structure: 
        # (id, username, password, fullname, email, phone, profile_image)
        # We need to handle potential missing columns if schema wasn't fully updated, 
        # but we ran fix_db.py so it should be fine.
        # Let's verify indices safely or just try/except.
        # Schema from debug output earlier (implied): id, username, password, fullname, email, phone, profile_image
        
        row = user_data[0]
        # Assuming: 0=id, 1=username, 2=password, 3=fullname, 4=email, 5=phone, 6=profile_image
        # Wait, allow for flexible schema? No, let's assume standard order from INSERT/CREATE.
        # users(username, password, fullname, email, phone) -> id is auto-inc first.
        # So: id, username, password, fullname, email, phone.
        # We added profile_image at the end with ALTER TABLE.
        
        user_email = row[4]
        user_phone = row[5]
        
        # Check if profile_image exists (index 6)
        user_image = None
        if len(row) > 6:
            user_image = row[6]
            
        return {
            "message": "Login successful", 
            "username": user.username, 
            "email": user_email,
            "phone": user_phone,
            "profile_image": user_image
        }
    else:
        log_debug("Login failed: Invalid credentials")
        raise HTTPException(status_code=401, detail="Invalid credentials")

class UserProfileUpdate(BaseModel):
    username: str
    email: EmailStr
    phone: str
    profile_image: str | None = None

@app.put("/update-profile")
def update_profile(data: UserProfileUpdate):
    log_debug(f"Updating profile for: {data.username}")
    if auth.update_user_profile(data.username, data.email, data.phone, data.profile_image):
        log_debug("Profile updated successfully")
        return {"message": "Profile updated successfully"}
    else:
        log_debug("Profile update failed")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        input_tensor = data_transforms(image).unsqueeze(0)
        input_tensor = input_tensor.to(DEVICE)

        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            predicted_class_idx = torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][predicted_class_idx].item()
            
            # Log prediction details
            log_debug(f"Prediction: Probs={probabilities.tolist()}, Index={predicted_class_idx}, Class={CLASS_NAMES[predicted_class_idx]}")
        
        result = {
            "prediction": CLASS_NAMES[predicted_class_idx],
            "confidence": float(confidence),
            "is_fire": CLASS_NAMES[predicted_class_idx] == "Fire"
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Email Configuration
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv
import os

# Robustly load .env file
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
    log_debug(f"Loaded .env from {env_path}")
else:
    log_debug(f"Warning: .env file not found at {env_path}")
    # Fallback to default load_dotenv which looks in current and parent dirs
    load_dotenv()

# Log loaded configuration (masking password)
mail_username = os.getenv('MAIL_USERNAME')
mail_server = os.getenv('MAIL_SERVER')
mail_port = os.getenv('MAIL_PORT')
log_debug(f"Email Config: User={mail_username}, Server={mail_server}, Port={mail_port}")

conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD'),
    MAIL_FROM = os.getenv('MAIL_FROM'),
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587)),
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com'),
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

class ContactSchema(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

@app.post("/contact")
async def send_contact_email(contact_data: ContactSchema):
    try:
        log_debug(f"Attempting to send email from: {os.getenv('MAIL_USERNAME')} to {contact_data.email}")
        
        # Verify credentials exist
        if not os.getenv('MAIL_USERNAME') or not os.getenv('MAIL_PASSWORD'):
            log_debug("Error: Missing MAIL_USERNAME or MAIL_PASSWORD in .env")
            raise HTTPException(status_code=500, detail="Server email configuration missing")

        message = MessageSchema(
            subject=f"New Contact Form Submission: {contact_data.subject}",
            recipients=[os.getenv('MAIL_USERNAME')], 
            body=f"""
            <h3>New Message from Sentinel AI Contact Form</h3>
            <p><strong>Name:</strong> {contact_data.name}</p>
            <p><strong>Email:</strong> {contact_data.email}</p>
            <p><strong>Subject:</strong> {contact_data.subject}</p>
            <p><strong>Message:</strong></p>
            <p>{contact_data.message}</p>
            """,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        log_debug("Email sent successfully")
        return JSONResponse(status_code=200, content={"message": "Email sent successfully"})
    except Exception as e:
        log_debug(f"Email sending failed: {str(e)}")
        # Return the actual error message for debugging (remove in production)
        return JSONResponse(status_code=500, content={"message": f"Failed to send email: {str(e)}"})

class AlertSchema(BaseModel):
    email: EmailStr
    prediction: str
    confidence: float
    filename: str
    timestamp: str

@app.post("/send-alert")
async def send_alert_email(alert_data: AlertSchema):
    try:
        log_debug(f"Sending fire alert to {alert_data.email}")
        
        message = MessageSchema(
            subject=f"🔥 CRITICAL ALERT: Fire Detected by Sentinel AI",
            recipients=[alert_data.email], 
            body=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #d9534f;">
                    <h1 style="color: #d9534f; margin: 0;">🔥 Fire Detected</h1>
                    <p style="color: #666; font-size: 16px;">Immediate attention required</p>
                </div>
                
                <div style="padding: 20px 0;">
                    <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
                    <p style="font-size: 16px; line-height: 1.5;">The Sentinel AI system has analyzed a recent satellite image and detected high-confidence fire signatures.</p>
                    
                    <div style="background-color: #fff5f5; border-left: 5px solid #d9534f; padding: 15px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Prediction:</strong> <span style="color: #d9534f; font-weight: bold;">{alert_data.prediction}</span></p>
                        <p style="margin: 5px 0;"><strong>Confidence:</strong> {alert_data.confidence * 100:.1f}%</p>
                        <p style="margin: 5px 0;"><strong>Source Image:</strong> {alert_data.filename}</p>
                        <p style="margin: 5px 0;"><strong>Time of Detection:</strong> {alert_data.timestamp}</p>
                        <p style="margin: 5px 0;"><strong>Status:</strong> CRITICAL</p>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.5;">Please take appropriate action immediately. Check the dashboard for more details.</p>
                </div>
                
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
                    <p>Sentinel AI Monitoring System</p>
                </div>
            </div>
            """,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        return JSONResponse(status_code=200, content={"message": "Alert email sent"})
    except Exception as e:
        log_debug(f"Alert email failed: {str(e)}")
        return JSONResponse(status_code=500, content={"message": str(e)})

@app.post("/send-report")
async def send_report_email(alert_data: AlertSchema):
    try:
        log_debug(f"Sending analysis report to {alert_data.email}")
        
        message = MessageSchema(
            subject=f"📄 Analysis Report: {alert_data.filename}",
            recipients=[alert_data.email], 
            body=f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2c3e50;">
                    <h1 style="color: #2c3e50; margin: 0;">Analysis Report</h1>
                    <p style="color: #666; font-size: 16px;">Requested by User</p>
                </div>
                
                <div style="padding: 20px 0;">
                    <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
                    <p style="font-size: 16px; line-height: 1.5;">Here is the detailed report for the satellite image analysis you requested.</p>
                    
                    <div style="background-color: #f8f9fa; border-left: 5px solid #2c3e50; padding: 15px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Source Image:</strong> {alert_data.filename}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> {alert_data.timestamp}</p>
                        <hr style="border: 0; border-top: 1px solid #ddd; margin: 10px 0;">
                        <p style="margin: 5px 0;"><strong>Prediction:</strong> <strong style="color: {'#d9534f' if alert_data.prediction == 'Fire' else '#4CAF50'}">{alert_data.prediction}</strong></p>
                        <p style="margin: 5px 0;"><strong>Confidence:</strong> {alert_data.confidence * 100:.1f}%</p>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.5;">Thank you for using Sentinel AI.</p>
                </div>
                
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 12px;">
                    <p>Sentinel AI Monitoring System</p>
                </div>
            </div>
            """,
            subtype=MessageType.html
        )

        fm = FastMail(conf)
        await fm.send_message(message)
        return JSONResponse(status_code=200, content={"message": "Report email sent"})
    except Exception as e:
        log_debug(f"Report email failed: {str(e)}")
        return JSONResponse(status_code=500, content={"message": str(e)})

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

@app.get("/")
async def read_index():
    return FileResponse('index.html')



if __name__ == "__main__":
    import uvicorn
    print("Starting server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
