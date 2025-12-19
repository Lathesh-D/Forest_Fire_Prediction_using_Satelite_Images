import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from src.model import ForestFirePredictor
from src.data_preprocessing import load_and_split_data, ForestFireDataset, data_transforms
import os

def train_model(model, train_loader, val_loader, criterion, optimizer, num_epochs=10, device='cpu'):
    model.to(device)
    
    for epoch in range(num_epochs):
        model.train() # Set model to training mode
        running_loss = 0.0
        correct_train = 0
        total_train = 0

        for i, (inputs, labels) in enumerate(train_loader):
            if inputs.size(0) == 0:  # Skip empty batches
                continue
            inputs, labels = inputs.to(device), labels.to(device)

            # Zero the parameter gradients
            optimizer.zero_grad()

            # Forward pass
            outputs = model(inputs)
            loss = criterion(outputs, labels)

            # Backward pass and optimize
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            _, predicted = torch.max(outputs.data, 1)
            total_train += labels.size(0)
            correct_train += (predicted == labels).sum().item()

        epoch_loss = running_loss / len(train_loader.dataset)
        epoch_acc = correct_train / total_train
        print(f"Epoch {epoch+1}/{num_epochs} - Training Loss: {epoch_loss:.4f}, Training Acc: {epoch_acc:.4f}")

        # Validation phase
        model.eval() # Set model to evaluation mode
        val_loss = 0.0
        correct_val = 0
        total_val = 0
        with torch.no_grad(): # Disable gradient calculation for validation
            for inputs, labels in val_loader:
                if inputs.size(0) == 0:  # Skip empty batches
                    continue
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item() * inputs.size(0)
                _, predicted = torch.max(outputs.data, 1)
                total_val += labels.size(0)
                correct_val += (predicted == labels).sum().item()
        
        val_epoch_loss = val_loss / len(val_loader.dataset)
        val_epoch_acc = correct_val / total_val
        print(f"Epoch {epoch+1}/{num_epochs} - Validation Loss: {val_epoch_loss:.4f}, Validation Acc: {val_epoch_acc:.4f}\n")
    
    print("Finished Training")

def evaluate_model(model, test_loader, device='cpu'):
    model.to(device)
    model.eval() # Set model to evaluation mode
    correct = 0
    total = 0
    with torch.no_grad():
        for inputs, labels in test_loader:
            if inputs.size(0) == 0:  # Skip empty batches
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
    # Configuration
    DATA_DIR = 'data'
    BATCH_SIZE = 32
    NUM_EPOCHS = 10 # You can adjust the number of epochs
    LEARNING_RATE = 0.001

    # Check for GPU
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Load and split data
    if not os.path.exists(DATA_DIR):
        print(f"Error: Data directory '{DATA_DIR}' not found. Please download and extract the dataset.")
    else:
        print("Loading and splitting data...")
        train_loader, val_loader, test_loader = load_and_split_data(
            DATA_DIR, 
            batch_size=BATCH_SIZE, 
            train_split=0.7, 
            val_split=0.15, 
            test_split=0.15, 
            shuffle=True
        )

        # Instantiate model
        model = ForestFirePredictor()

        # Define loss function and optimizer
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

        # Train the model
        print("Starting model training...")
        train_model(model, train_loader, val_loader, criterion, optimizer, NUM_EPOCHS, device)

        # Evaluate the model
        print("\nEvaluating model on the test set...")
        evaluate_model(model, test_loader, device)

        # Save the trained model
        MODEL_SAVE_PATH = os.path.join('models', 'forest_fire_model.pth')
        torch.save(model.state_dict(), MODEL_SAVE_PATH)
        print(f"Model saved to {MODEL_SAVE_PATH}")

