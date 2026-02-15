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

app = FastAPI(title="Forest Fire Sentinel API", description="API for detecting forest fires from satellite images.")

MODEL_PATH = os.path.join('models', 'forest_fire_model.pth')
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

model = None

@app.on_event("startup")
def startup_event():
    auth.init_db()
    load_model_logic()

def load_model_logic():
    global model
    print(f"Loading model from {MODEL_PATH}...")
    try:
        model_instance = ForestFirePredictor()
        if os.path.exists(MODEL_PATH):
            model_instance.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
            model_instance.to(DEVICE)
            model_instance.eval()
            model = model_instance
            print("Model loaded successfully!")
        else:
            print(f"Error: Model file not found at {MODEL_PATH}.")
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
        return {"message": "Login successful", "username": user.username}
    else:
        log_debug("Login failed: Invalid credentials")
        raise HTTPException(status_code=401, detail="Invalid credentials")

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
        
        result = {
            "prediction": CLASS_NAMES[predicted_class_idx],
            "confidence": float(confidence),
            "is_fire": CLASS_NAMES[predicted_class_idx] == "Fire"
        }
        return JSONResponse(content=result)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

@app.get("/")
async def read_index():
    return FileResponse('index.html')

if __name__ == "__main__":
    import uvicorn
    print("Starting server on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
