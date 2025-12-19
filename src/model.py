import torch
import torch.nn as nn
import torch.nn.functional as F

class ForestFirePredictor(nn.Module):
    def __init__(self):
        super(ForestFirePredictor, self).__init__()
        # First convolutional block
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.pool1 = nn.MaxPool2d(kernel_size=2, stride=2) # Output: (32, 112, 112)

        # Second convolutional block
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.pool2 = nn.MaxPool2d(kernel_size=2, stride=2) # Output: (64, 56, 56)

        # Third convolutional block
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        self.pool3 = nn.MaxPool2d(kernel_size=2, stride=2) # Output: (128, 28, 28)

        # Fourth convolutional block
        self.conv4 = nn.Conv2d(128, 256, kernel_size=3, padding=1)
        self.bn4 = nn.BatchNorm2d(256)
        self.pool4 = nn.MaxPool2d(kernel_size=2, stride=2) # Output: (256, 14, 14)
        
        # Fifth convolutional block
        self.conv5 = nn.Conv2d(256, 512, kernel_size=3, padding=1)
        self.bn5 = nn.BatchNorm2d(512)
        self.pool5 = nn.MaxPool2d(kernel_size=2, stride=2) # Output: (512, 7, 7)

        # Flatten layer
        self.flatten = nn.Flatten()

        # Fully connected layers
        # The input features to the first linear layer will be 512 * 7 * 7
        self.fc1 = nn.Linear(512 * 7 * 7, 512)
        self.dropout = nn.Dropout(0.5)
        self.fc2 = nn.Linear(512, 2) # Output 2 classes: Fire (1) or No Fire (0)

    def forward(self, x):
        # Apply convolutional blocks
        x = self.pool1(F.relu(self.bn1(self.conv1(x))))
        x = self.pool2(F.relu(self.bn2(self.conv2(x))))
        x = self.pool3(F.relu(self.bn3(self.conv3(x))))
        x = self.pool4(F.relu(self.bn4(self.conv4(x))))
        x = self.pool5(F.relu(self.bn5(self.conv5(x))))

        # Flatten the output for the fully connected layers
        x = self.flatten(x)

        # Apply fully connected layers
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x

if __name__ == '__main__':
    # Example usage:
    model = ForestFirePredictor()
    print(model)

    # Create a dummy input tensor (batch_size, channels, height, width)
    # Our images are 224x224 with 3 color channels (RGB)
    dummy_input = torch.randn(1, 3, 224, 224) 
    
    # Pass the dummy input through the model
    output = model(dummy_input)
    print(f"\nOutput shape: {output.shape}")
    print(f"Output (logits): {output}")

    # For binary classification, typically you'd apply softmax or sigmoid to logits
    # For a 2-class problem with CrossEntropyLoss, raw logits are often used directly
    print(f"Predicted class (example with argmax): {torch.argmax(output, dim=1)}")

