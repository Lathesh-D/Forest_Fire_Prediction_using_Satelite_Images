import torch
import os
import sys

sys.path.insert(0, './src')

from model import ForestFirePredictor
from data_preprocessing import ForestFireDataset, data_transforms

def evaluate_model(model, test_loader, device='cpu'):
    model.to(device)
    model.eval()
    correct = 0
    total = 0
    with torch.no_grad():
        for inputs, labels in test_loader:
            if inputs.size(0) == 0:
                continue
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, predicted = torch.max(outputs.data, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    accuracy = correct / total
    print(f"Accuracy of the model on the test images: {100 * accuracy:.2f}%")
    return accuracy

if __name__ == '__main__':
    DATA_DIR = 'data'
    MODEL_PATH = os.path.join('models', 'forest_fire_model.pth')
    BATCH_SIZE = 32

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    if not os.path.exists(DATA_DIR):
        print(f"Error: Data directory '{DATA_DIR}' not found.")
    else:
        print("Loading all data...")
        all_dataset = ForestFireDataset(DATA_DIR, transform=data_transforms)
        all_loader = torch.utils.data.DataLoader(all_dataset, batch_size=BATCH_SIZE, shuffle=False)
        print(f"Loaded {len(all_dataset)} images from data")

        model = ForestFirePredictor()
        if os.path.exists(MODEL_PATH):
            model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
            print("Model loaded successfully!")
        else:
            print(f"Error: Model file not found at {MODEL_PATH}")
            sys.exit(1)

        print("Evaluating model on all images...")
        evaluate_model(model, all_loader, device)