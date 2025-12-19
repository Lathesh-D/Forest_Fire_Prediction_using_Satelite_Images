import os
import torch
from torchvision import transforms
from torch.utils.data import Dataset, DataLoader, random_split
from PIL import Image

class ForestFireDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.image_paths = []
        self.labels = [] # 0 for no fire, 1 for fire

        fire_dir = os.path.join(root_dir, 'Fire')
        no_fire_dir = os.path.join(root_dir, 'No_Fire')

        # Load fire images
        if os.path.exists(fire_dir):
            for img_name in os.listdir(fire_dir):
                self.image_paths.append(os.path.join(fire_dir, img_name))
                self.labels.append(1) # Label 1 for fire

        # Load no-fire images
        if os.path.exists(no_fire_dir):
            for img_name in os.listdir(no_fire_dir):
                self.image_paths.append(os.path.join(no_fire_dir, img_name))
                self.labels.append(0) # Label 0 for no fire

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        try:
            image = Image.open(img_path).convert('RGB')
        except OSError as e:
            print(f"Warning: Could not load image {img_path}. Skipping. Error: {e}")
            return None, None # Return None for both image and label

        label = self.labels[idx]

        if self.transform:
            image = self.transform(image)

        return image, label

def collate_fn_with_filter(batch):
    # Filter out None values (corrupted images)
    batch = [(img, label) for img, label in batch if img is not None and label is not None]
    if not batch: # If all images in batch were corrupted
        # Return empty tensors that can be handled by the training loop
        # (e.g., skip the batch or handle it as an empty batch)
        return torch.tensor([]), torch.tensor([]) 
    
    # Default collate behavior for the filtered batch
    return torch.utils.data.dataloader.default_collate(batch)

# Define data transformations
data_transforms = transforms.Compose([
    transforms.Resize((224, 224)), # Resize all images to 224x224
    transforms.ToTensor(),         # Convert images to PyTorch tensors
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]) # ImageNet normalization
])

# Function to load and split data
def load_and_split_data(data_dir, batch_size=32, train_split=0.7, val_split=0.15, test_split=0.15, shuffle=True):
    dataset = ForestFireDataset(root_dir=data_dir, transform=data_transforms)
    
    # Calculate lengths for each split
    total_len = len(dataset)
    train_len = int(train_split * total_len)
    val_len = int(val_split * total_len)
    test_len = total_len - train_len - val_len # Ensure all data is used
    
    print(f"Total dataset size: {total_len}")
    print(f"Training set size: {train_len}")
    print(f"Validation set size: {val_len}")
    print(f"Test set size: {test_len}")

    # Split the dataset
    train_dataset, val_dataset, test_dataset = random_split(
        dataset, [train_len, val_len, test_len], generator=torch.Generator().manual_seed(42)
    )

    # Create DataLoaders for each split
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=shuffle, collate_fn=collate_fn_with_filter)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, collate_fn=collate_fn_with_filter) # No need to shuffle validation
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, collate_fn=collate_fn_with_filter) # No need to shuffle test

    print(f"Loaded {len(dataset)} images from {data_dir}")
    return train_loader, val_loader, test_loader

if __name__ == '__main__':
    # Example usage:
    DATA_DIR = 'data' # This should be the path to your extracted dataset
    if not os.path.exists(DATA_DIR):
        print(f"Error: Data directory '{DATA_DIR}' not found. Please download and extract the dataset.")
    else:
        print(f"Attempting to load and split data from {DATA_DIR}...")
        try:
            train_dl, val_dl, test_dl = load_and_split_data(DATA_DIR, batch_size=4)
            
            print("---Training Data Sample ---")
            for i, (images, labels) in enumerate(train_dl):
                print(f"Batch {i}: Images shape: {images.shape}, Labels: {labels}")
                if i == 0: break # Print first batch as example
            
            print("---Validation Data Sample ---")
            for i, (images, labels) in enumerate(val_dl):
                print(f"Batch {i}: Images shape: {images.shape}, Labels: {labels}")
                if i == 0: break # Print first batch as example
            
            print("---Test Data Sample ---")
            for i, (images, labels) in enumerate(test_dl):
                print(f"Batch {i}: Images shape: {images.shape}, Labels: {labels}")
                if i == 0: break # Print first batch as example

        except Exception as e:
            print(f"An error occurred while loading or splitting data: {e}")

