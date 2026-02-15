
import  torch
import  sys
import  os

#  Add  src  to  path  to  load  model  class
sys.path.insert(0,  './src')
from  model  import  ForestFirePredictor

def  check_model():
        model_path  =  os.path.join('models',  'forest_fire_model.pth')
        if  not  os.path.exists(model_path):
                print(f"Model  not  found  at  {model_path}")
                return

        device  =  torch.device("cuda"  if  torch.cuda.is_available()  else  "cpu")
        try:
                model  =  ForestFirePredictor()
                checkpoint  =  torch.load(model_path,  map_location=device)
                
                #  Check  if  class  names  are  stored  in  checkpoint
                if  'class_names'  in  checkpoint:
                        print(f"Classes  in  checkpoint:  {checkpoint['class_names']}")
                else:
                        print("No  explicit  class_names  found  in  checkpoint.")
                
                #  Sometimes  it's  stored  in  classifier
                print("Model  structure  loaded  successfully.")
                
        except  Exception  as  e:
                print(f"Error  loading  model:  {e}")

if  __name__  ==  "__main__":
        check_model()
